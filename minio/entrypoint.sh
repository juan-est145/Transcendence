#!/bin/bash
set -e

# The arguments to pass to the MinIO startup command. If in prod mode, it enters the if statement
start=(server /data --console-address ":9001" -S /etc/ssl/certs)
if [[ $# -gt 0 && "$1" == "prod" ]]; then
  start=(server /data --anonymous --quiet --console-address ":9001" -S /etc/ssl/certs)
fi

# Start MinIO in the background
minio "${start[@]}" &
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