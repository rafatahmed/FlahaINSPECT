#!/bin/sh
# Create the single private bucket used for photos/, thumbs/, reports/, uploads/.
# Anonymous GET is explicitly disabled (KD private buckets). Versioning on (ops checklist).
set -eu

: "${MINIO_ROOT_USER:?}"
: "${MINIO_ROOT_PASSWORD:?}"
: "${S3_BUCKET:?}"

echo "waiting for MinIO..."
i=0
until mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"; do
  i=$((i + 1))
  if [ "$i" -gt 30 ]; then
    echo "minio never became reachable" >&2
    exit 1
  fi
  sleep 1
done

mc mb --ignore-existing "local/${S3_BUCKET}"
mc anonymous set none "local/${S3_BUCKET}"
mc version enable "local/${S3_BUCKET}"
mc anonymous get "local/${S3_BUCKET}" || true

echo "bucket ${S3_BUCKET}: private (anonymous none), versioning enabled"
