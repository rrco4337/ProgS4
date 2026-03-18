#!/bin/bash
set -euo pipefail

/opt/mssql/bin/sqlservr &
SQL_PID=$!

wait_for_sql() {
  for i in {1..60}; do
    if /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

run_script() {
  local file="$1"
  local database="$2"
  echo "[db-init] Execution de: $file"

  if /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -d "$database" -b -i "$file"; then
    echo "[db-init] OK: $file"
  else
    echo "[db-init] WARNING: echec sur $file (on continue)"
  fi
}

if wait_for_sql; then
  echo "[db-init] SQL Server pret, lancement des scripts..."

  if [ -f "/docker-entrypoint-initdb.d/init.sql" ]; then
    run_script "/docker-entrypoint-initdb.d/init.sql" "master"
  fi

  if ! /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "IF DB_ID('elevage') IS NULL RAISERROR('Database elevage inexistante',16,1)" >/dev/null 2>&1; then
    echo "[db-init] ERROR: base 'elevage' indisponible, scripts suivants ignores"
    wait "$SQL_PID"
    exit 0
  fi

  for file in /docker-entrypoint-initdb.d/*.sql; do
    [ -e "$file" ] || continue
    if [ "$file" = "/docker-entrypoint-initdb.d/init.sql" ]; then
      continue
    fi
    run_script "$file" "elevage"
  done

  echo "[db-init] Initialisation terminee"
else
  echo "[db-init] ERROR: SQL Server non pret apres attente"
fi

wait "$SQL_PID"
