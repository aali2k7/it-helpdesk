# Review 1: IT Helpdesk & Asset Support Management System

**Course:** Database Management Systems (DBMS)  
**Project Title:** IT Helpdesk & Asset Support Management System  
**Database:** MySQL (`it_helpdesk`)  
**Application Type:** Terminal-Based (Python 3 + `mysql-connector-python`)  

---

## 1. Problem Identification
Modern enterprises and educational institutions utilize diverse IT assets (laptops, workstations, network switches, peripherals) and software tools. Managing support requests and hardware maintenance through fragmented channels (emails, spreadsheets, verbal complaints) causes:
- Lost, delayed, or untracked helpdesk tickets.
- Lack of accountability in technician assignments and ticket resolution.
- Unmonitored asset allocation, missed warranty expiries, and untracked repair costs.
- Absence of historical audit trails for ticket status lifecycles.

A centralized, relational database management system is required to standardize ticketing, automate assignment workflows, log status progressions, and maintain hardware asset lifecycles.

---

## 2. Scope
- **Ticketing Operations:** Creation, categorization, prioritization, assignment, status tracking, and resolution of user requests.
- **Ticket Subtyping:** Support for specialized **Incidents** (unplanned outages/failures) and **Service Requests** (access provisioning, hardware/software requests).
- **Asset & Warranty Management:** Cataloging hardware equipment, tracking assigned users, managing manufacturer warranty validity, and logging maintenance/repair expenses.
- **Relational Integrity & Audit Logging:** Tracking ticket state changes over time (`status_histories`) and maintaining technician assignment history.

---

## 3. Objectives
1. Provide a centralized database for raising and managing IT support tickets with predefined categories and priorities.
2. Maintain an audit log of status progressions (`Open` &rarr; `In Progress` &rarr; `Pending` &rarr; `Resolved` &rarr; `Closed` &rarr; `Cancelled`).
3. Link physical assets with designated users, warranties, and maintenance records.
4. Enforce strict data integrity using Primary Keys, Foreign Keys (`CASCADE` / `RESTRICT` / `SET NULL`), `UNIQUE`, `NOT NULL`, and `CHECK` constraints.
5. Provide a modular, interactive terminal-based Python interface for demonstration and testing.

---

## 4. Users & Stakeholders
1. **End-Users (Employees / Students):** Raise IT tickets, track issue progress, and view allocated assets.
2. **IT Support Staff (Technicians / Engineers):** Pick up assigned tickets, investigate faults, update ticket status, and record resolutions.
3. **IT Helpdesk Administrators / Managers:** Oversee ticket queues, assign technicians, register new hardware assets, and review maintenance costs.

---

## 5. Functional Requirements
- **FR1 (Ticket Management):** Create tickets with title, description, category, priority, and classification into Incident or Service Request.
- **FR2 (Ticket Assignment):** Assign pending tickets to specialized support staff and automatically update status to `In Progress`.
- **FR3 (Status Lifecycle Tracking):** Update ticket status with automatic recording in `status_histories`.
- **FR4 (Ticket Resolution):** Record resolution descriptions and timestamps while preventing duplicate resolution entries.
- **FR5 (Asset Inventory):** Register hardware assets with unique asset tags, serial numbers, categories, warranties, and assigned users.
- **FR6 (Maintenance Logging):** Record maintenance dates, descriptions, and costs for assets.
- **FR7 (Relational Queries):** Retrieve tabular views of tickets, ticket details with audit trails, asset allocation, and maintenance records.

---

## 6. Initial Relational Schema (14 Tables)

### User & Organization Entities
1. **`departments`**
   - **Primary Key:** `department_id` (INT AUTO_INCREMENT)
   - **Attributes:** `name` (VARCHAR(100) NOT NULL UNIQUE), `location` (VARCHAR(100) NOT NULL)
   - **Foreign Keys:** None

2. **`users`**
   - **Primary Key:** `user_id` (INT AUTO_INCREMENT)
   - **Attributes:** `name` (VARCHAR(100) NOT NULL), `email` (VARCHAR(150) NOT NULL UNIQUE)
   - **Foreign Keys:** `department_id` &rarr; `departments(department_id)` [ON DELETE RESTRICT ON UPDATE CASCADE]

### Support & Classification Entities
3. **`categories`**
   - **Primary Key:** `category_id` (INT AUTO_INCREMENT)
   - **Attributes:** `name` (VARCHAR(100) NOT NULL UNIQUE), `description` (TEXT)
   - **Foreign Keys:** None

4. **`priorities`**
   - **Primary Key:** `priority_id` (INT AUTO_INCREMENT)
   - **Attributes:** `name` (VARCHAR(50) NOT NULL UNIQUE), `level` (INT NOT NULL, CHECK `level BETWEEN 1 AND 5`)
   - **Foreign Keys:** None

5. **`support_staff`**
   - **Primary Key:** `staff_id` (INT AUTO_INCREMENT)
   - **Attributes:** `name` (VARCHAR(100) NOT NULL), `email` (VARCHAR(150) NOT NULL UNIQUE), `specialization` (VARCHAR(100) NOT NULL)
   - **Foreign Keys:** None

### Asset & Maintenance Entities
6. **`warranties`**
   - **Primary Key:** `warranty_id` (INT AUTO_INCREMENT)
   - **Attributes:** `start_date` (DATE NOT NULL), `end_date` (DATE NOT NULL), `provider` (VARCHAR(100) NOT NULL), CHECK `end_date >= start_date`
   - **Foreign Keys:** None

7. **`assets`**
   - **Primary Key:** `asset_id` (INT AUTO_INCREMENT)
   - **Attributes:** `asset_tag` (VARCHAR(50) NOT NULL UNIQUE), `name` (VARCHAR(100) NOT NULL), `serial_no` (VARCHAR(100) NOT NULL UNIQUE)
   - **Foreign Keys:** 
     - `user_id` &rarr; `users(user_id)` [ON DELETE SET NULL ON UPDATE CASCADE]
     - `category_id` &rarr; `categories(category_id)` [ON DELETE RESTRICT ON UPDATE CASCADE]
     - `warranty_id` &rarr; `warranties(warranty_id)` [ON DELETE SET NULL ON UPDATE CASCADE]

8. **`maintenance`**
   - **Primary Key:** `maintenance_id` (INT AUTO_INCREMENT)
   - **Attributes:** `maintenance_date` (DATE NOT NULL), `description` (TEXT NOT NULL), `cost` (DECIMAL(10,2) NOT NULL DEFAULT 0.00, CHECK `cost >= 0`)
   - **Foreign Keys:** `asset_id` &rarr; `assets(asset_id)` [ON DELETE CASCADE ON UPDATE CASCADE]

### Ticket & Lifecycle Entities (Ticket-Centered Design)
9. **`tickets`**
   - **Primary Key:** `ticket_id` (INT AUTO_INCREMENT)
   - **Attributes:** `ticket_no` (VARCHAR(50) NOT NULL UNIQUE), `title` (VARCHAR(200) NOT NULL), `description` (TEXT NOT NULL), `status` (VARCHAR(50) DEFAULT 'Open', CHECK `status IN ('Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Cancelled')`), `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
   - **Foreign Keys:** 
     - `user_id` &rarr; `users(user_id)` [ON DELETE RESTRICT ON UPDATE CASCADE]
     - `category_id` &rarr; `categories(category_id)` [ON DELETE RESTRICT ON UPDATE CASCADE]
     - `priority_id` &rarr; `priorities(priority_id)` [ON DELETE RESTRICT ON UPDATE CASCADE]

10. **`incidents`** (Subtype of Ticket)
    - **Primary Key:** `ticket_id` (INT)
    - **Attributes:** `incident_type` (VARCHAR(100) NOT NULL)
    - **Foreign Keys:** `ticket_id` &rarr; `tickets(ticket_id)` [ON DELETE CASCADE ON UPDATE CASCADE]

11. **`service_requests`** (Subtype of Ticket)
    - **Primary Key:** `ticket_id` (INT)
    - **Attributes:** `request_type` (VARCHAR(100) NOT NULL)
    - **Foreign Keys:** `ticket_id` &rarr; `tickets(ticket_id)` [ON DELETE CASCADE ON UPDATE CASCADE]

12. **`assignments`**
    - **Primary Key:** `assignment_id` (INT AUTO_INCREMENT)
    - **Attributes:** `assigned_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
    - **Foreign Keys:** 
      - `ticket_id` &rarr; `tickets(ticket_id)` [ON DELETE CASCADE ON UPDATE CASCADE]
      - `staff_id` &rarr; `support_staff(staff_id)` [ON DELETE RESTRICT ON UPDATE CASCADE]

13. **`status_histories`**
    - **Primary Key:** `history_id` (INT AUTO_INCREMENT)
    - **Attributes:** `old_status` (VARCHAR(50) NULL), `new_status` (VARCHAR(50) NOT NULL), `changed_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
    - **Foreign Keys:** `ticket_id` &rarr; `tickets(ticket_id)` [ON DELETE CASCADE ON UPDATE CASCADE]

14. **`resolutions`**
    - **Primary Key:** `resolution_id` (INT AUTO_INCREMENT)
    - **Attributes:** `description` (TEXT NOT NULL), `resolved_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
    - **Foreign Keys:** `ticket_id` (UNIQUE) &rarr; `tickets(ticket_id)` [ON DELETE CASCADE ON UPDATE CASCADE]

---

*For visual ER diagram relationships and cardinality mappings, refer to [er_diagram.html](er_diagram.html).*
