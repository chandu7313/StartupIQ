locals {
  instance_type = var.ec2_instance_type[var.environment]
}

# ─────────────────────────────────────────────────────────────
# IAM Role for EC2 (SSM + ECR + S3 access)
# ─────────────────────────────────────────────────────────────
resource "aws_iam_role" "ec2_role" {
  name = "${local.name_prefix}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  tags = { Name = "${local.name_prefix}-ec2-role" }
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "ecr" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy" "s3_reports" {
  name = "${local.name_prefix}-s3-reports-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
      Resource = "arn:aws:s3:::${var.s3_reports_bucket}/*"
    }]
  })
}

resource "aws_iam_role_policy" "secrets_manager" {
  name = "${local.name_prefix}-secrets-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = "arn:aws:secretsmanager:${var.aws_region}:*:secret:${local.name_prefix}/*"
    }]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${local.name_prefix}-instance-profile"
  role = aws_iam_role.ec2_role.name
}

# ─────────────────────────────────────────────────────────────
# Launch Template with user_data
# ─────────────────────────────────────────────────────────────
resource "aws_launch_template" "app" {
  name_prefix   = "${local.name_prefix}-lt-"
  image_id      = var.ec2_ami
  instance_type = local.instance_type
  key_name      = var.key_pair_name

  iam_instance_profile { name = aws_iam_instance_profile.ec2_profile.name }

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.ec2.id]
    delete_on_termination       = true
  }

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 30
      volume_type           = "gp3"
      encrypted             = true
      delete_on_termination = true
    }
  }

  monitoring { enabled = true }

  user_data = base64encode(templatefile("${path.module}/userdata.sh", {
    environment    = var.environment
    app_name       = var.app_name
    aws_region     = var.aws_region
    ecr_registry   = aws_ecr_repository.api.registry_id
  }))

  tag_specifications {
    resource_type = "instance"
    tags          = { Name = "${local.name_prefix}-ec2" }
  }

  lifecycle { create_before_destroy = true }
}

# ─────────────────────────────────────────────────────────────
# Application Load Balancer
# ─────────────────────────────────────────────────────────────
resource "aws_lb" "main" {
  name               = "${local.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = var.environment == "production"
  enable_http2               = true

  access_logs {
    bucket  = aws_s3_bucket.reports.bucket
    prefix  = "alb-logs"
    enabled = true
  }

  tags = { Name = "${local.name_prefix}-alb" }
}

# HTTP → HTTPS redirect
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS listener with ACM cert
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.acm_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# Route /api/* to API target group
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10

  condition {
    path_pattern { values = ["/api/*", "/socket.io/*"] }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# ─────────────────────────────────────────────────────────────
# Target Groups
# ─────────────────────────────────────────────────────────────
resource "aws_lb_target_group" "web" {
  name     = "${local.name_prefix}-tg-web"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/api/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  tags = { Name = "${local.name_prefix}-tg-web" }
}

resource "aws_lb_target_group" "api" {
  name     = "${local.name_prefix}-tg-api"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  tags = { Name = "${local.name_prefix}-tg-api" }
}

# ─────────────────────────────────────────────────────────────
# Auto Scaling Group
# ─────────────────────────────────────────────────────────────
resource "aws_autoscaling_group" "app" {
  name                = "${local.name_prefix}-asg"
  min_size            = var.asg_min_size
  max_size            = var.asg_max_size
  desired_capacity    = var.asg_min_size
  vpc_zone_identifier = aws_subnet.private[*].id
  target_group_arns   = [aws_lb_target_group.web.arn, aws_lb_target_group.api.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 120

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
    }
  }

  tag {
    key                 = "Name"
    value               = "${local.name_prefix}-asg-instance"
    propagate_at_launch = true
  }

  lifecycle { create_before_destroy = true }
}

# CPU-based target tracking scaling policy
resource "aws_autoscaling_policy" "cpu_target" {
  name                   = "${local.name_prefix}-cpu-target-policy"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = var.asg_cpu_target
  }
}
