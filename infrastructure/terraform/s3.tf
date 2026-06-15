# ─────────────────────────────────────────────────────────────
# S3 Bucket — Report PDF Exports
# ─────────────────────────────────────────────────────────────
resource "aws_s3_bucket" "reports" {
  bucket = "${var.s3_reports_bucket}-${var.environment}"

  tags = { Name = "${var.s3_reports_bucket}-${var.environment}" }
}

resource "aws_s3_bucket_versioning" "reports" {
  bucket = aws_s3_bucket.reports.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "reports" {
  bucket = aws_s3_bucket.reports.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block ALL public access — objects served via pre-signed URLs only
resource "aws_s3_bucket_public_access_block" "reports" {
  bucket                  = aws_s3_bucket.reports.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ─────────────────────────────────────────────────────────────
# Bucket Policy: EC2 IAM role access + deny non-HTTPS
# ─────────────────────────────────────────────────────────────
resource "aws_s3_bucket_policy" "reports" {
  bucket = aws_s3_bucket.reports.id
  depends_on = [aws_s3_bucket_public_access_block.reports]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowEC2RoleAccess"
        Effect    = "Allow"
        Principal = { AWS = aws_iam_role.ec2_role.arn }
        Action    = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource  = "${aws_s3_bucket.reports.arn}/*"
      },
      {
        Sid       = "DenyNonHTTPS"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource  = [aws_s3_bucket.reports.arn, "${aws_s3_bucket.reports.arn}/*"]
        Condition = {
          Bool = { "aws:SecureTransport" = "false" }
        }
      }
    ]
  })
}

# ─────────────────────────────────────────────────────────────
# Lifecycle Rules
# ─────────────────────────────────────────────────────────────
resource "aws_s3_bucket_lifecycle_configuration" "reports" {
  bucket = aws_s3_bucket.reports.id

  rule {
    id     = "move-to-glacier"
    status = "Enabled"

    filter { prefix = "reports/" }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365    # Hard delete after 1 year
    }
  }

  rule {
    id     = "clean-incomplete-uploads"
    status = "Enabled"
    filter {}
    abort_incomplete_multipart_upload { days_after_initiation = 7 }
  }
}
