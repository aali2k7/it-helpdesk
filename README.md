# IT Helpdesk & Asset Support Management System

A normalized relational database system and terminal-based management application built with **MySQL** and **Python** for IT support operations, ticketing lifecycles, and enterprise asset tracking.

---

## 1. Problem Statement
In modern organizations and educational institutions, managing IT assets (laptops, desktops, networking hardware) and handling user support tickets via decentralized tools (emails, spreadsheets) leads to:
- Lost or unassigned support requests.
- Lack of accountability and delay in incident resolution.
- Inability to track asset allocation, warranty expirations, and repair costs.
- Absence of historical audit trails for ticket lifecycles.

This system provides a centralized MySQL relational database to manage helpdesk workflows, staff allocations, and asset maintenance.

---

## 2. Objectives
- **Centralized Helpdesk:** Register and categorize technical tickets with custom priority levels.
- **Support Workflows:** Track ticket assignments to specialized IT support staff.
- **Audit Logging:** Maintain a complete history of status changes (`Open` &rarr; `In Progress` &rarr; `Resolved` &rarr; `Closed`).
- **Asset & Warranty Management:** Track hardware inventory, user allocations, warranty validity, and maintenance expenses.
- **Data Integrity:** Enforce foreign key constraints, checks, and unique keys across 14 relational tables.

---

## 3. Technology Stack
- **Database:** MySQL 8.0+ / MariaDB
- **Application Logic:** Python 3.8+
- **Database Driver:** `mysql-connector-python`
- **Architecture:** Relational Database with CLI Terminal Interface
- **Data Modeling:** 14 Normalized Tables (3NF)

---

## 4. Database Entities & Tables
The database `it_helpdesk` consists of **14 tables**:

| # | Table Name | Purpose |
|---|---|---|
| 1 | `departments` | Company departments (Engineering, HR, Finance, etc.) |
| 2 | `users` | Employees / End-users raising tickets or using assets |
| 3 | `categories` | Helpdesk categories (Hardware, Software, Network, etc.) |
| 4 | `priorities` | Ticket urgency levels (Low, Medium, High, Critical) |
| 5 | `support_staff` | IT technicians and engineers with specializations |
| 6 | `warranties` | Hardware warranty coverage dates and providers |
| 7 | `assets` | Physical hardware inventory linked to users & warranties |
| 8 | `tickets` | Core helpdesk tickets raised by users |
| 9 | `incidents` | Ticket subtype for unplanned failures or outages |
| 10 | `service_requests` | Ticket subtype for access, hardware, or software requests |
| 11 | `assignments` | Mapping of tickets to assigned support staff |
| 12 | `status_histories` | Audit log of all ticket status changes with timestamps |
| 13 | `resolutions` | Resolution notes and timestamps for solved tickets |
| 14 | `maintenance` | Maintenance and repair history with costs for assets |

*Visual diagram: Open `er_diagram.html` in any browser to inspect the conceptual ER diagram.*

---

## 5. Setup & Installation Guide

### Prerequisites
- Python 3.8 or higher
- MySQL Server (8.0 or newer) running locally or remotely

---

### Step 1: Clone or Navigate to Project Directory
```bash
cd it-helpdesk
```

---

### Step 2: Set Up MySQL Database & Seed Data

Log in to your MySQL terminal and run the schema and seed scripts:

```bash
# Option A: Run directly via MySQL CLI
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql
```

*Or within the MySQL interactive shell:*
```sql
SOURCE /path/to/it-helpdesk/schema.sql;
SOURCE /path/to/it-helpdesk/seed.sql;
```

---

### Step 3: Install Python Dependencies

Create a virtual environment (optional but recommended) and install dependencies:

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install MySQL driver
pip install -r requirements.txt
```

---

### Step 4: Configure Database Credentials

By default, `main.py` connects to `localhost:3306`, user `root`, empty password, and database `it_helpdesk`.

You can set custom database credentials using environment variables:

```bash
export DB_HOST="localhost"
export DB_PORT="3306"
export DB_USER="root"
export DB_PASSWORD="your_mysql_password"
export DB_NAME="it_helpdesk"
```

---

### Step 5: Run the Terminal Application

```bash
python3 main.py
```

---

## 6. Terminal Application Features

The interactive terminal menu provides 8 main features:

```text
=================================================================
 IT HELPDESK & ASSET SUPPORT MANAGEMENT SYSTEM
 Database Management System Project
=================================================================

----------------------------------------
           MAIN MENU
----------------------------------------
 1. Register Asset
 2. Create Ticket
 3. View Tickets
 4. Assign Ticket
 5. Update Ticket Status
 6. Resolve Ticket
 7. View Assets
 8. Exit
----------------------------------------
```

1. **Register Asset:** Enter asset tag, model name, serial number, category, warranty, and assigned employee.
2. **Create Ticket:** Log an IT issue with category, priority level, title, description, and optional classification (Incident / Service Request).
3. **View Tickets:** Display an ASCII table of all tickets with status, priority, reporting user, and assigned technician. Drill down into any ticket ID for the full timeline, history, and resolution.
4. **Assign Ticket:** Allocate pending or open tickets to available support staff based on their specialization; automatically updates status to `In Progress`.
5. **Update Ticket Status:** Transition tickets between states (`Open`, `In Progress`, `Pending`, `Resolved`, `Closed`, `Cancelled`) and automatically record timestamps in `status_histories`.
6. **Resolve Ticket:** Mark tickets as `Resolved` and record detailed resolution summaries in the `resolutions` table.
7. **View Assets:** List company assets with current user assignments, warranty coverage, and drill down into maintenance logs.
8. **Exit:** Cleanly closes database connections and exits.

---

## 7. Project Structure
```text
it-helpdesk/
├── .gitignore              # Git ignore rules for Python & venv
├── er_diagram.html         # Interactive Conceptual ER Diagram
├── main.py                 # Terminal-based Python management app
├── README.md               # Project overview and setup instructions
├── requirements.txt        # Python package dependencies
├── schema.sql              # DDL schema for all 14 MySQL tables
├── seed.sql                # Realistic sample seed data
├── review1.md              # Review 1 project documentation
└── docs/
    └── review1.md          # Review 1 project report
```
