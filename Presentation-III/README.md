# Presentation-III: User Interface Demo
## IT Helpdesk & Asset Support Management System

**Course:** Database Management Systems (DBMS)  
**Institution:** Woxsen University  
**Section:** AIML Panthers  
**Student:** Md Aali Rahman  
**Roll Number:** 25WU0102156  
**Academic Year:** 2026  
**Presentation Date:** 7 October 2026  
**Slot Time:** 9:30 AM – 9:40 AM (Serial No: 39)  

---

## 1. Executive Summary & Deliverables

This folder contains the final UI demonstration materials, source code and screenshots:

- **Presentation Slides (Editable PPTX):** [`Presentation-III.pptx`](Presentation-III.pptx)
- **Presentation Slides (Academic PDF):** [`Presentation-III.pdf`](Presentation-III.pdf)
- **Standalone Source Bundle:** [`source/`](source/)
- **Live UI Screen Captures:** [`screenshots/`](screenshots/)

Presentation-III requires demonstrating a fully working user interface connected to the live MySQL database (`it_helpdesk`), supporting:
1. **Live MySQL Connection:** Real-time database health check and dynamic status indicators.
2. **VIEW Operations:** Multi-table relational queries displaying tickets, users, assets, incidents, service requests, and maintenance logs.
3. **INSERT Operations:** Form-driven creation of tickets (with subtype modeling), users, and hardware assets executing atomic SQL `INSERT` statements.
4. **DELETE Operations:** Permanent removal of records executing SQL `DELETE` statements with foreign key cascade handling and graceful constraint enforcement.
5. **Database Persistence:** Live verification that all modifications immediately reflect in MySQL and persist across page refreshes.

---

## 2. Directory Contents

```text
Presentation-III/
├── README.md               # Presentation-III documentation & demonstration guide
├── Presentation-III.pptx    # Editable 16:9 presentation deck
├── Presentation-III.pdf     # Academic presentation PDF with embedded UI captures
├── presentation.md         # 12-slide structured evaluation presentation outline
├── source/                 # Standalone copy of application source code
│   ├── app.py              # Flask Web Backend & REST API
│   ├── db.py               # MySQL Connection Pool & Health Check
│   ├── schema.sql          # 14-table 3NF Normalized DDL
│   ├── seed.sql            # Initial sample seed dataset
│   ├── test_dbms.py        # Automated test suite (TC01 - TC10)
│   ├── static/             # Vanilla CSS design system & JavaScript client
│   └── templates/          # Single-Page Application HTML5 template
└── screenshots/            # Authentic screenshots captured from live application
    ├── dashboard.png           # Operations Dashboard with live metric cards
    ├── database-connected.png  # Header showing live MySQL connected status pill
    ├── tickets-view.png        # Relational Tickets management table
    ├── ticket-insert-form.png  # "Add Ticket" modal with subtype selection
    ├── ticket-before-insert.png# Ticket table prior to insertion (5 records)
    ├── ticket-after-insert.png # Ticket table after insertion showing TKT-006 (6 records)
    ├── ticket-before-delete.png# Delete confirmation modal with record details
    ├── ticket-after-delete.png # Ticket table after deletion (record permanently removed)
    ├── users-view.png          # Registered Users directory with department mappings
    └── assets-view.png         # Hardware Asset inventory with warranty tracking
```

---

## 3. Step-by-Step 3–5 Minute Live Demonstration Script

During your 10-minute viva slot (9:30 AM – 9:40 AM), follow this exact flow:

### Step 1: Open the System & Demonstrate Live Connection (30 seconds)
1. Open the browser to **`http://127.0.0.1:5050`**.
2. **Say to Faculty:**
   > *"Good morning professors. This is our IT Helpdesk and Asset Support Management System. Notice at the top right the green status pill: **MySQL Connected (it_helpdesk)**. This is not simulated; the backend pings our local MySQL server on port 3306 verifying all 14 tables in Third Normal Form."*
3. Click the **"🔄 Ping DB"** button to show a live successful roundtrip to MySQL.

### Step 2: Demonstrate the Operations Dashboard (30 seconds)
1. Point out the real-time aggregated metrics:
   - **Total Tickets:** 5
   - **Active / Open:** 4
   - **Resolved:** 1
   - **Total Assets:** 5
   - **Total Users:** 5
   - **Maintenance Cost:** $2,400.00
2. Explain that each metric is computed live via `COUNT(*)` and `SUM(cost)` SQL aggregate queries over MySQL tables.

### Step 3: Demonstrate VIEW Operations & Audit Logs (1 minute)
1. Click **"Tickets"** in the sidebar.
2. Show the relational table with columns: `Ticket #`, `Title`, `Type & Subtype`, `Requester`, `Department`, `Priority`, `Status`, `Created At`.
3. Highlight that data is joined across 5 tables (`tickets`, `users`, `departments`, `categories`, `priorities`).
4. Click **"View"** on `TKT-001`.
5. Show the **Status Lifecycle Audit Log**:
   - `Initial (None) → Open`
   - `Open → In Progress`
   Explain that this audit trail comes directly from the immutable `status_histories` table.

### Step 4: Demonstrate INSERT Operation & Live Persistence (1.5 minutes)
1. Click **"+ Add Ticket"**.
2. Fill the form with realistic data:
   - **Requester:** Select *Aarav Sharma*
   - **Priority:** Select *High*
   - **Category:** Select *Hardware Issue*
   - **Classification:** Select *Incident*
   - **Incident Type:** Enter `Display Flickering`
   - **Title:** Enter `USB-C Dock Video Outage`
   - **Description:** Enter `Monitor loses signal when laptop is connected to secondary dock.`
3. Click **"Create Ticket in MySQL"**.
4. **Show:**
   - Success toast appears: *"Ticket TKT-006 created successfully in MySQL database."*
   - The table immediately displays the newly created record `TKT-006`.
5. **Prove Persistence:** Press `F5` / `Cmd+R` to refresh the entire webpage.
6. **Say to Faculty:**
   > *"Notice that after a full page refresh, TKT-006 remains in the table. This proves the record is committed to MySQL InnoDB storage, not held in browser memory or mock arrays."*

### Step 5: Demonstrate DELETE Operation & Referential Integrity (1 minute)
1. On `TKT-006`, click the **"Delete"** button.
2. Show the confirmation modal with record details:
   > *"Are you sure you want to permanently delete this record from MySQL? (TKT-006: USB-C Dock Video Outage)"*
3. Click **"Delete from MySQL"**.
4. **Show:**
   - Success toast: *"Ticket TKT-006 deleted successfully from MySQL."*
   - `TKT-006` disappears from the table immediately.
5. **Prove Absence:** Refresh the webpage. `TKT-006` remains permanently gone.
6. Mention `ON DELETE CASCADE`:
   > *"Our schema defines `ON DELETE CASCADE` on `incidents`, `service_requests`, and `status_histories`, so child records were automatically cleaned up without leaving orphaned rows."*

### Step 6: Demonstrate Foreign Key RESTRICT Protection (30 seconds)
1. Switch to **"Users"**.
2. Click **"Delete"** on User #1 (*Aarav Sharma*).
3. Confirm deletion.
4. **Show Friendly Constraint Error:**
   > *"Unable to delete this user because related tickets or assets exist. Please delete or reassign those records first."*
5. Explain:
   > *"This demonstrates `ON DELETE RESTRICT` constraint enforcement, preventing accidental cascading loss of critical helpdesk history."*

### Step 7: Demonstrate Live SQL Verification (Optional / If Asked)
1. Click **"SQL Verification"** in the sidebar.
2. Select *1. Complete Ticket Audit Trail* or *2. Active Support Staff Workload*.
3. Click **"Execute Live Query in MySQL"**.
4. Show the live query execution time (~1 ms) and real SQL output table.

---

## 4. Verification Screenshots Gallery

All authentic screenshots are located in `Presentation-III/screenshots/`:

| Screenshot | File Path | Description |
|---|---|---|
| **Dashboard** | `screenshots/dashboard.png` | Comprehensive dashboard with live metric cards and recent tickets |
| **Database Connected** | `screenshots/database-connected.png` | Live database health check indicator |
| **Tickets View** | `screenshots/tickets-view.png` | Relational helpdesk tickets queue |
| **Add Ticket Form** | `screenshots/ticket-insert-form.png` | Modal form with subtype selection and validation |
| **Before Insert** | `screenshots/ticket-before-insert.png` | Tickets queue prior to record insertion |
| **After Insert** | `screenshots/ticket-after-insert.png` | Tickets queue displaying new record TKT-006 |
| **Before Delete** | `screenshots/ticket-before-delete.png` | Deletion confirmation modal |
| **After Delete** | `screenshots/ticket-after-delete.png` | Tickets queue showing record permanently removed |
| **Users View** | `screenshots/users-view.png` | Registered users with department mappings |
| **Assets View** | `screenshots/assets-view.png` | Hardware assets with warranty and maintenance tracking |
