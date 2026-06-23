-- Run this as MySQL root
-- Creates the database, user, grants, and all tables

CREATE DATABASE IF NOT EXISTS emis_alerts
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'alert_service'@'localhost' IDENTIFIED BY 'RetU2%Fp';

GRANT SELECT, INSERT, UPDATE ON emis_alerts.* TO 'alert_service'@'localhost';

FLUSH PRIVILEGES;

USE emis_alerts;

-- 001: alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  alert_type     VARCHAR(64)     NOT NULL,
  producer       VARCHAR(64)     NOT NULL DEFAULT 'emis-hrm',
  people_id      VARCHAR(32)     NOT NULL,
  recipient_role VARCHAR(64)         NULL,
  status         ENUM('active','resolved','archived')
                                 NOT NULL DEFAULT 'active',
  payload        JSON            NOT NULL,
  external_ref   VARCHAR(128)        NULL,
  synced_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_external_ref (alert_type, external_ref),
  INDEX idx_alert_type (alert_type),
  INDEX idx_people_id  (people_id),
  INDEX idx_status     (status),
  INDEX idx_synced_at  (synced_at)
);

-- 002: alert_counts table
CREATE TABLE IF NOT EXISTS alert_counts (
  alert_type   VARCHAR(64)   NOT NULL,
  count        INT UNSIGNED  NOT NULL DEFAULT 0,
  refreshed_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (alert_type)
);

-- 003: service_keys table
CREATE TABLE IF NOT EXISTS service_keys (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  service_name VARCHAR(64)   NOT NULL,
  key_hash     CHAR(64)      NOT NULL,
  active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP         NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_key_hash (key_hash),
  INDEX idx_active (active)
);

SELECT 'Database setup complete.' AS status;
