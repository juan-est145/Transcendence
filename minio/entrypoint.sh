#!/bin/bash
set -e

# Start MinIO in the background
minio server /data --console-address ":9001" -S /etc/ssl/certs &
MINIO_PID=$!

# Wait for MinIO to be ready
until curl -Isfk https://localhost:9000/minio/health/live 1>/dev/null; do
  sleep 1
done

# Add user
mc alias set local https://localhost:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" --insecure
mc admin user add local "${MINIO_NODE_USER}" "${MINIO_NODE_PASSWORD}"
mc admin policy attach local readwrite --user "${MINIO_NODE_USER}"

# Bring MinIO to foreground
wait $MINIO_PID