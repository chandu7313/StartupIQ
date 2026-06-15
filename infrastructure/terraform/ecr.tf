locals {
  ecr_repos = ["web", "api", "workers"]
}

# ─────────────────────────────────────────────────────────────
# ECR Repositories
# ─────────────────────────────────────────────────────────────
resource "aws_ecr_repository" "web" {
  name                 = "${var.app_name}/web"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.environment != "production"

  image_scanning_configuration { scan_on_push = true }

  encryption_configuration { encryption_type = "AES256" }

  tags = { Name = "${var.app_name}/web" }
}

resource "aws_ecr_repository" "api" {
  name                 = "${var.app_name}/api"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.environment != "production"

  image_scanning_configuration { scan_on_push = true }

  encryption_configuration { encryption_type = "AES256" }

  tags = { Name = "${var.app_name}/api" }
}

resource "aws_ecr_repository" "workers" {
  name                 = "${var.app_name}/workers"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.environment != "production"

  image_scanning_configuration { scan_on_push = true }

  encryption_configuration { encryption_type = "AES256" }

  tags = { Name = "${var.app_name}/workers" }
}

# ─────────────────────────────────────────────────────────────
# Lifecycle Policies (keep last 10 images per repo)
# ─────────────────────────────────────────────────────────────
locals {
  ecr_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v", "sha-"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Remove untagged images after 1 day"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = { type = "expire" }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "web"     { repository = aws_ecr_repository.web.name;     policy = local.ecr_lifecycle_policy }
resource "aws_ecr_lifecycle_policy" "api"     { repository = aws_ecr_repository.api.name;     policy = local.ecr_lifecycle_policy }
resource "aws_ecr_lifecycle_policy" "workers" { repository = aws_ecr_repository.workers.name; policy = local.ecr_lifecycle_policy }
