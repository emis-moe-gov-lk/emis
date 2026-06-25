CREATE TABLE IF NOT EXISTS notifications (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  sender_id       VARCHAR(64)     NOT NULL,
  sender_role     VARCHAR(64)         NULL,
  status          ENUM('draft','sent','cancelled')
                                  NOT NULL DEFAULT 'draft',
  subject         VARCHAR(255)    NOT NULL,
  body            TEXT            NOT NULL,
  is_urgent       TINYINT(1)      NOT NULL DEFAULT 0,
  require_ack     TINYINT(1)      NOT NULL DEFAULT 0,
  channels        JSON            NOT NULL,
  scope           JSON            NOT NULL,
  recipient_count INT UNSIGNED    NOT NULL DEFAULT 0,
  sent_at         TIMESTAMP           NULL,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_status    (status),
  INDEX idx_sent_at   (sent_at)
);
