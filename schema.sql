-- ==========================================================
-- IT Helpdesk & Asset Support Management System
-- Database Schema Definition (schema.sql)
-- DBMS: MySQL 8.0+
-- Database: it_helpdesk
-- ==========================================================

DROP DATABASE IF EXISTS it_helpdesk;
CREATE DATABASE it_helpdesk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE it_helpdesk;

-- 1. DEPARTMENTS
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 2. USERS (Employees / End-Users)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3. CATEGORIES
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB;

-- 4. PRIORITIES
CREATE TABLE priorities (
    priority_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    level INT NOT NULL,
    CONSTRAINT chk_priority_level CHECK (level BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- 5. SUPPORT STAFF (Helpdesk Technicians / Engineers)
CREATE TABLE support_staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    specialization VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 6. WARRANTIES
CREATE TABLE warranties (
    warranty_id INT AUTO_INCREMENT PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    provider VARCHAR(100) NOT NULL,
    CONSTRAINT chk_warranty_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB;

-- 7. ASSETS (Hardware / Equipment)
CREATE TABLE assets (
    asset_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    serial_no VARCHAR(100) NOT NULL UNIQUE,
    user_id INT NULL,
    category_id INT NOT NULL,
    warranty_id INT NULL,
    CONSTRAINT fk_assets_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_assets_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_assets_warranty
        FOREIGN KEY (warranty_id) REFERENCES warranties(warranty_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. TICKETS
CREATE TABLE tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_no VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    priority_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_ticket_status CHECK (status IN ('Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Cancelled')),
    CONSTRAINT fk_tickets_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_tickets_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_tickets_priority
        FOREIGN KEY (priority_id) REFERENCES priorities(priority_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. INCIDENTS (Subtype of Ticket)
CREATE TABLE incidents (
    ticket_id INT PRIMARY KEY,
    incident_type VARCHAR(100) NOT NULL,
    CONSTRAINT fk_incidents_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 10. SERVICE REQUESTS (Subtype of Ticket)
CREATE TABLE service_requests (
    ticket_id INT PRIMARY KEY,
    request_type VARCHAR(100) NOT NULL,
    CONSTRAINT fk_service_requests_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 11. ASSIGNMENTS
CREATE TABLE assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    staff_id INT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignments_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_assignments_staff
        FOREIGN KEY (staff_id) REFERENCES support_staff(staff_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 12. STATUS HISTORIES
CREATE TABLE status_histories (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_status_histories_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 13. RESOLUTIONS
CREATE TABLE resolutions (
    resolution_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    resolved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resolutions_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 14. MAINTENANCE
CREATE TABLE maintenance (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    maintenance_date DATE NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT chk_maintenance_cost CHECK (cost >= 0),
    CONSTRAINT fk_maintenance_asset
        FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
