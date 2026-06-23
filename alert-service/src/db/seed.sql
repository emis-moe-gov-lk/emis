USE emis_alerts;

-- Clear existing data
TRUNCATE TABLE alert_counts;
DELETE FROM alerts;

-- Pending Verification (12 records)
INSERT INTO alerts (alert_type, producer, people_id, external_ref, payload) VALUES
('pending_verification', 'emis-hrm', 'P001001', 'EXT-PV-001', '{"fullName":"Kamal Perera","nameWithInitials":"K. Perera","appointmentDate":"2026-01-15","school":{"name":"Ananda College","censusNo":"AC001"}}'),
('pending_verification', 'emis-hrm', 'P001002', 'EXT-PV-002', '{"fullName":"Nimali Fernando","nameWithInitials":"N. Fernando","appointmentDate":"2026-01-18","school":{"name":"Visakha Vidyalaya","censusNo":"VV002"}}'),
('pending_verification', 'emis-hrm', 'P001003', 'EXT-PV-003', '{"fullName":"Suresh Bandara","nameWithInitials":"S. Bandara","appointmentDate":"2026-01-20","school":{"name":"Royal College","censusNo":"RC003"}}'),
('pending_verification', 'emis-hrm', 'P001004', 'EXT-PV-004', '{"fullName":"Priya Wickramasinghe","nameWithInitials":"P. Wickramasinghe","appointmentDate":"2026-02-01","school":{"name":"Devi Balika Vidyalaya","censusNo":"DB004"}}'),
('pending_verification', 'emis-hrm', 'P001005', 'EXT-PV-005', '{"fullName":"Chaminda Rathnayake","nameWithInitials":"C. Rathnayake","appointmentDate":"2026-02-05","school":{"name":"Nalanda College","censusNo":"NC005"}}'),
('pending_verification', 'emis-hrm', 'P001006', 'EXT-PV-006', '{"fullName":"Dilani Jayawardena","nameWithInitials":"D. Jayawardena","appointmentDate":"2026-02-10","school":{"name":"Dharmaraja College","censusNo":"DC006"}}'),
('pending_verification', 'emis-hrm', 'P001007', 'EXT-PV-007', '{"fullName":"Ruwan Silva","nameWithInitials":"R. Silva","appointmentDate":"2026-02-12","school":{"name":"Trinity College","censusNo":"TC007"}}'),
('pending_verification', 'emis-hrm', 'P001008', 'EXT-PV-008', '{"fullName":"Sanduni Dissanayake","nameWithInitials":"S. Dissanayake","appointmentDate":"2026-02-15","school":{"name":"Mahamaya Girls College","censusNo":"MG008"}}'),
('pending_verification', 'emis-hrm', 'P001009', 'EXT-PV-009', '{"fullName":"Thilak Kumara","nameWithInitials":"T. Kumara","appointmentDate":"2026-02-18","school":{"name":"Zahira College","censusNo":"ZC009"}}'),
('pending_verification', 'emis-hrm', 'P001010', 'EXT-PV-010', '{"fullName":"Manel Gunasekara","nameWithInitials":"M. Gunasekara","appointmentDate":"2026-02-20","school":{"name":"Ladies College","censusNo":"LC010"}}'),
('pending_verification', 'emis-hrm', 'P001011', 'EXT-PV-011', '{"fullName":"Asanka Herath","nameWithInitials":"A. Herath","appointmentDate":"2026-03-01","school":{"name":"S. Thomas College","censusNo":"ST011"}}'),
('pending_verification', 'emis-hrm', 'P001012', 'EXT-PV-012', '{"fullName":"Iresha Madushanka","nameWithInitials":"I. Madushanka","appointmentDate":"2026-03-05","school":{"name":"Sirimavo Bandaranaike Vidyalaya","censusNo":"SB012"}}'),

-- Revised (3 records)
('revised', 'emis-hrm', 'P002001', 'EXT-RV-001', '{"fullName":"Nimal Jayasuriya","nameWithInitials":"N. Jayasuriya","appointmentDate":"2025-11-10","school":{"name":"Isipathana College","censusNo":"IC001"}}'),
('revised', 'emis-hrm', 'P002002', 'EXT-RV-002', '{"fullName":"Kumari Senanayake","nameWithInitials":"K. Senanayake","appointmentDate":"2025-11-20","school":{"name":"Musaeus College","censusNo":"MC002"}}'),
('revised', 'emis-hrm', 'P002003', 'EXT-RV-003', '{"fullName":"Pradeep Amarasinghe","nameWithInitials":"P. Amarasinghe","appointmentDate":"2025-12-01","school":{"name":"Dharmaraja College","censusNo":"DC003"}}'),

-- Pending Confirmation (7 records)
('pending_confirmation', 'emis-hrm', 'P003001', 'EXT-PC-001', '{"fullName":"Saman Wijesinghe","nameWithInitials":"S. Wijesinghe","appointmentDate":"2025-10-15","school":{"name":"Ananda College","censusNo":"AC001"}}'),
('pending_confirmation', 'emis-hrm', 'P003002', 'EXT-PC-002', '{"fullName":"Gayani Thilakarathne","nameWithInitials":"G. Thilakarathne","appointmentDate":"2025-10-20","school":{"name":"Devi Balika Vidyalaya","censusNo":"DB002"}}'),
('pending_confirmation', 'emis-hrm', 'P003003', 'EXT-PC-003', '{"fullName":"Lasantha Mendis","nameWithInitials":"L. Mendis","appointmentDate":"2025-10-25","school":{"name":"Royal College","censusNo":"RC003"}}'),
('pending_confirmation', 'emis-hrm', 'P003004', 'EXT-PC-004', '{"fullName":"Anusha Pathirana","nameWithInitials":"A. Pathirana","appointmentDate":"2025-11-01","school":{"name":"Visakha Vidyalaya","censusNo":"VV004"}}'),
('pending_confirmation', 'emis-hrm', 'P003005', 'EXT-PC-005', '{"fullName":"Buddhika Rajapaksa","nameWithInitials":"B. Rajapaksa","appointmentDate":"2025-11-05","school":{"name":"Nalanda College","censusNo":"NC005"}}'),
('pending_confirmation', 'emis-hrm', 'P003006', 'EXT-PC-006', '{"fullName":"Chamari Jayasinghe","nameWithInitials":"C. Jayasinghe","appointmentDate":"2025-11-08","school":{"name":"Ladies College","censusNo":"LC006"}}'),
('pending_confirmation', 'emis-hrm', 'P003007', 'EXT-PC-007', '{"fullName":"Roshan Gunawardena","nameWithInitials":"R. Gunawardena","appointmentDate":"2025-11-12","school":{"name":"Trinity College","censusNo":"TC007"}}'),

-- Rejected (2 records)
('rejected', 'emis-hrm', 'P004001', 'EXT-RJ-001', '{"fullName":"Dinesh Karunaratne","nameWithInitials":"D. Karunaratne","appointmentDate":"2025-09-10","school":{"name":"Zahira College","censusNo":"ZC001"},"rejection":{"reason":"Incomplete documentation — NIC copy missing and appointment letter not attested.","rejectedAt":"2025-10-01"}}'),
('rejected', 'emis-hrm', 'P004002', 'EXT-RJ-002', '{"fullName":"Sachini Perera","nameWithInitials":"S. Perera","appointmentDate":"2025-09-15","school":{"name":"Musaeus College","censusNo":"MC002"},"rejection":{"reason":"Qualification certificates do not meet the minimum requirement for Grade 1 appointment.","rejectedAt":"2025-10-05"}}');

-- Sync alert_counts to match
INSERT INTO alert_counts (alert_type, count) VALUES
('pending_verification', 12),
('revised',              3),
('pending_confirmation', 7),
('rejected',             2)
ON DUPLICATE KEY UPDATE count = VALUES(count);

SELECT 'Seed complete.' AS status;
SELECT alert_type, COUNT(*) AS records FROM alerts GROUP BY alert_type;
