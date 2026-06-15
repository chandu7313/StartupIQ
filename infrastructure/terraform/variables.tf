# ─────────────────────────────────────────────────────────────
# Core
# ─────────────────────────────────────────────────────────────
variable "environment" {
  description = "Deployment environment: staging or production"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be 'staging' or 'production'."
  }
}

variable "aws_region" {
  description = "AWS region (Mumbai for India latency)"
  type        = string
  default     = "ap-south-1"
}

variable "app_name" {
  description = "Application slug used in resource naming"
  type        = string
  default     = "startupsaarthi"
}

# ─────────────────────────────────────────────────────────────
# Networking
# ─────────────────────────────────────────────────────────────
variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "AZs to deploy into"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDRs for public subnets (ALB)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs for private subnets (EC2, RDS)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

# ─────────────────────────────────────────────────────────────
# Compute
# ─────────────────────────────────────────────────────────────
variable "ec2_instance_type" {
  description = "EC2 instance type per environment"
  type        = map(string)
  default = {
    staging    = "t3.medium"
    production = "t3.large"
  }
}

variable "ec2_ami" {
  description = "Amazon Linux 2023 AMI ID (ap-south-1)"
  type        = string
  default     = "ami-0f58b397bc5c1f2e8"  # Amazon Linux 2023 in ap-south-1
}

variable "key_pair_name" {
  description = "EC2 Key Pair name for SSH access"
  type        = string
  default     = "startupsaarthi-keypair"
}

variable "asg_min_size" {
  description = "ASG minimum instance count"
  type        = number
  default     = 1
}

variable "asg_max_size" {
  description = "ASG maximum instance count"
  type        = number
  default     = 3
}

variable "asg_cpu_target" {
  description = "Target CPU utilisation % for ASG scaling policy"
  type        = number
  default     = 70
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "startupsaarthi.com"
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for HTTPS listener"
  type        = string
}

# ─────────────────────────────────────────────────────────────
# Database
# ─────────────────────────────────────────────────────────────
variable "db_instance_class" {
  description = "RDS instance class per environment"
  type        = map(string)
  default = {
    staging    = "db.t3.micro"
    production = "db.t3.small"
  }
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "startupsaarthi"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "ssadmin"
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL master password (from AWS Secrets Manager — never hardcode)"
  type        = string
  sensitive   = true
}

variable "db_backup_retention_days" {
  description = "Automated backup retention in days"
  type        = number
  default     = 7
}

# ─────────────────────────────────────────────────────────────
# Cache
# ─────────────────────────────────────────────────────────────
variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

# ─────────────────────────────────────────────────────────────
# Storage
# ─────────────────────────────────────────────────────────────
variable "s3_reports_bucket" {
  description = "S3 bucket name for report PDF exports"
  type        = string
  default     = "startupsaarthi-reports"
}
