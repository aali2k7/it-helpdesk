# IT Helpdesk and Asset Support Management System
## Final Project Report (DBMS Course Project)

**Institution:** Woxsen University, School of Technology  
**Course:** Database Management Systems (DBMS)  
**Academic Year:** 2026  
**Section:** AIML Panthers  
**Student Name:** Md Aali Rahman  
**Roll Number:** 25WU0102156  
**Evaluation Phase:** Presentation-III & Final Project Report  
**GitHub Repository:** [https://github.com/aali2k7/it-helpdesk](https://github.com/aali2k7/it-helpdesk)  

---

## Table of Contents
1. [Cover Page & Student Details](#1-cover-page--student-details)
2. [Abstract](#2-abstract)
3. [Introduction & Problem Statement](#3-introduction--problem-statement)
4. [Objectives & System Scope](#4-objectives--system-scope)
5. [Hardware & Software Requirements](#5-hardware--software-requirements)
6. [Entity-Relationship (ER) Diagram](#6-entity-relationship-er-diagram)
7. [Relational Schema & 3NF Normalization](#7-relational-schema--3nf-normalization)
8. [Comprehensive Data Dictionary](#8-comprehensive-data-dictionary)
9. [DDL & DML SQL Specifications](#9-ddl--dml-sql-specifications)
10. [Analytical Queries & MySQL Output Verification](#10-analytical-queries--mysql-output-verification)
11. [User Interface Design & Authentic Screenshots](#11-user-interface-design--authentic-screenshots)
12. [System Implementation Details](#12-system-implementation-details)
13. [Technology Stack](#13-technology-stack)
14. [Database Connectivity & Connection Architecture](#14-database-connectivity--connection-architecture)
15. [Key Code Snippets](#15-key-code-snippets)
16. [Testing Methodology](#16-testing-methodology)
17. [Test Cases & Results (TC01 – TC10)](#17-test-cases--results-tc01--tc10)
18. [Conclusion](#18-conclusion)
19. [Future Enhancements](#19-future-enhancements)
20. [References](#20-references)
21. [GitHub Repository Details](#21-github-repository-details)
22. [Appendix](#22-appendix)

---

## 1. Cover Page & Student Details

```text
========================================================================================
                                 WOXSEN UNIVERSITY
                                SCHOOL OF TECHNOLOGY
                      Department of Artificial Intelligence & ML

                                  PROJECT REPORT
                                       FOR
                              DATABASE MANAGEMENT SYSTEMS

                                   PROJECT TITLE:
              IT Helpdesk & Asset Support Management System

                                  SUBMITTED BY:
                                 Md Aali Rahman
                             Roll No: 25WU0102156
                             Section: AIML Panthers
                              Academic Year: 2026

                               UNDER GUIDANCE OF:
                           Faculty Evaluator / Course Instructor
                                Department of Computer Science
========================================================================================
```

---

## 2. Abstract

The **IT Helpdesk and Asset Support Management System** is a production-grade relational database application designed to centralize, streamline, and audit enterprise technical support workflows and computing hardware assets. Organizations face severe challenges when managing employee technical issues and computing inventory using spreadsheets, paper slips, or ad-hoc emails, resulting in untracked tickets, missing hardware, unmonitored repair costs, and absent audit histories.

This project implements a fully normalized **Third Normal Form (3NF)** relational database in **MySQL 8.0** comprising **14 interconnected tables**. The system enforces data integrity through Primary Keys, Foreign Keys (`ON DELETE CASCADE`, `RESTRICT`, and `SET NULL`), `UNIQUE`, `NOT NULL`, and check constraints. The backend is engineered in **Python 3.8+** utilizing raw parameterized SQL via `mysql-connector-python` and a lightweight REST API. A responsive, dark-mode Single-Page Application (SPA) built with semantic HTML5, Vanilla CSS, and Vanilla JavaScript provides real-time **VIEW**, **INSERT**, and **DELETE** functionality with immediate persistence in MySQL. Automated testing confirms 100% compliance across functional requirements, referential integrity rules, and database resilience.

---

## 3. Introduction & Problem Statement

### 3.1 Introduction
In modern enterprises, university campuses, and research organizations, IT support services serve as the mission-critical foundation for operational productivity. Computing assets including developer laptops, workstations, high-performance monitors, network switches, and peripheral equipment are allocated across departments such as Engineering, Human Resources, Finance, and Marketing.

### 3.2 Problem Statement
When technical support requests and equipment lifecycles are managed without a centralized relational database:
1. **Unmonitored Ticket Lifecycles:** Helpdesk requests become lost or neglected; average resolution turnaround times escalate without SLA accountability.
2. **Technician Assignment Ambiguity:** Workload distribution across technicians is opaque, leading to unassigned tickets and duplicate efforts.
3. **Untracked Hardware Allocations:** Physical relocations, user reassignments, and equipment warranty expirations are unrecorded, leading to unwarranted procurement expenses.
4. **Absence of Immutable Audit Trails:** Overwriting ticket statuses directly destroys chronological operational records, eliminating auditability.
5. **Disconnected Maintenance Costs:** Repair expenses, hardware failure rates, and recurring component defects are never aggregated per asset or department.

This project resolves these challenges by introducing a centralized, normalized relational database management system coupled with an interactive web demonstration dashboard.

---

## 4. Objectives & System Scope

### 4.1 Core Objectives
1. **Normalized Relational Architecture:** Model 14 distinct tables in Third Normal Form (3NF) to eliminate insertion, deletion, and update anomalies.
2. **Entity Subtype Modeling:** Implement relational specialization/generalization for tickets into **Incidents** (unplanned system failures) and **Service Requests** (routine provisioning).
3. **Hardware Lifecycle Management:** Catalog physical devices with unique asset tags and serial numbers, tracking assigned users, manufacturer warranties, and repair expenditures.
4. **Automated Audit Logging:** Maintain immutable chronological logs in `status_histories` for all status transitions (`Open` &rarr; `In Progress` &rarr; `Pending` &rarr; `Resolved` &rarr; `Closed` &rarr; `Cancelled`).
5. **Live CRUD Interface:** Deliver an interactive user interface executing real-time SQL operations against MySQL with instant persistence.

### 4.2 System Scope
- **User Domain:** Faculty, students, administrative staff, and IT technicians across institutional departments.
- **Support Domain:** Ticketing queues, technician assignments, resolution notes, and status lifecycles.
- **Hardware Domain:** Hardware asset registration, user ownership allocation, warranty monitoring, and repair cost logging.

---

## 5. Hardware & Software Requirements

### 5.1 Software Requirements
- **Operating System:** macOS 14+ (Sonoma/Sequoia), Ubuntu Linux 22.04 LTS, or Windows 10/11 (64-bit).
- **Database Engine:** MySQL Server 8.0+ / MySQL 9.x Enterprise or Community Server with InnoDB storage engine.
- **Backend Environment:** Python 3.8 to Python 3.14.
- **Database Driver:** `mysql-connector-python` (v8.0+ / v26.x).
- **Web Server Framework:** Flask 3.x (lightweight WSGI microframework).
- **Web Browser:** Google Chrome, Mozilla Firefox, Apple Safari, or Microsoft Edge with HTML5 and ES6 support.

### 5.2 Hardware Requirements
- **Processor:** Intel Core i3 / AMD Ryzen 3 / Apple Silicon (M1/M2/M3/M4) or higher.
- **RAM:** Minimum 4 GB (8 GB recommended for simultaneous MySQL and IDE execution).
- **Storage:** 500 MB free disk space for database tables, logs, and application source code.
- **Network Interface:** Local loopback interface (`localhost / 127.0.0.1:3306` and `:5050`).

---

## 6. Entity-Relationship (ER) Diagram

The system's conceptual data model is captured in the interactive diagram (`er_diagram.html`) and structured as follows:

```text
┌─────────────────┐       1:N       ┌─────────────────┐       1:N       ┌─────────────────┐
│   DEPARTMENTS   │ ─────────────── │      USERS      │ ─────────────── │     TICKETS     │
└─────────────────┘                 └─────────────────┘                 └─────────────────┘
                                             │                                   │
                                             │ 1:N (Allocated)                   ├─ 1:1 ── [ INCIDENTS ]
                                             ▼                                   ├─ 1:1 ── [ SERVICE_REQUESTS ]
┌─────────────────┐       1:N       ┌─────────────────┐                          ├─ 1:N ── [ ASSIGNMENTS ] ──> SUPPORT_STAFF
│   CATEGORIES    │ ─────────────── │     ASSETS      │                          ├─ 1:N ── [ STATUS_HISTORIES ]
└─────────────────┘                 └─────────────────┘                          └─ 1:1 ── [ RESOLUTIONS ]
                                       │             │
                       1:N (Warranty)  │             │ 1:N (Servicing)
                                       ▼             ▼
                              ┌─────────────┐   ┌─────────────┐
                              │ WARRANTIES  │   │ MAINTENANCE │
                              └─────────────┘   └─────────────┘
```

### Cardinality Rules & Referential Actions
- `departments` (1) &rarr; `users` (N): `ON DELETE RESTRICT ON UPDATE CASCADE`
- `users` (1) &rarr; `tickets` (N): `ON DELETE RESTRICT ON UPDATE CASCADE`
- `users` (1) &rarr; `assets` (N): `ON DELETE SET NULL ON UPDATE CASCADE`
- `categories` (1) &rarr; `tickets` (N) & `assets` (N): `ON DELETE RESTRICT ON UPDATE CASCADE`
- `priorities` (1) &rarr; `tickets` (N): `ON DELETE RESTRICT ON UPDATE CASCADE`
- `tickets` (1) &rarr; `incidents` (1): `ON DELETE CASCADE ON UPDATE CASCADE`
- `tickets` (1) &rarr; `service_requests` (1): `ON DELETE CASCADE ON UPDATE CASCADE`
- `tickets` (1) &rarr; `assignments` (N): `ON DELETE CASCADE ON UPDATE CASCADE`
- `support_staff` (1) &rarr; `assignments` (N): `ON DELETE RESTRICT ON UPDATE CASCADE`
- `tickets` (1) &rarr; `status_histories` (N): `ON DELETE CASCADE ON UPDATE CASCADE`
- `tickets` (1) &rarr; `resolutions` (1): `ON DELETE CASCADE ON UPDATE CASCADE`
- `warranties` (1) &rarr; `assets` (N): `ON DELETE SET NULL ON UPDATE CASCADE`
- `assets` (1) &rarr; `maintenance` (N): `ON DELETE CASCADE ON UPDATE CASCADE`

---

## 7. Relational Schema & 3NF Normalization

### 7.1 First Normal Form (1NF)
A relation is in 1NF if all attributes contain atomic, indivisible values, and there are no repeating groups.
- All column values are atomic (e.g. names, single emails, individual serial numbers).
- Arrays, multi-valued attributes, and comma-separated tags were strictly eliminated into separate normalized tables (`assignments`, `status_histories`).
- Every table has a clearly defined Primary Key (`INT AUTO_INCREMENT`).

### 7.2 Second Normal Form (2NF)
A relation is in 2NF if it is in 1NF and every non-prime attribute is fully functionally dependent on the entire Primary Key (no partial dependencies).
- Since all composite relationships were resolved using surrogate auto-increment primary keys or single-attribute primary keys (`ticket_id`), partial dependencies cannot exist.
- In subtype tables (`incidents` and `service_requests`), the primary key is `ticket_id`, and subtype attributes (`incident_type`, `request_type`) depend entirely on `ticket_id`.

### 7.3 Third Normal Form (3NF)
A relation is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on the primary key ($X \rightarrow Y$ implies $X$ is a superkey or $Y$ is a prime attribute).
- Department office locations depend on `department_id`, not on `user_id`. Therefore, `location` was placed in `departments`.
- Category descriptions depend on `category_id`, not on `ticket_id` or `asset_id`.
- Technician specialization depends on `staff_id`, not on `assignment_id`.
- Warranty coverage terms depend on `warranty_id`, not on `asset_id`.
- Hence, all 14 tables satisfy 3NF.

---

## 8. Comprehensive Data Dictionary

| Table Name | Column Name | Data Type | Nullable | Key | Constraints & Descriptions |
|---|---|---|---|---|---|
| `departments` | `department_id` | INT | NO | PK | `AUTO_INCREMENT` |
| `departments` | `name` | VARCHAR(100) | NO | UNIQUE | Department name |
| `departments` | `location` | VARCHAR(100) | NO | - | Office building and floor location |
| `users` | `user_id` | INT | NO | PK | `AUTO_INCREMENT` |
| `users` | `name` | VARCHAR(100) | NO | - | Employee or student full name |
| `users` | `email` | VARCHAR(150) | NO | UNIQUE | Corporate email address |
| `users` | `department_id` | INT | NO | FK | References `departments(department_id)` |
| `categories` | `category_id` | INT | NO | PK | `AUTO_INCREMENT` |
| `categories` | `name` | VARCHAR(100) | NO | UNIQUE | Category title |
| `categories` | `description` | TEXT | YES | - | Detailed description |
| `priorities` | `priority_id` | INT | NO | PK | `AUTO_INCREMENT` |
| `priorities` | `name` | VARCHAR(50) | NO | UNIQUE | Priority title (Low, Medium, High, Critical) |
| `priorities` | `level` | INT | NO | - | `CHECK (level BETWEEN 1 AND 5)` |
| `support_staff` | `staff_id` | INT | NO | PK | `AUTO_INCREMENT` |
| `support_staff` | `name` | VARCHAR(100) | NO | - | Technician full name |
| `support_staff` | `email` | VARCHAR(150) | NO | UNIQUE | Staff contact email |
| `support_staff` | `specialization` | VARCHAR(100) | NO | - | Technical specialty |
| `warranties` | `warranty_id` | INT | NO | PK | `AUTO_INCREMENT` |
| `warranties` | `start_date` | DATE | NO | - | Warranty commencement date |
| `warranties` | `end_date` | DATE | NO | - | Expiration date (`CHECK end_date >= start_date`) |
| `warranties` | `provider` | VARCHAR(100) | NO | - | Manufacturer support provider |
| `assets` | `asset_id` | INT | NO | PK | `AUTO_INCREMENT` |
| `assets` | `asset_tag` | VARCHAR(50) | NO | UNIQUE | Unique inventory barcode tag |
| `assets` | `name` | VARCHAR(100) | NO | - | Hardware model and specifications |
| `assets` | `serial_no` | VARCHAR(100) | NO | UNIQUE | Manufacturer hardware serial number |
| `assets` | `user_id` | INT | YES | FK | References `users(user_id)` |
| `assets` | `category_id` | INT | NO | FK | References `categories(category_id)` |
| `assets` | `warranty_id` | INT | YES | FK | References `warranties(warranty_id)` |
| `tickets` | `ticket_id` | INT | NO | PK | `AUTO_INCREMENT` |
| `tickets` | `ticket_no` | VARCHAR(50) | NO | UNIQUE | Formatted tracking code (`TKT-XXX`) |
| `tickets` | `user_id` | INT | NO | FK | References `users(user_id)` |
| `tickets` | `category_id` | INT | NO | FK | References `categories(category_id)` |
| `tickets` | `priority_id` | INT | NO | FK | References `priorities(priority_id)` |
| `tickets` | `title` | VARCHAR(200) | NO | - | Issue summary |
| `tickets` | `description` | TEXT | NO | - | Detailed description of complaint |
| `tickets` | `status` | VARCHAR(50) | NO | - | `CHECK (status IN ('Open', ...))` |
| `tickets` | `created_at` | TIMESTAMP | NO | - | Default `CURRENT_TIMESTAMP` |
| `incidents` | `ticket_id` | INT | NO | PK, FK | Subtype reference to `tickets(ticket_id)` |
| `incidents` | `incident_type` | VARCHAR(100) | NO | - | Unplanned disruption categorization |
| `service_requests` | `ticket_id` | INT | NO | PK, FK | Subtype reference to `tickets(ticket_id)` |
| `service_requests` | `request_type` | VARCHAR(100) | NO | - | Provisioning request classification |
| `assignments` | `assignment_id` | INT | NO | PK | `AUTO_INCREMENT` |
| `assignments` | `ticket_id` | INT | NO | FK | References `tickets(ticket_id)` |
| `assignments` | `staff_id` | INT | NO | FK | References `support_staff(staff_id)` |
| `assignments` | `assigned_at` | TIMESTAMP | NO | - | Default `CURRENT_TIMESTAMP` |
| `status_histories` | `history_id` | INT | NO | PK | `AUTO_INCREMENT` |
| `status_histories` | `ticket_id` | INT | NO | FK | References `tickets(ticket_id)` |
| `status_histories` | `old_status` | VARCHAR(50) | YES | - | Previous state (`NULL` on creation) |
| `status_histories` | `new_status` | VARCHAR(50) | NO | - | Updated state |
| `status_histories` | `changed_at` | TIMESTAMP | NO | - | Transition timestamp |
| `resolutions` | `resolution_id` | INT | NO | PK | `AUTO_INCREMENT` |
| `resolutions` | `ticket_id` | INT | NO | UNIQUE, FK | References `tickets(ticket_id)` |
| `resolutions` | `description` | TEXT | NO | - | Documented solution steps |
| `resolutions` | `resolved_at` | TIMESTAMP | NO | - | Resolution timestamp |
| `maintenance` | `maintenance_id` | INT | NO | PK | `AUTO_INCREMENT` |
| `maintenance` | `asset_id` | INT | NO | FK | References `assets(asset_id)` |
| `maintenance` | `maintenance_date` | DATE | NO | - | Date repair was carried out |
| `maintenance` | `description` | TEXT | NO | - | Repair actions performed |
| `maintenance` | `cost` | DECIMAL(10,2) | NO | - | `CHECK (cost >= 0)` |

---

## 9. DDL & DML SQL Specifications

The database schema is created via `schema.sql`:
```sql
CREATE DATABASE it_helpdesk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE it_helpdesk;
-- 14 tables created using InnoDB engine with constraints
```

Sample records are initialized via `seed.sql`:
- 4 Departments
- 5 Users
- 5 Categories
- 4 Priorities
- 4 Support Staff technicians
- 4 Warranties
- 5 Hardware Assets
- 5 Helpdesk Tickets (3 Incidents, 2 Service Requests)
- 5 Assignments
- 5 Status Histories
- 1 Resolution
- 3 Maintenance expense records

---

## 10. Analytical Queries & MySQL Output Verification

### Query 1: Chronological Audit Trail
```sql
SELECT 
    t.ticket_no,
    t.title,
    COALESCE(sh.old_status, 'Initial (None)') AS old_status,
    sh.new_status,
    DATE_FORMAT(sh.changed_at, '%Y-%m-%d %H:%i:%s') AS transition_timestamp
FROM status_histories sh
JOIN tickets t ON sh.ticket_id = t.ticket_id
ORDER BY t.ticket_no ASC, sh.changed_at ASC;
```
**Output:**
```text
+-----------+-------------------------------------+----------------+-------------+---------------------+
| ticket_no | title                               | old_status     | new_status  | transition_timestamp|
+-----------+-------------------------------------+----------------+-------------+---------------------+
| TKT-001   | Laptop display flickering constantly| Initial (None) | Open        | 2026-08-20 09:30:00 |
| TKT-001   | Laptop display flickering constantly| Open           | In Progress | 2026-08-20 10:00:00 |
| TKT-002   | VPN access setup for remote working | Initial (None) | Open        | 2026-08-21 11:15:00 |
| TKT-002   | VPN access setup for remote working | Open           | In Progress | 2026-08-21 11:30:00 |
| TKT-002   | VPN access setup for remote working | In Progress    | Resolved    | 2026-08-21 15:45:00 |
+-----------+-------------------------------------+----------------+-------------+---------------------+
```

### Query 2: Active Technician Workload
```sql
SELECT 
    s.name AS technician,
    s.specialization,
    COUNT(a.assignment_id) AS total_assigned_tickets,
    SUM(CASE WHEN t.status IN ('Open', 'In Progress', 'Pending') THEN 1 ELSE 0 END) AS active_tickets,
    SUM(CASE WHEN t.status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS completed_tickets
FROM support_staff s
LEFT JOIN assignments a ON s.staff_id = a.staff_id
LEFT JOIN tickets t ON a.ticket_id = t.ticket_id
GROUP BY s.staff_id, s.name, s.specialization
ORDER BY active_tickets DESC;
```

### Query 3: Departmental Maintenance Expenditure
```sql
SELECT 
    d.name AS department_name,
    COUNT(DISTINCT a.asset_id) AS total_assets,
    CONCAT('$', FORMAT(COALESCE(SUM(m.cost), 0.00), 2)) AS total_maintenance_spent
FROM departments d
LEFT JOIN users u ON d.department_id = u.department_id
LEFT JOIN assets a ON u.user_id = a.user_id
LEFT JOIN maintenance m ON a.asset_id = m.asset_id
GROUP BY d.department_id, d.name
ORDER BY SUM(m.cost) DESC;
```

---

## 11. User Interface Design & Authentic Screenshots

All screenshots were captured from the running application connected to MySQL:

1. **Dashboard (`screenshots/dashboard.png`):**
   - Displays real-time metric counters: 5 Total Tickets, 4 Open, 1 Resolved, 5 Assets, 5 Users, $2,400 Maintenance Spend.
   - Shows live database health check pill: `● MySQL Connected (it_helpdesk)`.
2. **Tickets Management (`screenshots/tickets-view.png`):**
   - Relational queue with dynamic status badges, priority levels, requester emails, and department locations.
3. **Add Ticket Form (`screenshots/ticket-insert-form.png`):**
   - Dynamic modal displaying User, Category, Priority dropdowns populated from MySQL, and Incident/Service Request radio selector.
4. **Before Insert (`screenshots/ticket-before-insert.png`):**
   - Table showing 5 pre-existing tickets.
5. **After Insert (`screenshots/ticket-after-insert.png`):**
   - Table immediately showing new ticket `TKT-006` with 6 total rows.
6. **Before Delete (`screenshots/ticket-before-delete.png`):**
   - Confirmation dialog displaying record details (`TKT-006`).
7. **After Delete (`screenshots/ticket-after-delete.png`):**
   - Table showing row permanently deleted and count restored to 5.
8. **Users Directory (`screenshots/users-view.png`):**
   - Displays registered users, departments, and active ticket allocations.
9. **Assets Inventory (`screenshots/assets-view.png`):**
   - Displays computing assets, tags, serials, warranty expiration dates, and maintenance counts.

---

## 12. System Implementation Details

The application architecture follows a clean 3-tier decoupled design:
1. **Presentation Tier:** Semantic HTML5 SPA with Vanilla CSS and asynchronous JavaScript fetch clients.
2. **Application / REST Tier:** Python Flask server (`app.py`) providing JSON endpoints with input validation and exception translation.
3. **Database Tier:** MySQL 8.0 server maintaining transactional integrity via the InnoDB storage engine.

---

## 13. Technology Stack

- **Backend:** Python 3.8+ (`app.py`, `db.py`, `main.py`)
- **Database Engine:** MySQL 8.0+ / 9.x InnoDB
- **Database Driver:** `mysql-connector-python`
- **Frontend:** Semantic HTML5, Vanilla CSS3, Vanilla JavaScript (ES6)
- **Deployment:** Local WSGI development server on port 5050

---

## 14. Database Connectivity & Connection Architecture

The application connects to MySQL via `db.py`:
- Connection configuration is read from `.env` or system environment variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- Autocommit is disabled (`conn.autocommit = False`) to guarantee atomic transaction handling.
- `check_db_status()` performs dynamic health checks without exposing sensitive passwords in API responses or logs.

---

## 15. Key Code Snippets

### 15.1 Atomic Multi-Table Ticket Creation
```python
# Insert ticket
insert_sql = """
    INSERT INTO tickets (ticket_no, user_id, category_id, priority_id, title, description, status, created_at)
    VALUES (%s, %s, %s, %s, %s, %s, 'Open', NOW())
"""
cursor.execute(insert_sql, (ticket_no, user_id, category_id, priority_id, title, description))
new_ticket_id = cursor.lastrowid

# Insert subtype record
if ticket_type == "Incident":
    cursor.execute("INSERT INTO incidents (ticket_id, incident_type) VALUES (%s, %s)", (new_ticket_id, subtype_detail))
else:
    cursor.execute("INSERT INTO service_requests (ticket_id, request_type) VALUES (%s, %s)", (new_ticket_id, subtype_detail))

# Insert initial status audit log
cursor.execute("INSERT INTO status_histories (ticket_id, old_status, new_status, changed_at) VALUES (%s, %s, %s, NOW())", (new_ticket_id, None, "Open"))

# Atomic commit
conn.commit()
```

### 15.2 Graceful Foreign Key Violation Handling
```python
try:
    cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
    conn.commit()
except IntegrityError:
    conn.rollback()
    return jsonify({
        "error": "Unable to delete this user because related tickets or assets exist. Please delete or reassign those records first."
    }), 409
```

---

## 16. Testing Methodology

Testing was conducted using both manual UI demonstrations and an automated test suite (`test_dbms.py`) verifying:
1. Database connectivity under normal and offline conditions.
2. Relational multi-table query accuracy.
3. Multi-table insert atomicity and persistence.
4. Cascade deletion accuracy.
5. Constraint enforcement (`CHECK`, `UNIQUE`, `NOT NULL`, `FOREIGN KEY RESTRICT`).

---

## 17. Test Cases & Results (TC01 – TC10)

| Test ID | Description | Input / Action | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC01** | Database Connectivity | Health-check endpoint `/api/status` | Successful MySQL connection, 14 tables verified | Connected to `it_helpdesk` (v9.7.1, 14 tables) | **PASS** |
| **TC02** | View Tickets | `GET /api/tickets` | Relational ticket rows loaded from MySQL | 5 tickets retrieved with joined users/categories | **PASS** |
| **TC03** | Insert Ticket | `POST /api/tickets` (Valid payload) | Record inserted into `tickets`, `incidents`, `status_histories` | `TKT-006` created with generated ID | **PASS** |
| **TC04** | Refresh & Persistence | Direct MySQL query after insertion | Record exists in MySQL database | Confirmed in MySQL InnoDB storage | **PASS** |
| **TC05** | Delete Ticket | `DELETE /api/tickets/<id>` | Record removed from MySQL | Ticket deleted successfully | **PASS** |
| **TC06** | Refresh After Delete | Direct MySQL query after deletion | Record remains permanently absent | Confirmed 0 matching rows in MySQL | **PASS** |
| **TC07** | Input Validation | `POST /api/tickets` with empty title | HTTP 400 with friendly validation message | Rejected with `"Ticket title is required."` | **PASS** |
| **TC08** | Unique Constraint | Insert user with duplicate email | HTTP 409 duplicate email rejection | Rejected with duplicate email error | **PASS** |
| **TC09** | Foreign Key Violation | Delete user with active tickets | HTTP 409 friendly constraint error | Rejected with friendly error message | **PASS** |
| **TC10** | MySQL Offline Resilience | Query with offline database port | Safe error message without exposing credentials | Returns clean database offline error | **PASS** |

**Summary: 10/10 Test Cases Passed (100% Success Rate).**

---

## 18. Conclusion

The **IT Helpdesk and Asset Support Management System** satisfies all academic and practical requirements established for the DBMS course evaluation:
1. It delivers a working, professional user interface directly connected to a live MySQL database.
2. It supports form-driven **INSERT**, table-driven **VIEW**, and cascade-aware **DELETE** operations.
3. All operations immediately persist in MySQL storage and survive page refreshes.
4. The database strictly adheres to Third Normal Form (3NF) across 14 relational tables.
5. The project code is thoroughly documented, modular, and backed by automated tests.

---

## 19. Future Enhancements

1. **SLA Breach Monitoring:** Automatic timer-based triggers updating ticket priority based on response deadlines.
2. **Automated Email Notifications:** Webhook triggers notifying requesters upon state changes.
3. **Role-Based Access Control (RBAC):** Separate authentication views for End-Users, Technicians, and Administrators.
4. **Predictive Hardware Maintenance:** Machine learning integration predicting hardware failure based on servicing frequency.

---

## 20. References

1. Elmasri, R., & Navathe, S. B. (2016). *Fundamentals of Database Systems* (7th ed.). Pearson.
2. Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020). *Database System Concepts* (7th ed.). McGraw-Hill.
3. MySQL 8.0 Reference Manual. Oracle Corporation. [https://dev.mysql.com/doc/refman/8.0/en/](https://dev.mysql.com/doc/refman/8.0/en/)
4. Python Database API Specification v2.0 (PEP 249). Python Software Foundation.

---

## 21. GitHub Repository Details

- **Repository URL:** [https://github.com/aali2k7/it-helpdesk](https://github.com/aali2k7/it-helpdesk)
- **Branch:** `main`
- **Author:** Md Aali Rahman (Roll No: 25WU0102156)

---

## 22. Appendix

### Running the Application
```bash
# 1. Activate virtual environment
source .venv/bin/activate

# 2. Run backend web server
python3 app.py

# 3. Open in browser
open http://127.0.0.1:5050
```

### Running the Automated Test Suite
```bash
python3 test_dbms.py
```
