# ─────────────────────────────────────────────────────────────
# Networking
# ─────────────────────────────────────────────────────────────
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs (ALB)"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs (EC2, RDS)"
  value       = aws_subnet.private[*].id
}

# ─────────────────────────────────────────────────────────────
# Compute
# ─────────────────────────────────────────────────────────────
output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB hosted zone ID (for Route 53 alias records)"
  value       = aws_lb.main.zone_id
}

output "asg_name" {
  description = "Auto Scaling Group name"
  value       = aws_autoscaling_group.app.name
}

# ─────────────────────────────────────────────────────────────
# Database
# ─────────────────────────────────────────────────────────────
output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host:port)"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "rds_database_name" {
  description = "PostgreSQL database name"
  value       = aws_db_instance.postgres.db_name
}

# ─────────────────────────────────────────────────────────────
# Cache
# ─────────────────────────────────────────────────────────────
output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
  sensitive   = true
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].port
}

# ─────────────────────────────────────────────────────────────
# Storage
# ─────────────────────────────────────────────────────────────
output "s3_reports_bucket" {
  description = "S3 bucket name for report exports"
  value       = aws_s3_bucket.reports.bucket
}

output "s3_reports_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.reports.arn
}

# ─────────────────────────────────────────────────────────────
# ECR
# ─────────────────────────────────────────────────────────────
output "ecr_web_url" {
  description = "ECR repository URL — web"
  value       = aws_ecr_repository.web.repository_url
}

output "ecr_api_url" {
  description = "ECR repository URL — api"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_workers_url" {
  description = "ECR repository URL — workers"
  value       = aws_ecr_repository.workers.repository_url
}

output "ecr_registry_id" {
  description = "ECR registry ID (AWS account ID)"
  value       = aws_ecr_repository.api.registry_id
}
