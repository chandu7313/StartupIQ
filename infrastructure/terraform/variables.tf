variable "aws_region" {
  description = "AWS region for deployment"
  default     = "ap-south-1"
}

variable "admin_ip" {
  description = "IP address allowed for SSH access"
  type        = string
}

variable "key_name" {
  description = "Name of the SSH key pair"
  type        = string
}
