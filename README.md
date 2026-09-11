# IT Helpdesk & Asset Support Management System

[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Database Architecture](https://img.shields.io/badge/Schema-3NF%20Normalized-success?style=flat)](#8-database-schema--integrity-constraints)
[![CLI Application](https://img.shields.io/badge/Interface-Terminal%20CLI-blue?style=flat)](#13-terminal-application-features)
[![Academic Project](https://img.shields.io/badge/Course-DBMS%20Lab-orange?style=flat)](#1-project-overview)

A fully normalized, relational database management system (RDBMS) and terminal-based Python application for enterprise IT support operations, hardware asset tracking, and service lifecycle management. Designed with 14 interconnected MySQL tables in Third Normal Form (3NF), complete with audit logging, ticket subtyping, an interactive HTML5 presentation deck, and an interactive ER diagram.

---

## Quick Navigation
- [1. Project Overview](#1-project-overview)
- [2. Problem Statement](#2-problem-statement)
- [3. System Objectives](#3-system-objectives)
- [4. Functional Requirements](#4-functional-requirements)
- [5. System Architecture & Domains](#5-system-architecture--domains)
- [6. Entity Relationship Diagram (ERD)](#6-entity-relationship-diagram-erd)
- [7. Interactive Presentation Deck](#7-interactive-presentation-deck)
- [8. Database Schema & Integrity Constraints](#8-database-schema--integrity-constraints)
- [9. Technology Stack](#9-technology-stack)
- [10. Setup & Installation](#10-setup--installation)
- [11. Running the Application](#11-running-the-application)
- [12. Configuration via Environment Variables](#12-configuration-via-environment-variables)
- [13. Terminal Application Features](#13-terminal-application-features)
- [14. Sample Verification & Analytics Queries](#14-sample-verification--analytics-queries)
- [15. Project Directory Structure](#15-project-directory-structure)

---

## 1. Project Overview
- **Project Title:** IT Helpdesk & Asset Support Management System
- **Academic Context:** Database Management Systems (DBMS) Laboratory / Course Project
- **Database Engine:** MySQL 8.0+ (`it_helpdesk`)
- **Backend Application:** Python 3.8+ CLI with `mysql-connector-python`
- **Visual Tools:** Interactive Presentation Deck ([presentation.html](presentation.html)) and Conceptual ER Diagram ([er_diagram.html](er_diagram.html))
- **Documentation:** Review 1 Specification ([review1.md](review1.md) / [docs/review1.md](docs/review1.md))

---

## 2. Problem Statement
In modern enterprises and educational institutions, IT departments manage hundreds of computing assets (laptops, workstations, network switches, peripherals) alongside daily technical support requests across various organizational departments. When managed through spreadsheets, email threads, or ad-hoc chats:
- **Tickets are Lost or Delayed:** Lack of centralized queuing leads to unmonitored ticket lifecycles and SLA breaches.
- **No Technician Accountability:** Staff assignments, workload distributions, and technician handovers lack transparency.
- **Untracked Hardware Assets:** Equipment relocations, user allocations, and warranty expiries go unmonitored, causing unexpected downtime and procurement redundancies.
- **Absence of Audit Trails:** State transitions and resolution histories are overwritten rather than historically preserved.
- **Untracked Maintenance Costs:** Repair expenses, hardware failure rates, and servicing logs are not correlated with specific asset records.

This project delivers a **centralized, 3NF-normalized MySQL relational database** coupled with a **modular Python terminal interface** to enforce referential integrity, record immutable audit logs, automate assignment workflows, and manage enterprise hardware lifecycles.

---

## 3. System Objectives
1. **Structured Ticket Lifecycle:** Enforce standardized ticket creation with unique tracking numbers (`TKT-XXX`), priority levels (1–5), categories, and status transitions (`Open` &rarr; `In Progress` &rarr; `Pending` &rarr; `Resolved` &rarr; `Closed` &rarr; `Cancelled`).
2. **Specialized Ticket Subtyping:** Support entity inheritance modeling for **Incidents** (unplanned system outages) and **Service Requests** (routine provisioning and access requests).
3. **Hardware Lifecycle & Asset Management:** Catalog assets with unique asset tags and serial numbers, assign physical ownership to users, link vendor warranties, and track servicing costs.
4. **Referential Integrity & Constraints:** Enforce robust database rules using Primary Keys, Foreign Keys (`ON DELETE CASCADE / RESTRICT / SET NULL`), `UNIQUE`, `NOT NULL`, and `CHECK` constraints.
5. **Immutable Audit History:** Maintain automated chronological logs in `status_histories` for all ticket status updates and in `assignments` for technician assignments.
6. **Dual Presentation & Demonstration Interfaces:** Offer an interactive, animated presentation slide deck for evaluation alongside a terminal-driven management suite.

---

## 4. Functional Requirements

| ID | Module | Functional Specification |
|---|---|---|
| **FR-01** | **Ticket Lifecycle Management** | Create, categorize, and prioritize issues with automated subtyping into `Incident` (system failure) or `Service Request` (provisioning/access). |
| **FR-02** | **Technician Assignment Engine** | Assign open tickets to qualified support staff, validating foreign keys and automatically transitioning ticket status to `In Progress`. |
| **FR-03** | **Status Lifecycle & Audit Logging** | Record every state transition in `status_histories` with timestamps, previous status, and updated status. |
| **FR-04** | **Resolution Verification** | Record resolution descriptions and timestamps while enforcing `UNIQUE(ticket_id)` in `resolutions` to prevent duplicate closures. |
| **FR-05** | **Hardware Asset Inventory** | Catalog equipment with unique asset tags, serial numbers, categories, departmental locations, and user ownership allocations. |
| **FR-06** | **Maintenance & Expense Records** | Log repair dates, action descriptions, and costs (`CHECK cost >= 0`) directly tied to physical assets. |
| **FR-07** | **Relational Reporting & Analytics** | Execute multi-table relational queries with `JOIN` and aggregation functions to track queues, technician workloads, and asset costs. |

---

## 5. System Architecture & Domains

The database schema is structured into **three cohesive logical domains** comprising 14 relational tables:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           IT HELPDESK SYSTEM                            │
├──────────────────────┬──────────────────────────┬───────────────────────┤
│ ORGANIZATION DOMAIN  │ ASSET & LIFECYCLE DOMAIN │ SUPPORT & OPERATIONS  │
├──────────────────────┼──────────────────────────┼───────────────────────┤
│ • departments        │ • categories             │ • priorities          │
│ • users              │ • assets                 │ • support_staff       │
│                      │ • warranties             │ • tickets             │
│                      │ • maintenance            │ • incidents           │
│                      │                          │ • service_requests    │
│                      │                          │ • assignments         │
│                      │                          │ • status_histories    │
│                      │                          │ • resolutions         │
└──────────────────────┴──────────────────────────┴───────────────────────┘
```

### Domain Descriptions
1. **Organization Domain:** Manages institutional hierarchy, physical office locations, and user profiles (`departments`, `users`).
2. **Asset & Lifecycle Domain:** Tracks hardware inventory, categorization, manufacturer warranty coverage, and repair expenditure (`categories`, `assets`, `warranties`, `maintenance`).
3. **Ticketing & Support Operations Domain:** Handles issue reporting, priority hierarchies, staff assignments, status audit logs, subtype classifications, and ticket resolution records.

---

## 6. Entity Relationship Diagram (ERD)

The system includes a dedicated visual interactive diagram accessible directly in your web browser: **[er_diagram.html](er_diagram.html)**.

### High-Level Relationship Map
```text
DEPARTMENT (1) ──< (N) USER (1) ──< (N) TICKET (1) ── (0..1) INCIDENT
                         │                │
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

### Cardinality Summary
- `departments (1)` &rarr; `users (N)`: One department contains multiple users; each user belongs to one department.
- `users (1)` &rarr; `tickets (N)`: One user can raise multiple tickets; each ticket belongs to one user.
- `users (1)` &rarr; `assets (N)`: One user can be allocated multiple physical assets (optional, `SET NULL` on delete).
- `tickets (1)` &rarr; `incidents (0..1)` / `service_requests (0..1)`: Subtype inheritance using `ticket_id` as both PK and FK.
- `tickets (1)` &rarr; `assignments (N)`: One ticket can have multiple technician assignments over its lifetime.
- `support_staff (1)` &rarr; `assignments (N)`: One support staff member handles multiple ticket assignments.
- `tickets (1)` &rarr; `status_histories (N)`: One ticket produces an audit trail of chronological status changes.
- `tickets (1)` &rarr; `resolutions (0..1)`: One ticket has at most one resolution record (`ticket_id` is unique).
- `categories (1)` &rarr; `assets (N)` & `tickets (N)`: Classification for both hardware devices and ticket issues.
- `warranties (1)` &rarr; `assets (N)`: A warranty agreement covers one or more assets.
- `assets (1)` &rarr; `maintenance (N)`: An asset can have multiple maintenance logs over its operating lifecycle.

---

## 7. Interactive Presentation Deck

A standalone, modern slide presentation built with HTML5, CSS3, dynamic SVG connectors, and Vanilla JavaScript is included in **[presentation.html](presentation.html)**.

### Presentation Highlights
- **Slide 1 — Project Overview:** Academic DBMS review banner, system description, and architectural pillars.
- **Slide 2 — The Problem:** Core pain points in enterprise IT operations (visibility, delays, asset allocation, warranty tracking).
- **Slide 3 — What Are We Building?:** System capabilities, goals, and operational workflows.
- **Slide 4 — Functional Requirements:** Interactive cards showcasing FR-01 through FR-07.
- **Slide 5 — Core Data Model:** Domain architecture boards and foreign key mappings.
- **Slide 6 — Interactive ERD:** Interactive entity relationship board with dynamic SVG relationship lines that illuminate on entity click.
- **Slide 7 — Implementation & Roadmap:** Technology stack breakdown, normalization steps, and future extensions.

### Presentation Controls
- **Next Slide:** `Right Arrow` (`→`), `Space`, or `PageDown`
- **Previous Slide:** `Left Arrow` (`←`), `Shift + Space`, or `PageUp`
- **First / Last Slide:** `Home` / `End`
- **Fullscreen Mode:** Toggle via the top-right button or `F` key
- **Entity Interaction (Slide 6):** Click any entity card to highlight its relational links; click the canvas background to reset.

---

## 8. Database Schema & Integrity Constraints

The relational schema comprises **14 tables** defined in [schema.sql](schema.sql), pre-populated with realistic sample data in [seed.sql](seed.sql).

### Table Schema Summary

| # | Table | Primary Key | Attributes & Constraints | Foreign Key & Referential Action |
|---|---|---|---|---|
| **1** | `departments` | `department_id` (INT, AI) | `name` VARCHAR(100) UNIQUE, `location` VARCHAR(100) | *None* |
| **2** | `users` | `user_id` (INT, AI) | `name` VARCHAR(100), `email` VARCHAR(150) UNIQUE | `department_id` &rarr; `departments` (`RESTRICT`, `CASCADE`) |
| **3** | `categories` | `category_id` (INT, AI) | `name` VARCHAR(100) UNIQUE, `description` TEXT | *None* |
| **4** | `priorities` | `priority_id` (INT, AI) | `name` VARCHAR(50) UNIQUE, `level` INT (`CHECK level BETWEEN 1 AND 5`) | *None* |
| **5** | `support_staff` | `staff_id` (INT, AI) | `name` VARCHAR(100), `email` VARCHAR(150) UNIQUE, `specialization` VARCHAR(100) | *None* |
| **6** | `warranties` | `warranty_id` (INT, AI) | `start_date` DATE, `end_date` DATE, `provider` VARCHAR(100), `CHECK (end_date >= start_date)` | *None* |
| **7** | `assets` | `asset_id` (INT, AI) | `asset_tag` VARCHAR(50) UNIQUE, `name` VARCHAR(100), `serial_no` VARCHAR(100) UNIQUE | `user_id` &rarr; `users` (`SET NULL`, `CASCADE`)<br>`category_id` &rarr; `categories` (`RESTRICT`, `CASCADE`)<br>`warranty_id` &rarr; `warranties` (`SET NULL`, `CASCADE`) |
| **8** | `tickets` | `ticket_id` (INT, AI) | `ticket_no` VARCHAR(50) UNIQUE, `title` VARCHAR(200), `description` TEXT, `status` VARCHAR(50) (`CHECK status IN ('Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Cancelled')`), `created_at` TIMESTAMP | `user_id` &rarr; `users` (`RESTRICT`, `CASCADE`)<br>`category_id` &rarr; `categories` (`RESTRICT`, `CASCADE`)<br>`priority_id` &rarr; `priorities` (`RESTRICT`, `CASCADE`) |
| **9** | `incidents` | `ticket_id` (INT) | `incident_type` VARCHAR(100) | `ticket_id` &rarr; `tickets` (`CASCADE`, `CASCADE`) |
| **10** | `service_requests` | `ticket_id` (INT) | `request_type` VARCHAR(100) | `ticket_id` &rarr; `tickets` (`CASCADE`, `CASCADE`) |
| **11** | `assignments` | `assignment_id` (INT, AI) | `assigned_at` TIMESTAMP | `ticket_id` &rarr; `tickets` (`CASCADE`, `CASCADE`)<br>`staff_id` &rarr; `support_staff` (`RESTRICT`, `CASCADE`) |
| **12** | `status_histories` | `history_id` (INT, AI) | `old_status` VARCHAR(50) NULL, `new_status` VARCHAR(50), `changed_at` TIMESTAMP | `ticket_id` &rarr; `tickets` (`CASCADE`, `CASCADE`) |
| **13** | `resolutions` | `resolution_id` (INT, AI) | `ticket_id` INT UNIQUE, `description` TEXT, `resolved_at` TIMESTAMP | `ticket_id` &rarr; `tickets` (`CASCADE`, `CASCADE`) |
| **14** | `maintenance` | `maintenance_id` (INT, AI) | `maintenance_date` DATE, `description` TEXT, `cost` DECIMAL(10,2) (`CHECK cost >= 0`) | `asset_id` &rarr; `assets` (`CASCADE`, `CASCADE`) |

---

## 9. Technology Stack
- **Database Server:** MySQL 8.0+ / MariaDB (InnoDB engine for ACID compliance)
- **Programming Language:** Python 3.8+
- **Database Driver:** `mysql-connector-python`
- **User Interface:** Interactive Terminal-based Command-Line Interface (CLI)
- **Frontend / Visualizations:** Semantic HTML5, CSS3 Custom Properties, SVG vector graphics, and Vanilla JavaScript

---

## 10. Setup & Installation

### Prerequisites
- macOS, Linux, or Windows
- Python 3.8 or higher
- MySQL Server 8.0+ running on `localhost:3306`

### Step 1: Clone the Repository
```bash
git clone https://github.com/aali2k7/it-helpdesk.git
cd it-helpdesk
```

### Step 2: Set Up Python Virtual Environment
```bash
# Create virtual environment
python3 -m venv .venv

# Activate on macOS / Linux:
source .venv/bin/activate

# Activate on Windows (Command Prompt):
# .venv\Scripts\activate.bat

# Activate on Windows (PowerShell):
# .venv\Scripts\Activate.ps1
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Create Database Schema
Execute [schema.sql](schema.sql) to create the `it_helpdesk` database and all 14 normalized tables:
```bash
mysql -u root -p < schema.sql
```

### Step 5: Seed Sample Data
Execute [seed.sql](seed.sql) to populate realistic departments, users, categories, staff, assets, warranties, tickets, and audit history:
```bash
mysql -u root -p < seed.sql
```

---

## 11. Running the Application

Launch the terminal CLI management system:
```bash
python3 main.py
```

---

## 12. Configuration via Environment Variables

The application connects to `localhost:3306` as `root` with no password by default. You can configure custom connection parameters via environment variables:

| Variable | Description | Default Value |
|---|---|---|
| `DB_HOST` | MySQL Server host address | `localhost` |
| `DB_PORT` | MySQL Server port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | *(empty string)* |
| `DB_NAME` | MySQL target database | `it_helpdesk` |

### Example Command (macOS / Linux):
```bash
DB_HOST="127.0.0.1" DB_PORT="3306" DB_USER="root" DB_PASSWORD="my_password" python3 main.py
```

### Example Command (Windows PowerShell):
```powershell
$env:DB_PASSWORD="my_password"; python main.py
```

---

## 13. Terminal Application Features

Upon startup, the application displays an interactive numbered menu:

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

### Detailed Menu Operations

#### 1. Create Ticket
- Prompts for User, Category, Priority, Title, Description, and Ticket Subtype (`Incident` vs `Service Request`).
- Generates a sequential ticket number (e.g., `TKT-006`).
- Atomically executes database insertion inside a single transaction:
  - Inserts ticket record into `tickets`.
  - Inserts subtype attributes into `incidents` or `service_requests`.
  - Logs the initial status (`NULL` &rarr; `'Open'`) into `status_histories`.

#### 2. View All Tickets
- Displays an aligned ASCII table querying `tickets`, `users`, `categories`, and `priorities` via `JOIN` clauses.
- Columns: `Ticket No | User | Category | Priority | Status | Created At`.

#### 3. View Ticket Details
- Prompts for a Ticket Number (e.g., `TKT-001`) or Database ID.
- Displays comprehensive metadata including:
  - **Ticket Information:** Title, Description, Subtype classification, Category, Priority.
  - **Requester Information:** User name, Department, Email.
  - **Technician Assignments:** Assigned staff name, specialization, and assignment timestamps.
  - **Status History Audit Trail:** Complete chronological timeline of state transitions.
  - **Resolution Information:** Resolution notes and completion timestamp (if resolved).

#### 4. Assign Ticket
- Lists open/unresolved tickets and available support staff engineers.
- Prompts for Ticket and Support Staff selection.
- Inserts an assignment record into `assignments`.
- Automatically transitions ticket status to `In Progress` and logs the transition in `status_histories`.

#### 5. Update Ticket Status
- Prompts for Ticket and target status (`Open`, `In Progress`, `Pending`, `Resolved`, `Closed`, `Cancelled`).
- Enforces valid transition logic and automatically inserts the previous and new status into `status_histories`.

#### 6. Resolve Ticket
- Prompts for Ticket and resolution description.
- Checks if a resolution already exists (preventing duplicates).
- Inserts a record into `resolutions`, sets ticket status to `Resolved`, and logs the state change in `status_histories`.

#### 7. View Assets
- Displays enterprise hardware inventory using relational `JOIN`s with `users`, `departments`, and `categories`.
- Columns: `Asset Tag | Name | Serial No | Assigned User | Department | Category`.

#### 8. Register Asset
- Prompts for Asset Tag, Asset Name, Serial Number, Category, optional User allocation, and optional Warranty agreement.
- Validates foreign keys and uniqueness constraints before executing insertion.

#### 9. View Maintenance Records
- Displays maintenance servicing logs for hardware equipment.
- Formats dates, repair descriptions, and servicing expenditures (`$ cost`).

#### 10. Exit
- Gracefully closes the MySQL database connection pool and terminates the CLI session.

---

## 14. Sample Verification & Analytics Queries

Teachers, evaluators, and developers can test the database directly via MySQL CLI or GUI tools (phpMyAdmin, MySQL Workbench, DBeaver) using these analytical queries:

### 1. View Complete Ticket Audit Trail
```sql
SELECT 
    t.ticket_no,
    t.title,
    sh.old_status,
    sh.new_status,
    sh.changed_at
FROM status_histories sh
JOIN tickets t ON sh.ticket_id = t.ticket_id
ORDER BY t.ticket_no ASC, sh.changed_at ASC;
```

### 2. View Active Support Staff Workload
```sql
SELECT 
    s.name AS technician_name,
    s.specialization,
    COUNT(a.assignment_id) AS total_assigned_tickets,
    SUM(CASE WHEN t.status IN ('Open', 'In Progress', 'Pending') THEN 1 ELSE 0 END) AS active_tickets
FROM support_staff s
LEFT JOIN assignments a ON s.staff_id = a.staff_id
LEFT JOIN tickets t ON a.ticket_id = t.ticket_id
GROUP BY s.staff_id, s.name, s.specialization
ORDER BY active_tickets DESC;
```

### 3. Total Hardware Maintenance Costs per Department
```sql
SELECT 
    d.name AS department_name,
    COUNT(DISTINCT a.asset_id) AS total_assets,
    COALESCE(SUM(m.cost), 0.00) AS total_maintenance_spent
FROM departments d
LEFT JOIN users u ON d.department_id = u.department_id
LEFT JOIN assets a ON u.user_id = a.user_id
LEFT JOIN maintenance m ON a.asset_id = m.asset_id
GROUP BY d.department_id, d.name
ORDER BY total_maintenance_spent DESC;
```

### 4. Hardware Expiring Warranties
```sql
SELECT 
    a.asset_tag,
    a.name AS asset_name,
    w.provider,
    w.end_date,
    DATEDIFF(w.end_date, CURDATE()) AS days_until_expiry
FROM assets a
JOIN warranties w ON a.warranty_id = w.warranty_id
WHERE w.end_date >= CURDATE()
ORDER BY days_until_expiry ASC;
```

---

## 15. Project Directory Structure

```text
it-helpdesk/
├── .gitignore              # Git ignore patterns for Python, environments, and OS files
├── er_diagram.html         # Interactive Conceptual Entity-Relationship Diagram (Canvas + SVG)
├── main.py                 # Terminal-based Python CLI application (10 menu operations)
├── presentation.html       # 7-slide interactive HTML5 presentation deck with animated ERD
├── README.md               # Comprehensive system documentation and operational guide
├── requirements.txt        # Python dependency manifest (mysql-connector-python)
├── review1.md              # Review 1 submission report (Markdown specification)
├── schema.sql              # Normalized DDL script creating all 14 MySQL tables
├── seed.sql                # DML script populating realistic sample records
└── docs/
    └── review1.md          # Review 1 report documentation copy
```

---

## Authors & Acknowledgments
- **Project Title:** IT Helpdesk & Asset Support Management System
- **Repository:** [github.com/aali2k7/it-helpdesk](https://github.com/aali2k7/it-helpdesk)
- **Course:** Database Management Systems (DBMS) Laboratory
