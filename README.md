# IT Helpdesk & Asset Support Management System

A normalized, relational database management system and terminal-based Python CLI application for IT support ticketing and enterprise asset lifecycle management.

---

## 1. Project Title
**IT Helpdesk & Asset Support Management System**  
*College DBMS Laboratory / Course Project*

---

## 2. Problem Statement
In modern enterprises, IT departments manage a vast array of computing assets (laptops, desktops, networking equipment, peripherals) and daily technical issues across multiple departments. When support requests and hardware maintenance are managed through decentralized channels (emails, chat tools, spreadsheets):
- Helpdesk tickets are lost, misallocated, or delayed.
- Accountability in staff assignment and ticket resolution is compromised.
- Asset allocations, manufacturer warranty expirations, and repair expenses go untracked.
- Status history and resolution audit trails are missing.

This system provides a centralized MySQL relational database and a terminal-based management tool to standardize IT ticketing, automate staff assignments, enforce data integrity, and track hardware maintenance.

---

## 3. Scope
- **Ticketing Operations:** Raising, categorizing, prioritizing, assigning, updating, and resolving IT helpdesk tickets.
- **Ticket Subtyping:** Modeling specialized ticket subtypes — **Incidents** (unplanned hardware/software breakdowns) and **Service Requests** (access provisioning, hardware allocations).
- **Asset & Warranty Management:** Cataloging hardware equipment, linking assets to departments/users, tracking warranty validity, and logging maintenance expenses.
- **Relational Integrity & Audit Logging:** Logging all status transitions in `status_histories` and tracking staff assignments in `assignments`.

---

## 4. Objectives
1. **Structured Ticketing:** Standardize ticket generation with defined categories, priority levels (1–5), and unique ticket numbers (`TKT-XXX`).
2. **Lifecycle Tracking:** Maintain a complete audit log of ticket transitions (`Open` &rarr; `In Progress` &rarr; `Pending` &rarr; `Resolved` &rarr; `Closed` &rarr; `Cancelled`).
3. **Asset & Maintenance Tracking:** Link hardware assets to users, track warranties, and record maintenance dates and costs.
4. **Data Integrity:** Enforce primary keys, foreign keys (`ON DELETE` / `ON UPDATE` actions), `UNIQUE`, `NOT NULL`, and `CHECK` constraints.
5. **Interactive Demonstration:** Provide a clean, robust, terminal-based Python application for college DBMS viva demonstration.

---

## 5. Users
- **End-Users (Employees / Students):** Raise IT tickets for incidents or service requests, and view assigned equipment.
- **IT Support Staff (Technicians / Engineers):** Pick up assigned tickets, investigate faults, update ticket status, and log resolutions.
- **IT Helpdesk Administrators / Managers:** Supervise queues, reassign tickets, register new assets, and monitor maintenance costs.

---

## 6. Functional Requirements
- **FR1 (Create Ticket):** Create tickets with category, priority, title, description, and subtype classification (Incident / Service Request).
- **FR2 (View Tickets):** Display all tickets with user names, categories, priorities, statuses, and timestamps using SQL `JOIN` queries.
- **FR3 (View Ticket Details):** Display comprehensive metadata, assigned support engineers, status history timeline, and resolution summary.
- **FR4 (Assign Ticket):** Assign a ticket to a support staff member and automatically transition status to `In Progress`.
- **FR5 (Update Ticket Status):** Transition ticket status with automatic logging in `status_histories`.
- **FR6 (Resolve Ticket):** Record resolution descriptions and timestamps while preventing duplicate resolutions.
- **FR7 (View Assets):** Display asset inventory with allocated users and categories.
- **FR8 (Register Asset):** Register new hardware assets with unique asset tags, serial numbers, categories, and optional user/warranty links.
- **FR9 (View Maintenance Records):** Display maintenance history, descriptions, and costs for all assets.

---

## 7. ER Diagram
The conceptual ER diagram is visual and interactive in [er_diagram.html](er_diagram.html).

### Entity Relationships Summary
```text
DEPARTMENT (1) ──< (N) USER (1) ──< (N) TICKET
                         │                ├── (1) ── (0..1) INCIDENT
                         │                ├── (1) ── (0..1) SERVICE REQUEST
                         │                ├── (1) ── (N)    ASSIGNMENT >── (1) SUPPORT STAFF
                         │                ├── (1) ── (N)    STATUS HISTORY
                         │                └── (1) ── (0..1) RESOLUTION
                         │
                         └── (1) ──< (N) ASSET >── (1) CATEGORY
                                           │
                                           ├── (1) ── (0..1) WARRANTY
                                           └── (1) ── (N)    MAINTENANCE
```

---

## 8. Database Schema (14 Tables)

| # | Table Name | Primary Key | Foreign Keys / Constraints |
|---|---|---|---|
| 1 | `departments` | `department_id` | `name` UNIQUE |
| 2 | `users` | `user_id` | `email` UNIQUE, FK: `department_id` &rarr; `departments` |
| 3 | `categories` | `category_id` | `name` UNIQUE |
| 4 | `priorities` | `priority_id` | `name` UNIQUE, CHECK (`level BETWEEN 1 AND 5`) |
| 5 | `support_staff` | `staff_id` | `email` UNIQUE |
| 6 | `warranties` | `warranty_id` | CHECK (`end_date >= start_date`) |
| 7 | `assets` | `asset_id` | `asset_tag` UNIQUE, `serial_no` UNIQUE, FKs: `user_id`, `category_id`, `warranty_id` |
| 8 | `tickets` | `ticket_id` | `ticket_no` UNIQUE, FKs: `user_id`, `category_id`, `priority_id`, CHECK `status` |
| 9 | `incidents` | `ticket_id` | FK: `ticket_id` &rarr; `tickets` |
| 10 | `service_requests` | `ticket_id` | FK: `ticket_id` &rarr; `tickets` |
| 11 | `assignments` | `assignment_id` | FKs: `ticket_id` &rarr; `tickets`, `staff_id` &rarr; `support_staff` |
| 12 | `status_histories` | `history_id` | FK: `ticket_id` &rarr; `tickets`, `old_status` NULL |
| 13 | `resolutions` | `resolution_id` | `ticket_id` UNIQUE, FK: `ticket_id` &rarr; `tickets` |
| 14 | `maintenance` | `maintenance_id` | FK: `asset_id` &rarr; `assets`, CHECK (`cost >= 0`) |

---

## 9. Technology Stack
- **DBMS:** MySQL 8.0+ / MariaDB
- **Backend Language:** Python 3.8+
- **Database Driver:** `mysql-connector-python`
- **Application Interface:** Terminal CLI

---

## 10. Setup Instructions

### Prerequisites
- macOS, Linux, or Windows
- Python 3.8+
- MySQL Server (running on `localhost:3306`)

---

## 11. How to Install Dependencies
```bash
pip3 install -r requirements.txt
```

---

## 12. How to Create Database
Execute `schema.sql` to create the `it_helpdesk` database and all 14 tables:
```bash
mysql -u root -p < schema.sql
```

---

## 13. How to Seed Database
Execute `seed.sql` to populate realistic sample data:
```bash
mysql -u root -p < seed.sql
```

---

## 14. How to Run Application
Launch the terminal application:
```bash
python3 main.py
```

*Optional Configuration:* Custom MySQL credentials can be passed via environment variables:
```bash
export DB_HOST="localhost"
export DB_PORT="3306"
export DB_USER="root"
export DB_PASSWORD="your_password"
export DB_NAME="it_helpdesk"
python3 main.py
```

---

## 15. Terminal Application Features

The interactive numbered menu provides:

```text
========================================
   IT HELPDESK & ASSET SUPPORT SYSTEM   
========================================

1. Create Ticket
2. View All Tickets
3. View Ticket Details
4. Assign Ticket
5. Update Ticket Status
6. Resolve Ticket
7. View Assets
8. Register Asset
9. View Maintenance Records
10. Exit

Enter choice:
```

1. **Create Ticket:** Interactive prompt for User, Category, Priority, Title, Description, and Ticket Subtype (`Incident` or `Service Request`). Generates ticket number (`TKT-006`), inserts into `tickets`, inserts subtype, and logs initial `status_histories` in a single transaction.
2. **View All Tickets:** Displays an aligned ASCII table: `Ticket No | User | Category | Priority | Status | Created At` using SQL `JOIN`s.
3. **View Ticket Details:** Displays complete ticket information, assigned support engineers, status history timeline, and resolution summary.
4. **Assign Ticket:** Assigns open tickets to support staff and automatically transitions status to `In Progress`.
5. **Update Ticket Status:** Transitions ticket status between allowed states (`Open`, `In Progress`, `Pending`, `Resolved`, `Closed`, `Cancelled`) and records old/new status in `status_histories`.
6. **Resolve Ticket:** Logs resolution summary in `resolutions`, updates status to `Resolved`, and adds a status history record.
7. **View Assets:** Displays `Asset Tag | Name | Serial No | Assigned User | Category`.
8. **Register Asset:** Registers hardware assets with foreign-key validations and uniqueness checks.
9. **View Maintenance Records:** Displays asset maintenance logs with dates, descriptions, and formatted costs.
10. **Exit:** Safely closes the database connection and exits.

---

## 16. Example Commands Summary

```bash
# 1. Install dependencies
pip3 install -r requirements.txt

# 2. Recreate schema
mysql -u root -p < schema.sql

# 3. Seed sample data
mysql -u root -p < seed.sql

# 4. Start the application
python3 main.py
```

---

## Project Structure
```text
it-helpdesk/
├── .gitignore              # Git ignore rules for Python, virtual environments, and OS files
├── er_diagram.html         # Interactive Conceptual ER Diagram
├── main.py                 # Complete terminal Python application
├── README.md               # Complete project documentation
├── requirements.txt        # Python dependency (mysql-connector-python)
├── review1.md              # Review 1 project documentation
├── schema.sql              # DDL schema for all 14 MySQL tables
├── seed.sql                # Seed sample data for all 14 tables
└── docs/
    └── review1.md          # Review 1 submission report
```
