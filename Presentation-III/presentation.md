# Presentation-III: User Interface Demonstration
## IT Helpdesk & Asset Support Management System

**Course:** Database Management Systems (DBMS)  
**Institution:** Woxsen University  
**Section:** AIML Panthers  
**Student:** Md Aali Rahman (Roll No: 25WU0102156)  
**Academic Year:** 2026  
**Presentation Slot:** 7 October 2026 | 9:30 AM – 9:40 AM (Serial No: 39)  

---

### Slide 1: Title & Project Identification
- **Project Title:** IT Helpdesk and Asset Support Management System
- **Candidate:** Md Aali Rahman
- **Roll Number:** 25WU0102156
- **Department & Section:** AIML Panthers, School of Technology, Woxsen University
- **Course:** Database Management Systems (DBMS Lab)
- **Evaluation Phase:** Presentation-III — Live User Interface & Database Connectivity Demo
- **Core Focus:** Real-time CRUD operations over a 3NF-normalized MySQL relational database.

---

### Slide 2: Problem Statement
- **Enterprise IT Challenges:**
  - Modern organizations manage hundreds of computing assets alongside daily technical complaints across diverse departments.
  - Informal channels (email chains, spreadsheets, phone calls) lead to lost tickets, unmonitored ticket lifecycles, and SLA breaches.
  - Untracked hardware assets lead to unaccounted equipment relocations, missed warranty claims, and duplicate hardware purchasing.
  - Lack of immutable audit trails: State transitions and technician reassignment histories are overwritten rather than historically preserved.
- **Relational Solution:**
  - A centralized MySQL 8.0 database enforcing relational integrity, automated ticket subtyping, immutable audit logs, and hardware lifecycle tracking.

---

### Slide 3: Objectives & Scope
1. **Centralized Incident & Request Processing:** Unified intake with unique sequential ticket numbers (`TKT-XXX`), priority hierarchies, and categorization.
2. **Relational Subtyping:** Distinct relational modeling for **Incidents** (unplanned failures/outages) versus **Service Requests** (routine provisioning and access).
3. **Hardware Lifecycle & Asset Management:** Tracking physical devices (`assets`) by asset tag and serial number, linked to user ownership, manufacturer warranties, and maintenance expenditures.
4. **Audit Trail & Accountability:** Chronological status history logs (`status_histories`) and technician assignment records (`assignments`).
5. **Interactive UI Demonstration:** Modern, responsive web interface connected directly to live MySQL without mock data or localStorage.

---

### Slide 4: Database Architecture & Relational Model (3NF)
- **Database Engine:** MySQL 8.0+ (`it_helpdesk`) with InnoDB storage engine for full ACID compliance.
- **14 Normalized Relational Tables:**
  - **Organization Domain:** `departments`, `users`
  - **Classification Domain:** `categories`, `priorities`
  - **Support Staff Domain:** `support_staff`, `assignments`
  - **Asset & Maintenance Domain:** `warranties`, `assets`, `maintenance`
  - **Ticketing & Lifecycle Domain:** `tickets`, `incidents`, `service_requests`, `status_histories`, `resolutions`
- **Key Constraints:**
  - `CHECK` constraints on priority levels (`1 <= level <= 5`), status values, warranty date validity, and non-negative maintenance costs.
  - `ON DELETE CASCADE` on ticket subtypes, assignments, status histories, and resolutions.
  - `ON DELETE RESTRICT` on users and categories to prevent accidental loss of operational history.
  - `ON DELETE SET NULL` on asset user allocations and warranty linkages.

---

### Slide 5: Technology Stack
- **Database Layer:** MySQL 8.0+ Relational Database Server running on `localhost:3306`.
- **Backend & API Layer:** Python 3.8+ with `mysql-connector-python` and lightweight Flask REST API framework.
  - Pure parameterized SQL queries (no ORM abstraction hiding relational operations).
  - Explicit transaction management (`autocommit = False`, atomic commits, and rollbacks on error).
- **Frontend User Interface:**
  - Modern Single-Page Application (SPA) architecture.
  - Semantic HTML5 structure with native `<dialog>` modals for accessibility and performance.
  - Vanilla CSS design system with custom properties, responsive layout, and dark-mode aesthetics.
  - Vanilla JavaScript asynchronous client using the native Fetch API.

---

### Slide 6: Operations Dashboard (UI Overview)
- **Live System Health Indicator:**
  - Displays real-time `● MySQL Connected (it_helpdesk)` status checked via database ping.
- **Dynamic Aggregate Metrics:**
  - **Total Tickets:** 5
  - **Active / Open:** 4
  - **Resolved Tickets:** 1
  - **Total Hardware Assets:** 5
  - **Registered Users:** 5
  - **Total Maintenance Expenditure:** $2,400.00
- **Quick Operations:** Direct shortcuts to create tickets, register users, catalog assets, and run SQL verification queries.
- **Recent Queue:** Aligned tabular view of active tickets with priority badges and quick details lookup.

---

### Slide 7: VIEW Operation
- **Multi-Table Relational Queries:**
  - Executes SQL `JOIN`s combining `tickets`, `users`, `departments`, `categories`, and `priorities`.
- **Relational Features:**
  - Multi-parameter filtering: Status, Category, Ticket Subtype (`Incident` vs `Service Request`).
  - Search engine matching across ticket number, title, requester name, and category.
- **Audit Trail & Detail Modal:**
  - Selecting any ticket displays its complete relational graph:
    1. Base ticket attributes and department location.
    2. Assigned technicians from `assignments` joined with `support_staff`.
    3. Chronological timeline of state transitions from `status_histories`.
    4. Resolution details from `resolutions` (if resolved).

---

### Slide 8: INSERT Operation
- **Form-Driven Record Creation:**
  - Populates foreign key selections (`user_id`, `category_id`, `priority_id`) directly from live database tables.
  - Auto-generates the next sequential ticket tracking number (e.g. `TKT-006`).
- **Atomic Multi-Table Transaction:**
  - Step 1: `INSERT INTO tickets (...)`
  - Step 2: `INSERT INTO incidents (...)` OR `INSERT INTO service_requests (...)`
  - Step 3: `INSERT INTO status_histories (old_status=NULL, new_status='Open')`
  - Step 4: `conn.commit()`
- **Immediate UI & Database Reflection:**
  - Success notification toast appears.
  - Modal resets and closes.
  - Table instantly renders the new row `TKT-006`.

---

### Slide 9: DELETE Operation
- **Permanent Removal with Referential Handling:**
  - User selects record and triggers deletion.
  - Confirmation dialog displays specific record identifier to prevent accidental loss.
  - Executes actual `DELETE FROM tickets WHERE ticket_id = %s`.
- **Cascade Execution:**
  - Database engine automatically removes associated records in `incidents`, `service_requests`, `assignments`, and `status_histories`.
- **Constraint Protection (`RESTRICT`):**
  - Attempting to delete a user with active tickets triggers a friendly notification:
    *"Unable to delete this user because related tickets or assets exist. Please delete or reassign those records first."*

---

### Slide 10: Live Database Persistence Verification
- **Verification Workflow:**
  1. **Insert:** Create `TKT-006` in the web interface &rarr; record appears immediately.
  2. **Page Refresh:** Press `F5` / `Cmd+R` &rarr; `TKT-006` remains in the table.
  3. **Direct MySQL Check:** Query `SELECT * FROM tickets WHERE ticket_no = 'TKT-006'` via terminal &rarr; row is verified in InnoDB storage.
  4. **Delete:** Remove `TKT-006` from the web interface &rarr; record disappears.
  5. **Page Refresh:** Press `F5` / `Cmd+R` &rarr; record remains permanently deleted.
- **Guarantee:** No local storage, mock arrays, or simulated state are used.

---

### Slide 11: Testing & Quality Assurance
- **Automated Test Suite (`test_dbms.py`):**
  - **TC01:** Database Connection to MySQL — **PASS**
  - **TC02:** View Tickets from MySQL — **PASS**
  - **TC03:** Insert New Ticket Record — **PASS**
  - **TC04:** Refresh & Persistence Verification — **PASS**
  - **TC05:** Delete Ticket from MySQL — **PASS**
  - **TC06:** Refresh After Delete (Remains Absent) — **PASS**
  - **TC07:** Form Input Validation (Missing Required Fields) — **PASS**
  - **TC08:** Unique Constraint Enforcement (Duplicate Email) — **PASS**
  - **TC09:** Foreign Key Deletion Violation (`RESTRICT`) — **PASS**
  - **TC10:** MySQL Offline Error Handling (Safe Message) — **PASS**
- **Test Result:** 10/10 Test Scenarios Passed (100% Success Rate).

---

### Slide 12: Conclusion & Future Enhancements
- **Summary:**
  - Successfully demonstrated an end-to-end, enterprise-ready IT Helpdesk and Asset Support Management System.
  - Complete alignment with 3NF relational normalization and database integrity constraints.
  - Robust web UI with live database reflection, audit logging, and foreign key constraint handling.
- **Future Roadmap:**
  - Automated SLA escalation triggers and email notification webhooks.
  - Multi-factor authentication (MFA) and Role-Based Access Control (RBAC).
  - Predictive hardware maintenance forecasting using machine learning models on servicing history.
