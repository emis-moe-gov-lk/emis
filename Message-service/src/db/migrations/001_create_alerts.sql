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
