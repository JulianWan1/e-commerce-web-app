# Use the official Redis image based on Alpine Linux
FROM redis:alpine

# Copy Redis configuration file
COPY cache/redis.conf /etc/redis/redis.conf

# Create directory for Redis logs, allow read, write & execute permissions for all users (owner, group, others)
# RUN mkdir -p /var/log/redis && chmod 777 /var/log/redis
# RUN touch /var/log/redis/redis.log && chmod 777 /var/log/redis/redis.log

# Create Redis collections (hashes)
RUN redis-server /etc/redis/redis.conf --daemonize yes && \
    redis-cli hset access_tokens sample_access_token '{"user_id": "123456", "created_at": "2023-04-17T10:30:00", "expires_at": "2023-04-17T11:30:00"}' && \
    redis-cli hset refresh_tokens sample_refresh_token '{"user_id": "123456", "created_at": "2023-04-17T10:30:00", "expires_at": "2023-04-17T11:30:00"}' && \
    redis-cli hset revoked_access_tokens sample_revoked_access_token '{"user_id": "123456", "created_at": "2023-04-17T10:30:00", "expires_at": "2023-04-17T11:30:00"}' && \
    redis-cli hset revoked_refresh_tokens sample_revoked_refresh_token '{"user_id": "123456", "created_at": "2023-04-17T10:30:00", "expires_at": "2023-04-17T11:30:00"}' && \
    redis-cli save && \
    redis-cli shutdown

# Expose Redis port
EXPOSE 6379

# Start Redis with the configured Redis configuration file
CMD ["redis-server", "/etc/redis/redis.conf"]
