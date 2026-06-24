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
