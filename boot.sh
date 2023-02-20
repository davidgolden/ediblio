#!/bin/sh
echo "Waiting for database to be ready..."

attempt=0
max_attempts=5

while pg_isready --dbname=${DATABASE_URL} -q; status=$?; attempt=$((attempt+1)); [ $status -ne 0 ] && [ $attempt -le $max_attempts ]; do
      sleep 5
  done

if [ $attempt -gt $max_attempts ]; then
    echo -e "\nDatabase not reachable. Maximum attempts exceeded."
    echo "Please check logs above - misconfiguration is very likely."
    echo "Make sure the DB container is up and POSTGRES_HOST is set properly."
    echo "Shutting down container."
    exit 1 # exit with error to make the container stop
fi

echo "Database is ready"

echo "Migrating database"

prisma migrate deploy

npm run start