#!/bin/bash
# Runs once, on first boot of an empty data volume.
# Restores the most recent pg_dump (custom format) found in /backup, if any.
set -e

DB_FOLDER="/backup"
LATEST_DB_FILE=$(ls -t "$DB_FOLDER" 2>/dev/null | grep -v '^\.gitkeep$' | head -1 || true)
if [ -n "${LATEST_DB_FILE}" ]; then
    echo "Restoring $DB_FOLDER/$LATEST_DB_FILE into $POSTGRES_DB"
    pg_restore -Fc --no-acl --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$DB_FOLDER/$LATEST_DB_FILE"
else
    echo "No backup found in $DB_FOLDER; starting with an empty database"
fi
