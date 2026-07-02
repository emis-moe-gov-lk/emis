CREATE TABLE IF NOT EXISTS alert_counts (
  alert_type   VARCHAR(64)   NOT NULL,
  count        INT UNSIGNED  NOT NULL DEFAULT 0,
  refreshed_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (alert_type)
);
