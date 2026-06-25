CREATE TABLE IF NOT EXISTS notification_recipients (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  notification_id   INT UNSIGNED    NOT NULL,
  people_id         VARCHAR(64)     NOT NULL,
  read_at           TIMESTAMP           NULL,
  acknowledged_at   TIMESTAMP           NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_notif_person (notification_id, people_id),
  INDEX idx_people_id         (people_id),
  INDEX idx_notification_id   (notification_id),
  CONSTRAINT fk_nr_notification
    FOREIGN KEY (notification_id) REFERENCES notifications(id)
    ON DELETE CASCADE
);
