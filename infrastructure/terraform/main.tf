terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }

  # ── Remote state: S3 + DynamoDB locking ──────────────────
  backend "s3" {
    bucket         = "startupsaarthi-terraform-state"
    key            = "infra/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "startupsaarthi-terraform-locks"
    profile        = "startupsaarthi"
  }
}

provider "aws" {
  region  = var.aws_region
  profile = "startupsaarthi"

  default_tags {
    tags = {
      Project     = "startupsaarthi"
      ManagedBy   = "Terraform"
      Environment = var.environment
      Repository  = "github.com/chandu7313/Startup-Validator"
    }
  }
}

# ── Bootstrap: create S3 state bucket + DynamoDB lock table ──
# Run once manually before `terraform init`:
#
#   aws s3api create-bucket \
#     --bucket startupsaarthi-terraform-state \
#     --region ap-south-1 \
#     --create-bucket-configuration LocationConstraint=ap-south-1
#
#   aws s3api put-bucket-versioning \
#     --bucket startupsaarthi-terraform-state \
#     --versioning-configuration Status=Enabled
#
#   aws dynamodb create-table \
#     --table-name startupsaarthi-terraform-locks \
#     --attribute-definitions AttributeName=LockID,AttributeType=S \
#     --key-schema AttributeName=LockID,KeyType=HASH \
#     --billing-mode PAY_PER_REQUEST \
#     --region ap-south-1
