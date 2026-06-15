locals {
  rds_instance_class = var.db_instance_class[var.environment]
  rds_multi_az       = var.environment == "production"
}

# ─────────────────────────────────────────────────────────────
# DB Subnet Group
# ─────────────────────────────────────────────────────────────
resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "${local.name_prefix}-db-subnet-group" }
}

# ─────────────────────────────────────────────────────────────
# Parameter Group
# ─────────────────────────────────────────────────────────────
resource "aws_db_parameter_group" "postgres15" {
  name   = "${local.name_prefix}-pg15-params"
  family = "postgres15"

  parameter {
    name  = "max_connections"
    value = "100"
  }
  parameter {
    name  = "shared_buffers"
    value = "262144"   # 256MB in 8KB pages
  }
  parameter {
    name  = "log_min_duration_statement"
    value = "1000"     # log queries > 1s
  }
  parameter {
    name  = "log_connections"
    value = "1"
  }
  parameter {
    name  = "pg_stat_statements.track"
    value = "all"
    apply_method = "pending-reboot"
  }

  tags = { Name = "${local.name_prefix}-pg15-params" }
}

# ─────────────────────────────────────────────────────────────
# RDS PostgreSQL 15
# ─────────────────────────────────────────────────────────────
resource "aws_db_instance" "postgres" {
  identifier     = "${local.name_prefix}-postgres"
  engine         = "postgres"
  engine_version = "15.6"

  instance_class        = local.rds_instance_class
  allocated_storage     = 20
  max_allocated_storage = 100    # Enable autoscaling up to 100GB
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.postgres15.name

  multi_az               = local.rds_multi_az
  publicly_accessible    = false

  backup_retention_period = var.db_backup_retention_days
  backup_window           = "02:00-03:00"    # 2-3 AM UTC = 7:30-8:30 AM IST
  maintenance_window      = "sun:04:00-sun:05:00"

  deletion_protection     = var.environment == "production"
  skip_final_snapshot     = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "${local.name_prefix}-final-snapshot" : null

  performance_insights_enabled = true
  monitoring_interval          = 60
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = { Name = "${local.name_prefix}-postgres" }
}
