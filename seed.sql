-- ==========================================================
-- IT Helpdesk & Asset Support Management System
-- Sample Seed Data (seed.sql)
-- DBMS: MySQL 8.0+
-- Database: it_helpdesk
-- ==========================================================

USE it_helpdesk;

-- Disable foreign key checks for clean seeding
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE maintenance;
TRUNCATE TABLE resolutions;
TRUNCATE TABLE status_histories;
TRUNCATE TABLE assignments;
TRUNCATE TABLE service_requests;
TRUNCATE TABLE incidents;
TRUNCATE TABLE tickets;
TRUNCATE TABLE assets;
TRUNCATE TABLE warranties;
TRUNCATE TABLE support_staff;
TRUNCATE TABLE priorities;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
TRUNCATE TABLE departments;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. DEPARTMENTS
INSERT INTO departments (department_id, name, location) VALUES
(1, 'Engineering', 'Building A, Floor 3'),
(2, 'Human Resources', 'Building B, Floor 1'),
(3, 'Finance & Accounts', 'Building A, Floor 2'),
(4, 'Marketing & Sales', 'Building C, Floor 4'),
(5, 'IT Infrastructure', 'Building A, Ground Floor');

-- 2. USERS
INSERT INTO users (user_id, name, email, department_id) VALUES
(1, 'Aarav Sharma', 'aarav.sharma@company.com', 1),
(2, 'Priya Patel', 'priya.patel@company.com', 2),
(3, 'Rohan Verma', 'rohan.verma@company.com', 3),
(4, 'Ananya Iyer', 'ananya.iyer@company.com', 4),
(5, 'Vikram Singh', 'vikram.singh@company.com', 1),
(6, 'Neha Gupta', 'neha.gupta@company.com', 5);

-- 3. CATEGORIES
INSERT INTO categories (category_id, name, description) VALUES
(1, 'Hardware Issue', 'Problems relating to laptops, monitors, keyboards, mice, and internal components'),
(2, 'Software & OS', 'Operating system crashes, application bugs, and licensing issues'),
(3, 'Network & VPN', 'Wi-Fi connectivity, Ethernet port issues, and remote VPN access trouble'),
(4, 'Access & Permissions', 'Email accounts, database access, folder permissions, and password resets'),
(5, 'Asset Procurement', 'Requests for new hardware equipment, peripherals, or software licenses');

-- 4. PRIORITIES
INSERT INTO priorities (priority_id, name, level) VALUES
(1, 'Low', 1),
(2, 'Medium', 2),
(3, 'High', 3),
(4, 'Critical', 4),
(5, 'Emergency', 5);

-- 5. SUPPORT STAFF
INSERT INTO support_staff (staff_id, name, email, specialization) VALUES
(1, 'Karan Malhotra', 'karan.helpdesk@company.com', 'Hardware & Peripherals'),
(2, 'Sneha Rao', 'sneha.helpdesk@company.com', 'Network & Security'),
(3, 'Amit Joshi', 'amit.helpdesk@company.com', 'Operating Systems & Enterprise Software'),
(4, 'Divya Nair', 'divya.helpdesk@company.com', 'Identity & Access Management');

-- 6. WARRANTIES
INSERT INTO warranties (warranty_id, start_date, end_date, provider) VALUES
(1, '2024-01-15', '2027-01-15', 'Dell ProSupport Plus'),
(2, '2023-06-01', '2026-06-01', 'AppleCare for Enterprise'),
(3, '2024-03-10', '2027-03-10', 'Lenovo Premier Support'),
(4, '2022-11-20', '2025-11-20', 'HP Care Pack Support'),
(5, '2025-01-01', '2028-01-01', 'Cisco Smart Net Total Care');

-- 7. ASSETS
INSERT INTO assets (asset_id, asset_tag, name, serial_no, user_id, category_id, warranty_id) VALUES
(1, 'AST-DELL-001', 'Dell Latitude 7440', 'DL-7440-SN8912', 1, 1, 1),
(2, 'AST-MBP-002', 'MacBook Pro 16" M3', 'AP-MBP-SN3401', 2, 1, 2),
(3, 'AST-LNV-003', 'ThinkPad T14 Gen 4', 'TP-T14-SN5520', 3, 1, 3),
(4, 'AST-HP-004', 'HP EliteBook 840 G10', 'HP-840-SN9911', 4, 1, 4),
(5, 'AST-DELL-005', 'Dell UltraSharp 27" 4K Monitor', 'DL-U27-SN1188', 1, 1, 1),
(6, 'AST-CSCO-006', 'Cisco Catalyst 9200 Switch', 'CS-CAT-SN7733', NULL, 3, 5);

-- 8. TICKETS
INSERT INTO tickets (ticket_id, ticket_no, user_id, category_id, priority_id, title, description, status, created_at) VALUES
(1, 'TCK-2026-001', 1, 1, 3, 'Laptop display flickering constantly', 'Dell Latitude screen flickers whenever plugged into external dock.', 'In Progress', '2026-08-20 09:30:00'),
(2, 'TCK-2026-002', 2, 4, 2, 'VPN access setup for remote working', 'Need VPN credentials and MFA setup on mobile device for remote week.', 'Resolved', '2026-08-21 11:15:00'),
(3, 'TCK-2026-003', 3, 3, 4, 'Finance accounting portal connection timed out', 'Unable to reach SAP Finance server from Floor 2 network.', 'Open', '2026-08-22 14:00:00'),
(4, 'TCK-2026-004', 4, 2, 1, 'Install Figma desktop client', 'Require Figma desktop application license and installation for marketing assets.', 'Closed', '2026-08-18 10:00:00'),
(5, 'TCK-2026-005', 5, 5, 2, 'Request second monitor for software engineering', 'Requesting an additional 27-inch monitor for backend dev workflow.', 'Open', '2026-08-23 08:45:00');

-- 9. INCIDENTS (Subtype of tickets 1 & 3)
INSERT INTO incidents (ticket_id, incident_type) VALUES
(1, 'Hardware Malfunction'),
(3, 'Network Outage');

-- 10. SERVICE REQUESTS (Subtype of tickets 2, 4 & 5)
INSERT INTO service_requests (ticket_id, request_type) VALUES
(2, 'Access Provisioning'),
(4, 'Software Installation'),
(5, 'Hardware Allocation');

-- 11. ASSIGNMENTS
INSERT INTO assignments (assignment_id, ticket_id, staff_id, assigned_at) VALUES
(1, 1, 1, '2026-08-20 10:00:00'),
(2, 2, 4, '2026-08-21 11:30:00'),
(3, 4, 3, '2026-08-18 10:30:00');

-- 12. STATUS HISTORIES
INSERT INTO status_histories (history_id, ticket_id, old_status, new_status, changed_at) VALUES
(1, 1, 'Open', 'In Progress', '2026-08-20 10:00:00'),
(2, 2, 'Open', 'In Progress', '2026-08-21 11:30:00'),
(3, 2, 'In Progress', 'Resolved', '2026-08-21 15:45:00'),
(4, 4, 'Open', 'In Progress', '2026-08-18 10:30:00'),
(5, 4, 'In Progress', 'Resolved', '2026-08-18 14:00:00'),
(6, 4, 'Resolved', 'Closed', '2026-08-19 09:00:00');

-- 13. RESOLUTIONS (For resolved / closed tickets: 2 & 4)
INSERT INTO resolutions (resolution_id, ticket_id, description, resolved_at) VALUES
(1, 2, 'Configured corporate VPN profile and registered Microsoft Authenticator MFA on user phone.', '2026-08-21 15:45:00'),
(2, 4, 'Assigned Figma Enterprise seat and installed Figma desktop app via IT Self-Service Portal.', '2026-08-18 14:00:00');

-- 14. MAINTENANCE
INSERT INTO maintenance (maintenance_id, asset_id, maintenance_date, description, cost) VALUES
(1, 1, '2026-05-10', 'Thermal paste replacement and fan cleaning', 750.00),
(2, 3, '2026-06-15', 'Battery health diagnosis and firmware update', 1200.00),
(3, 6, '2026-07-01', 'Scheduled quarterly rack inspection and IOS firmware patch', 2500.00);
