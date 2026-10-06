-- ====================================================================
-- IT HELPDESK AND ASSET SUPPORT MANAGEMENT SYSTEM
-- Course: Database Management Systems (DBMS)
-- Student: Md Aali Rahman (Roll No: 25WU0102156)
-- Institution: Woxsen University | Academic Year: 2026
-- Database Engine: MySQL 8.0+ / 9.x (InnoDB Storage Engine)
-- Database Name: it_helpdesk
-- ====================================================================

--------------------------------------------------
-- 1. DATABASE CREATION
--------------------------------------------------

DROP DATABASE IF EXISTS it_helpdesk;
CREATE DATABASE it_helpdesk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE it_helpdesk;

--------------------------------------------------
-- 2. TABLE CREATION / DDL
--------------------------------------------------

-- Table 1: Departments
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Table 2: Users (End-Users / Employees / Faculty)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department_id INT NOT NULL
) ENGINE=InnoDB;

-- Table 3: Categories
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB;

-- Table 4: Priorities
CREATE TABLE priorities (
    priority_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    level INT NOT NULL
) ENGINE=InnoDB;

-- Table 5: Support Staff (Helpdesk Technicians / Engineers)
CREATE TABLE support_staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    specialization VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Table 6: Warranties
CREATE TABLE warranties (
    warranty_id INT AUTO_INCREMENT PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    provider VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Table 7: Assets (Hardware Equipment / Computing Inventory)
CREATE TABLE assets (
    asset_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    serial_no VARCHAR(100) NOT NULL UNIQUE,
    user_id INT NULL,
    category_id INT NOT NULL,
    warranty_id INT NULL
) ENGINE=InnoDB;

-- Table 8: Tickets (Central Entity)
CREATE TABLE tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_no VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    priority_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 9: Incidents (Subtype of Ticket)
CREATE TABLE incidents (
    ticket_id INT PRIMARY KEY,
    incident_type VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Table 10: Service Requests (Subtype of Ticket)
CREATE TABLE service_requests (
    ticket_id INT PRIMARY KEY,
    request_type VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Table 11: Assignments (Technician to Ticket Mapping)
CREATE TABLE assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    staff_id INT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 12: Status Histories (Chronological Audit Trail)
CREATE TABLE status_histories (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    old_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 13: Resolutions (Formal Resolution Log)
CREATE TABLE resolutions (
    resolution_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    resolved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 14: Maintenance (Asset Repair & Service Log)
CREATE TABLE maintenance (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    maintenance_date DATE NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB;

--------------------------------------------------
-- 3. CONSTRAINTS / RELATIONSHIPS
--------------------------------------------------

-- Check Constraints
ALTER TABLE priorities
    ADD CONSTRAINT chk_priority_level CHECK (level BETWEEN 1 AND 5);

ALTER TABLE warranties
    ADD CONSTRAINT chk_warranty_dates CHECK (end_date >= start_date);

ALTER TABLE tickets
    ADD CONSTRAINT chk_ticket_status CHECK (status IN ('Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Cancelled'));

ALTER TABLE maintenance
    ADD CONSTRAINT chk_maintenance_cost CHECK (cost >= 0);

-- Foreign Key Constraints
ALTER TABLE users
    ADD CONSTRAINT fk_users_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE assets
    ADD CONSTRAINT fk_assets_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT fk_assets_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_assets_warranty
        FOREIGN KEY (warranty_id) REFERENCES warranties(warranty_id)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE tickets
    ADD CONSTRAINT fk_tickets_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_tickets_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_tickets_priority
        FOREIGN KEY (priority_id) REFERENCES priorities(priority_id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE incidents
    ADD CONSTRAINT fk_incidents_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE service_requests
    ADD CONSTRAINT fk_service_requests_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE assignments
    ADD CONSTRAINT fk_assignments_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_assignments_staff
        FOREIGN KEY (staff_id) REFERENCES support_staff(staff_id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE status_histories
    ADD CONSTRAINT fk_status_histories_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE resolutions
    ADD CONSTRAINT fk_resolutions_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE maintenance
    ADD CONSTRAINT fk_maintenance_asset
        FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
        ON DELETE CASCADE ON UPDATE CASCADE;

--------------------------------------------------
-- 4. INSERT / SEED DATA
--------------------------------------------------

-- 1. Departments (4 records)
INSERT INTO departments (department_id, name, location) VALUES
(1, 'Engineering', 'Building A, Floor 3'),
(2, 'Human Resources', 'Building B, Floor 1'),
(3, 'Finance & Accounts', 'Building A, Floor 2'),
(4, 'Marketing & Sales', 'Building C, Floor 4');

-- 2. Users (5 records)
INSERT INTO users (user_id, name, email, department_id) VALUES
(1, 'Aarav Sharma', 'aarav.sharma@company.com', 1),
(2, 'Priya Patel', 'priya.patel@company.com', 2),
(3, 'Rohan Verma', 'rohan.verma@company.com', 3),
(4, 'Ananya Iyer', 'ananya.iyer@company.com', 4),
(5, 'Vikram Singh', 'vikram.singh@company.com', 1);

-- 3. Categories (5 records)
INSERT INTO categories (category_id, name, description) VALUES
(1, 'Hardware Issue', 'Problems relating to laptops, monitors, keyboards, and internal components'),
(2, 'Software & OS', 'Operating system crashes, application bugs, and licensing issues'),
(3, 'Network & VPN', 'Wi-Fi connectivity, Ethernet port issues, and remote VPN access trouble'),
(4, 'Access & Permissions', 'Email accounts, database access, folder permissions, and password resets'),
(5, 'Asset Procurement', 'Requests for new hardware equipment, peripherals, or software licenses');

-- 4. Priorities (4 records)
INSERT INTO priorities (priority_id, name, level) VALUES
(1, 'Low', 1),
(2, 'Medium', 2),
(3, 'High', 3),
(4, 'Critical', 4);

-- 5. Support Staff (4 records)
INSERT INTO support_staff (staff_id, name, email, specialization) VALUES
(1, 'Karan Malhotra', 'karan.helpdesk@company.com', 'Hardware & Peripherals'),
(2, 'Sneha Rao', 'sneha.helpdesk@company.com', 'Network & Security'),
(3, 'Amit Joshi', 'amit.helpdesk@company.com', 'Operating Systems & Enterprise Software'),
(4, 'Divya Nair', 'divya.helpdesk@company.com', 'Identity & Access Management');

-- 6. Warranties (4 records)
INSERT INTO warranties (warranty_id, start_date, end_date, provider) VALUES
(1, '2024-01-15', '2027-01-15', 'Dell ProSupport Plus'),
(2, '2023-06-01', '2026-06-01', 'AppleCare for Enterprise'),
(3, '2024-03-10', '2027-03-10', 'Lenovo Premier Support'),
(4, '2022-11-20', '2025-11-20', 'HP Care Pack Support');

-- 7. Assets (5 records)
INSERT INTO assets (asset_id, asset_tag, name, serial_no, user_id, category_id, warranty_id) VALUES
(1, 'AST-DELL-001', 'Dell Latitude 7440', 'DL-7440-SN8912', 1, 1, 1),
(2, 'AST-MBP-002', 'MacBook Pro 16" M3', 'AP-MBP-SN3401', 2, 1, 2),
(3, 'AST-LNV-003', 'ThinkPad T14 Gen 4', 'TP-T14-SN5520', 3, 1, 3),
(4, 'AST-HP-004', 'HP EliteBook 840 G10', 'HP-840-SN9911', 4, 1, 4),
(5, 'AST-DELL-005', 'Dell UltraSharp 27" 4K Monitor', 'DL-U27-SN1188', 5, 1, 1);

-- 8. Tickets (5 records)
INSERT INTO tickets (ticket_id, ticket_no, user_id, category_id, priority_id, title, description, status, created_at) VALUES
(1, 'TKT-001', 1, 1, 3, 'Laptop display flickering constantly', 'Dell Latitude screen flickers whenever plugged into external dock.', 'In Progress', '2026-08-20 09:30:00'),
(2, 'TKT-002', 2, 4, 2, 'VPN access setup for remote working', 'Need VPN credentials and MFA setup on mobile device for remote week.', 'Resolved', '2026-08-21 11:15:00'),
(3, 'TKT-003', 3, 3, 4, 'Finance accounting portal connection timed out', 'Unable to reach SAP Finance server from Floor 2 network.', 'In Progress', '2026-08-22 14:00:00'),
(4, 'TKT-004', 4, 2, 1, 'Install Figma desktop client', 'Require Figma desktop application license and installation for marketing assets.', 'Open', '2026-08-22 16:30:00'),
(5, 'TKT-005', 5, 5, 2, 'Request second monitor for software engineering', 'Requesting an additional 27-inch monitor for backend dev workflow.', 'Open', '2026-08-23 08:45:00');

-- 9. Incidents (3 records)
INSERT INTO incidents (ticket_id, incident_type) VALUES
(1, 'Hardware Malfunction'),
(3, 'Network Outage'),
(4, 'Software Application Issue');

-- 10. Service Requests (2 records)
INSERT INTO service_requests (ticket_id, request_type) VALUES
(2, 'Access Provisioning'),
(5, 'Hardware Allocation');

-- 11. Assignments (5 records)
INSERT INTO assignments (assignment_id, ticket_id, staff_id, assigned_at) VALUES
(1, 1, 1, '2026-08-20 10:00:00'),
(2, 2, 4, '2026-08-21 11:30:00'),
(3, 3, 2, '2026-08-22 14:15:00'),
(4, 4, 3, '2026-08-22 17:00:00'),
(5, 5, 1, '2026-08-23 09:00:00');

-- 12. Status Histories (5 records)
INSERT INTO status_histories (history_id, ticket_id, old_status, new_status, changed_at) VALUES
(1, 1, NULL, 'Open', '2026-08-20 09:30:00'),
(2, 1, 'Open', 'In Progress', '2026-08-20 10:00:00'),
(3, 2, NULL, 'Open', '2026-08-21 11:15:00'),
(4, 2, 'Open', 'In Progress', '2026-08-21 11:30:00'),
(5, 2, 'In Progress', 'Resolved', '2026-08-21 15:45:00');

-- 13. Resolutions (1 record)
INSERT INTO resolutions (resolution_id, ticket_id, description, resolved_at) VALUES
(1, 2, 'Configured corporate VPN profile and registered Microsoft Authenticator MFA on user phone.', '2026-08-21 15:45:00');

-- 14. Maintenance (3 records)
INSERT INTO maintenance (maintenance_id, asset_id, maintenance_date, description, cost) VALUES
(1, 1, '2026-05-10', 'Thermal paste replacement and fan cleaning', 750.00),
(2, 3, '2026-06-15', 'Battery health diagnosis and firmware update', 1200.00),
(3, 4, '2026-07-01', 'Keyboard replacement under warranty service', 450.00);

--------------------------------------------------
-- 5. SELECT QUERIES
--------------------------------------------------

-- 5.1 Simple Table Selection
SELECT user_id, name, email, department_id 
FROM users 
ORDER BY user_id ASC;

-- 5.2 WHERE Filtering on Status & Priority
SELECT ticket_id, ticket_no, title, status, created_at 
FROM tickets 
WHERE status = 'Open' 
ORDER BY created_at DESC;

-- 5.3 Hardware Assets with Active Warranties
SELECT asset_tag, name, serial_no, warranty_id 
FROM assets 
WHERE user_id IS NOT NULL;

--------------------------------------------------
-- 6. JOIN QUERIES
--------------------------------------------------

-- 6.1 Multi-Table JOIN: Comprehensive Ticket Queue View
SELECT 
    t.ticket_id,
    t.ticket_no,
    t.title,
    t.status,
    p.name AS priority_name,
    p.level AS priority_level,
    c.name AS category_name,
    u.name AS requester_name,
    u.email AS requester_email,
    d.name AS department_name,
    CASE 
        WHEN i.ticket_id IS NOT NULL THEN 'Incident'
        WHEN sr.ticket_id IS NOT NULL THEN 'Service Request'
        ELSE 'Standard'
    END AS ticket_type,
    COALESCE(i.incident_type, sr.request_type, 'N/A') AS subtype_detail,
    DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') AS created_at
FROM tickets t
JOIN users u ON t.user_id = u.user_id
JOIN departments d ON u.department_id = d.department_id
JOIN categories c ON t.category_id = c.category_id
JOIN priorities p ON t.priority_id = p.priority_id
LEFT JOIN incidents i ON t.ticket_id = i.ticket_id
LEFT JOIN service_requests sr ON t.ticket_id = sr.ticket_id
ORDER BY p.level DESC, t.created_at DESC;

-- 6.2 Asset Allocation & Warranty Provider Detail JOIN
SELECT 
    a.asset_tag,
    a.name AS asset_name,
    a.serial_no,
    COALESCE(u.name, 'Unassigned / In Inventory') AS assigned_user,
    c.name AS category_name,
    COALESCE(w.provider, 'No Warranty Registered') AS warranty_provider,
    w.end_date AS warranty_expiry
FROM assets a
JOIN categories c ON a.category_id = c.category_id
LEFT JOIN users u ON a.user_id = u.user_id
LEFT JOIN warranties w ON a.warranty_id = w.warranty_id
ORDER BY a.asset_id ASC;

-- 6.3 Full Ticket Audit Trail History
SELECT 
    t.ticket_no,
    t.title,
    COALESCE(sh.old_status, 'Initial (None)') AS old_status,
    sh.new_status,
    DATE_FORMAT(sh.changed_at, '%Y-%m-%d %H:%i:%s') AS transitioned_at
FROM status_histories sh
JOIN tickets t ON sh.ticket_id = t.ticket_id
ORDER BY t.ticket_id ASC, sh.changed_at ASC;

--------------------------------------------------
-- 7. AGGREGATE QUERIES
--------------------------------------------------

-- 7.1 Technician Workload Summary (COUNT, SUM, CASE, GROUP BY)
SELECT 
    s.staff_id,
    s.name AS technician,
    s.specialization,
    COUNT(a.assignment_id) AS total_assigned_tickets,
    SUM(CASE WHEN t.status IN ('Open', 'In Progress', 'Pending') THEN 1 ELSE 0 END) AS active_tickets,
    SUM(CASE WHEN t.status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS resolved_tickets
FROM support_staff s
LEFT JOIN assignments a ON s.staff_id = a.staff_id
LEFT JOIN tickets t ON a.ticket_id = t.ticket_id
GROUP BY s.staff_id, s.name, s.specialization
ORDER BY active_tickets DESC, total_assigned_tickets DESC;

-- 7.2 Departmental Asset Count & Maintenance Expenditure
SELECT 
    d.department_id,
    d.name AS department_name,
    COUNT(DISTINCT a.asset_id) AS total_allocated_assets,
    CONCAT('$', FORMAT(COALESCE(SUM(m.cost), 0.00), 2)) AS total_maintenance_spent
FROM departments d
LEFT JOIN users u ON d.department_id = u.department_id
LEFT JOIN assets a ON u.user_id = a.user_id
LEFT JOIN maintenance m ON a.asset_id = m.asset_id
GROUP BY d.department_id, d.name
ORDER BY SUM(m.cost) DESC;

-- 7.3 Ticket Status Breakdown
SELECT 
    status,
    COUNT(ticket_id) AS ticket_count,
    ROUND(COUNT(ticket_id) * 100.0 / (SELECT COUNT(*) FROM tickets), 1) AS percentage
FROM tickets
GROUP BY status
ORDER BY ticket_count DESC;

--------------------------------------------------
-- 8. UPDATE / DELETE EXAMPLES
--------------------------------------------------

-- 8.1 Ticket Status Transition and Resolution Logging
-- Step A: Update Ticket Status
UPDATE tickets 
SET status = 'Resolved' 
WHERE ticket_id = 1;

-- Step B: Insert Chronological Status History Entry
INSERT INTO status_histories (ticket_id, old_status, new_status, changed_at)
VALUES (1, 'In Progress', 'Resolved', NOW());

-- Step C: Record Resolution Narrative
INSERT INTO resolutions (ticket_id, description, resolved_at)
VALUES (1, 'Replaced external dock USB-C display controller cable and verified display output.', NOW());

-- 8.2 Ticket Deletion (Demonstrating ON DELETE CASCADE)
-- Deleting from 'tickets' automatically cascades to incidents, service_requests,
-- assignments, status_histories, and resolutions without orphan records.
DELETE FROM tickets 
WHERE ticket_no = 'TKT-005';

-- Verify cascaded removal:
SELECT COUNT(*) AS remaining_references 
FROM status_histories 
WHERE ticket_id = 5;
