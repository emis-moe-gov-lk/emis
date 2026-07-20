#!/bin/bash
#
# MySQL init script — executed once at first container start.
# Creates all EMIS + WSO2 databases with latin1 charset, application users,
# and imports WSO2 schema files.
#
set -e

MYSQL="mysql -u root -p${MYSQL_ROOT_PASSWORD:-root}"

echo "==> Creating databases..."
${MYSQL} -e "CREATE DATABASE IF NOT EXISTS emis_hrm_db_local CHARACTER SET latin1 COLLATE latin1_swedish_ci;"
${MYSQL} -e "CREATE DATABASE IF NOT EXISTS wso2_is_db_local CHARACTER SET latin1 COLLATE latin1_swedish_ci;"
${MYSQL} -e "CREATE DATABASE IF NOT EXISTS wso2_is_shared_db_local CHARACTER SET latin1 COLLATE latin1_swedish_ci;"
${MYSQL} -e "CREATE DATABASE IF NOT EXISTS wso2_apim_db_local CHARACTER SET latin1 COLLATE latin1_swedish_ci;"
${MYSQL} -e "CREATE DATABASE IF NOT EXISTS wso2_apim_shared_db_local CHARACTER SET latin1 COLLATE latin1_swedish_ci;"

echo "==> Creating application users..."
${MYSQL} -e "
  CREATE USER IF NOT EXISTS 'emis-user-local'@'%' IDENTIFIED BY 'EmisUserDev0';
  GRANT ALL PRIVILEGES ON emis_hrm_db_local.* TO 'emis-user-local'@'%';

  CREATE USER IF NOT EXISTS 'wso2-user-local'@'%' IDENTIFIED BY 'WSO2@UserLoc4';
  GRANT ALL PRIVILEGES ON wso2_is_db_local.* TO 'wso2-user-local'@'%';
  GRANT ALL PRIVILEGES ON wso2_is_shared_db_local.* TO 'wso2-user-local'@'%';
  GRANT ALL PRIVILEGES ON wso2_apim_db_local.* TO 'wso2-user-local'@'%';
  GRANT ALL PRIVILEGES ON wso2_apim_shared_db_local.* TO 'wso2-user-local'@'%';

  FLUSH PRIVILEGES;
"

echo "==> Importing WSO2 IS identity schema..."
${MYSQL} wso2_is_db_local < /docker-entrypoint-initdb.d/wso2_is_7.2.0_identity_db_script.sql

echo "==> Importing WSO2 IS consent schema..."
${MYSQL} wso2_is_db_local < /docker-entrypoint-initdb.d/wso2_is_7.2.0_consent_db_script.sql

echo "==> Importing WSO2 IS shared registry schema..."
${MYSQL} wso2_is_shared_db_local < /docker-entrypoint-initdb.d/wso2_is_7.2.0_shared_db_script.sql

echo "==> Importing WSO2 APIM main schema..."
${MYSQL} wso2_apim_db_local < /docker-entrypoint-initdb.d/wso2_apim_4.6.0_db_script.sql

echo "==> Importing WSO2 APIM shared registry schema..."
${MYSQL} wso2_apim_shared_db_local < /docker-entrypoint-initdb.d/wso2_apim_4.6.0_shared_db_script.sql

echo "==> MySQL init complete."
