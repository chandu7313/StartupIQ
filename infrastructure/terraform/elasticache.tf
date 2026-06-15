# ─────────────────────────────────────────────────────────────
# ElastiCache Subnet Group
# ─────────────────────────────────────────────────────────────
resource "aws_elasticache_subnet_group" "main" {
  name       = "${local.name_prefix}-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "${local.name_prefix}-redis-subnet-group" }
}

# ─────────────────────────────────────────────────────────────
# ElastiCache Parameter Group (Redis 7)
# ─────────────────────────────────────────────────────────────
resource "aws_elasticache_parameter_group" "redis7" {
  name   = "${local.name_prefix}-redis7-params"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"    # Evict least-recently-used keys when full
  }
  parameter {
    name  = "notify-keyspace-events"
    value = "Ex"             # Publish key-expiry events (for cache TTL callbacks)
  }

  tags = { Name = "${local.name_prefix}-redis7-params" }
}

# ─────────────────────────────────────────────────────────────
# ElastiCache Redis Cluster (single node, cluster mode off)
# ─────────────────────────────────────────────────────────────
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${local.name_prefix}-redis"
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  port                 = 6379
  parameter_group_name = aws_elasticache_parameter_group.redis7.name
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]

  snapshot_retention_limit = 1     # Keep 1 daily snapshot
  snapshot_window          = "01:00-02:00"  # 1-2 AM UTC = 6:30-7:30 AM IST

  apply_immediately = var.environment != "production"

  tags = { Name = "${local.name_prefix}-redis" }
}
