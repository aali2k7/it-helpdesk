# Review 1: IT Helpdesk & Asset Support Management System

**Course:** Database Management Systems (DBMS) Laboratory / Project  
**Project Title:** IT Helpdesk & Asset Support Management System  
**Database Name:** `it_helpdesk` (MySQL)  

---

## 1. Problem Identification
In modern organizations and educational institutions, IT infrastructure comprises diverse hardware assets (laptops, monitors, networking gear) and software systems. Managing day-to-day employee technical issues through ad-hoc communication (emails, chat messages, or verbal requests) leads to:
- Lost or untracked issue requests.
- Lack of accountability and delay in incident resolution.
- Inability to track asset allocation, warranty expirations, and repair/maintenance costs.
- Absence of historical audit trails for ticket lifecycles and service performance.

An integrated relational database system is required to centralize IT ticketing, streamline staff assignments, track status transitions, and manage asset lifecycles.

---

## 2. Scope
The scope of the project encompasses:
- **Ticketing & Incident Management:** Raising, categorizing, prioritizing, assigning, and resolving helpdesk tickets, with subtype support for specific incidents and service requests.
- **Asset & Inventory Tracking:** Cataloging IT hardware/assets, tracking assigned users, associated warranties, and maintenance records.
- **Support Operations & History:** Managing support staff profiles, recording ticket assignments, logging status transitions over time, and storing resolution summaries.

---

## 3. Objectives
1. **Centralized IT Ticketing:** Provide structured ticket creation with defined categories, priority levels, and automatic timestamping.
2. **End-to-End Lifecycle Tracking:** Maintain a complete audit log of ticket status transitions (`Open` &rarr; `In Progress` &rarr; `Resolved` &rarr; `Closed`).
3. **Asset & Maintenance Management:** Link hardware assets to users, track warranty lifecycles, and record maintenance expenses.
4. **Data Integrity & Relational Constraints:** Enforce primary keys, foreign keys, unique constraints, and check constraints to prevent orphan data or invalid states.
5. **Interactive Management Interface:** Provide a CLI application for demonstration and database interaction.

---

## 4. Users & Stakeholders
1. **End-Users / Employees:** Raise tickets for technical faults or service requests, and track allocated assets.
2. **IT Support Staff / Technicians:** View assigned queues, investigate issues, update ticket progress, and record resolutions.
3. **IT Helpdesk Administrators / Managers:** Monitor overall system performance, reassign tickets, register new assets, and track maintenance costs.

---

## 5. Functional Requirements
- **FR1: Asset Registration & Allocation:** Register hardware assets with unique asset tags, serial numbers, categories, warranties, and optional user assignment.
- **FR2: Ticket Generation:** Allow users to log tickets with category, priority, description, and optional classification into Incidents or Service Requests.
- **FR3: Assignment Workflow:** Assign pending tickets to specialized support staff members.
- **FR4: Status Progression & Audit Logging:** Record every status change (`status_histories`) along with timestamps.
- **FR5: Ticket Resolution:** Log resolution notes, timestamp resolution time, and update ticket state.
- **FR6: Asset Maintenance Logging:** Record repair history, maintenance dates, descriptions, and costs for assets.
- **FR7: Reporting & Querying:** View tabular lists of active tickets, assigned technicians, asset inventory, and warranties.

---

## 6. Initial Relational Schema

The database consists of **14 normalized relational tables**:

1. **`departments`** (`department_id` [PK], `name` [UQ], `location`)
2. **`users`** (`user_id` [PK], `name`, `email` [UQ], `department_id` [FK &rarr; `departments`])
3. **`categories`** (`category_id` [PK], `name` [UQ], `description`)
4. **`priorities`** (`priority_id` [PK], `name` [UQ], `level` [CHK 1-5])
5. **`support_staff`** (`staff_id` [PK], `name`, `email` [UQ], `specialization`)
6. **`warranties`** (`warranty_id` [PK], `start_date`, `end_date`, `provider`, [CHK end_date &ge; start_date])
7. **`assets`** (`asset_id` [PK], `asset_tag` [UQ], `name`, `serial_no` [UQ], `user_id` [FK &rarr; `users`], `category_id` [FK &rarr; `categories`], `warranty_id` [FK &rarr; `warranties`])
8. **`tickets`** (`ticket_id` [PK], `ticket_no` [UQ], `user_id` [FK &rarr; `users`], `category_id` [FK &rarr; `categories`], `priority_id` [FK &rarr; `priorities`], `title`, `description`, `status` [CHK], `created_at`)
9. **`incidents`** (`ticket_id` [PK, FK &rarr; `tickets`], `incident_type`)
10. **`service_requests`** (`ticket_id` [PK, FK &rarr; `tickets`], `request_type`)
11. **`assignments`** (`assignment_id` [PK], `ticket_id` [FK &rarr; `tickets`], `staff_id` [FK &rarr; `support_staff`], `assigned_at`)
12. **`status_histories`** (`history_id` [PK], `ticket_id` [FK &rarr; `tickets`], `old_status`, `new_status`, `changed_at`)
13. **`resolutions`** (`resolution_id` [PK], `ticket_id` [UQ, FK &rarr; `tickets`], `description`, `resolved_at`)
14. **`maintenance`** (`maintenance_id` [PK], `asset_id` [FK &rarr; `assets`], `maintenance_date`, `description`, `cost` [CHK &ge; 0])

---

*Refer to [er_diagram.html](../er_diagram.html) for visual ER entity-relationship layout and cardinality mappings.*
