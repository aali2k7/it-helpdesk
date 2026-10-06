# IT Helpdesk and Asset Support Management System

**Student:** Md Aali Rahman  
**Roll Number:** 25WU0102156  
**Course:** Database Management Systems (DBMS)  
**Academic Year:** 2026  
**Section:** AIML Panthers  
**Institution:** Woxsen University, School of Technology  
**Final Evaluation:** Presentation-III — User Interface Demo  
**Presentation Date:** 7 October 2026 | 9:30 AM – 9:40 AM (Serial No: 39)  

[![MySQL](https://img.shields.io/badge/MySQL-8.0+%20%7C%209.x-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Database Architecture](https://img.shields.io/badge/Schema-3NF%20Normalized-success?style=flat)](#6-database-description)
[![User Interface](https://img.shields.io/badge/Interface-Web%20Dashboard%20SPA-blue?style=flat)](#12-ui-features)
[![Academic Evaluation](https://img.shields.io/badge/Evaluation-Presentation--III%20Ready-orange?style=flat)](#13-crud-operations)

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Features](#4-features)
5. [Technology Stack](#5-technology-stack)
6. [Database Description](#6-database-description)
7. [ER Diagram](#7-er-diagram)
8. [Installation & Setup](#8-installation--setup)
9. [MySQL Setup](#9-mysql-setup)
10. [Environment Variables](#10-environment-variables)
11. [Running the Project](#11-running-the-project)
12. [UI Features](#12-ui-features)
13. [CRUD Operations (VIEW, INSERT, DELETE)](#13-crud-operations)
14. [Screenshots](#14-screenshots)
15. [Project Structure](#15-project-structure)
16. [GitHub Usage & Commands](#16-github-usage)

---

## 1. Project Overview

The **IT Helpdesk and Asset Support Management System** is a full-featured relational database management system (RDBMS) application built for university IT departments and enterprise support teams. The system connects a responsive web dashboard directly to a live **MySQL 8.0+** database containing 14 normalized tables in **Third Normal Form (3NF)**.

The application allows students, faculty, administrators, and helpdesk technicians to manage technical tickets, track specialized subtypes (**Incidents** vs **Service Requests**), allocate hardware computing devices, enforce manufacturer warranties, record maintenance costs, and inspect chronological audit trails.

---

## 2. Problem Statement

Modern enterprise and university IT environments manage hundreds of computing devices across multiple departments. When organizations rely on spreadsheets or email threads:
- **Tickets are lost or delayed:** Requests lack centralized queuing and status accountability.
- **Hardware inventory goes missing:** Computing devices are relocated or reassigned without updating ownership or warranties.
- **Audit histories are erased:** Status transitions are overwritten rather than preserved historically.
- **Repair costs are unmonitored:** Component failures and maintenance expenditures are never aggregated per department or equipment type.

This system resolves these vulnerabilities through a centralized MySQL relational database with strict referential integrity rules and audit logging.

---

## 3. Objectives

1. **Centralized Incident & Service Request Tracking:** Standardize ticket generation with unique tracking identifiers (`TKT-XXX`), priority levels, and category classifications.
2. **Entity Specialization / Subtyping:** Model specialized entities for unplanned system disruptions (`incidents`) and routine provisioning (`service_requests`).
3. **Hardware Asset Lifecycle Tracking:** Catalog equipment by unique asset tags and serial numbers, linked to user ownership, vendor warranties, and maintenance expenditures.
4. **Immutable Audit Trails:** Maintain automated chronological state transition logs in `status_histories` and technician assignment records in `assignments`.
5. **Live CRUD Interface:** Deliver an interactive web user interface connected directly to MySQL for live viva demonstration.

---

## 4. Features

- **Live Database Connection Health Check:** Dynamic ping indicator (`● MySQL Connected (it_helpdesk)`) testing connectivity and table counts.
- **Operations Dashboard:** Real-time aggregated metrics computed via SQL aggregate queries (`COUNT`, `SUM`).
- **Tickets Management:** Interactive multi-parameter filtering (by status, category, priority, subtype), search engine, and detailed audit trail view.
- **Form-Driven INSERT:** Modal forms with validation and foreign key dropdowns for tickets, users, and assets.
- **Safe DELETE with Cascade & Restriction:** Executes real SQL `DELETE` with cascading cleanup of child records and protective `RESTRICT` warnings for users with active tickets.
- **Live SQL Query Playground:** Pre-configured analytical queries for live faculty evaluation and demonstration.
- **Interactive Visualizations:** Standalone interactive ER Diagram (`er_diagram.html`) and HTML5 Presentation Slide Deck (`presentation.html`).

---

## 5. Technology Stack

- **Database Engine:** MySQL Server 8.0+ / 9.x with InnoDB storage engine (ACID compliant).
- **Backend Application:** Python 3.8+ with `mysql-connector-python` and lightweight Flask REST API framework.
- **Frontend Architecture:** Single-Page Application (SPA) utilizing semantic HTML5, native `<dialog>` modals, Vanilla CSS3 custom properties, and Vanilla JavaScript Fetch API.
- **Testing:** Automated test suite `test_dbms.py` testing TC01 to TC10.

---

## 6. Database Description

The database `it_helpdesk` consists of **14 tables** in Third Normal Form (3NF):

| # | Table | Primary Key | Description | Key Foreign Key Rules |
|---|---|---|---|---|
| 1 | `departments` | `department_id` | Organizational divisions and locations | - |
| 2 | `users` | `user_id` | Employees, faculty, and students | `department_id` &rarr; `departments` (`RESTRICT`) |
| 3 | `categories` | `category_id` | Issue & asset classifications | - |
| 4 | `priorities` | `priority_id` | Priority levels (1 to 5) | `CHECK (level BETWEEN 1 AND 5)` |
| 5 | `support_staff` | `staff_id` | Helpdesk engineers & specialists | - |
| 6 | `warranties` | `warranty_id` | Vendor warranty agreements | `CHECK (end_date >= start_date)` |
| 7 | `assets` | `asset_id` | Computing devices and hardware | `user_id` (`SET NULL`), `category_id` (`RESTRICT`) |
| 8 | `tickets` | `ticket_id` | Core helpdesk support tickets | `user_id`, `category_id`, `priority_id` (`RESTRICT`) |
| 9 | `incidents` | `ticket_id` | Subtype: Unplanned service outages | `ticket_id` &rarr; `tickets` (`CASCADE`) |
| 10 | `service_requests` | `ticket_id` | Subtype: Routine provisioning requests | `ticket_id` &rarr; `tickets` (`CASCADE`) |
| 11 | `assignments` | `assignment_id` | Technician ticket assignments | `ticket_id` (`CASCADE`), `staff_id` (`RESTRICT`) |
| 12 | `status_histories` | `history_id` | Chronological status transition log | `ticket_id` &rarr; `tickets` (`CASCADE`) |
| 13 | `resolutions` | `resolution_id` | Documented fix solutions | `ticket_id` &rarr; `tickets` (`CASCADE`, `UNIQUE`) |
| 14 | `maintenance` | `maintenance_id` | Equipment repair and servicing logs | `asset_id` &rarr; `assets` (`CASCADE`, `CHECK cost >= 0`) |

---

## 7. ER Diagram

Access the full interactive Entity-Relationship diagram in your browser at:  
👉 **[er_diagram.html](er_diagram.html)** (or route `/er-diagram` in the running app).

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

---

## 8. Installation & Setup

### Prerequisites
- Python 3.8 or higher
- MySQL Server 8.0+ running locally on port 3306

### Clone & Environment Setup
```bash
git clone https://github.com/aali2k7/it-helpdesk.git
cd it-helpdesk

# Create Python virtual environment
python3 -m venv .venv

# Activate on macOS / Linux:
source .venv/bin/activate

# Install dependencies:
pip install -r requirements.txt
```

---

## 9. MySQL Setup

```bash
# 1. Start MySQL Server (if using Homebrew on macOS):
brew services start mysql

# 2. Initialize database schema:
mysql -u root -p < schema.sql

# 3. Populate sample seed dataset:
mysql -u root -p < seed.sql
```

---

## 10. Environment Variables

Create or update `.env` in the project root (copied from `.env.example`):

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
|---|---|---|
| `DB_HOST` | `localhost` | MySQL Server hostname |
| `DB_PORT` | `3306` | MySQL Server port |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | *(empty)* | MySQL user password |
| `DB_NAME` | `it_helpdesk` | MySQL target database |
| `FLASK_PORT` | `5050` | Port for the Web UI Server |

---

## 11. Running the Project

### Primary Web User Interface (Presentation-III)
```bash
python3 app.py
# or:
python3 main.py
```
Open your browser to: **`http://127.0.0.1:5050`**

### Legacy Terminal CLI Mode (Presentation-II)
```bash
python3 main.py --cli
```

### Run Automated Test Suite (TC01 – TC10)
```bash
python3 test_dbms.py
```

---

## 12. UI Features

1. **Top Header & Live Status:** Displays project title, student metadata, and live MySQL ping indicator.
2. **Operations Dashboard:** Aggregated KPI cards, quick action buttons, and recent tickets table.
3. **Tickets Queue:** Advanced search, status filtering, category filtering, and subtype filtering.
4. **Ticket Detail Modal:** Shows full ticket attributes, requester contact, assigned technicians, chronological status audit timeline, and resolution.
5. **Users Directory:** Full user profiles mapped to departments with ticket and asset counts.
6. **Assets Inventory:** Hardware devices with warranty validity indicators and maintenance history.
7. **SQL Verification Playground:** Execute live analytical queries against MySQL and view aligned output tables with query execution time.

---

## 13. CRUD Operations

### 1. VIEW Operation
- Fetches live data from MySQL using relational `JOIN` queries.
- Dynamically maps foreign keys to human-readable names (users, categories, priorities).
- Click **"View"** on any ticket to inspect the immutable audit log from `status_histories`.

### 2. INSERT Operation
- Click **"+ Add Ticket"**, fill the form, and submit.
- Atomically executes:
  - `INSERT INTO tickets (...)`
  - `INSERT INTO incidents (...)` OR `INSERT INTO service_requests (...)`
  - `INSERT INTO status_histories (old_status=NULL, new_status='Open')`
  - `conn.commit()`
- Immediate toast notification and table update. Persists after full page refresh.

### 3. DELETE Operation
- Click **"Delete"** on any record.
- Review confirmation modal detailing record identifier.
- Executes `DELETE FROM tickets WHERE ticket_id = %s`.
- Child tables are automatically cleaned up via `ON DELETE CASCADE`.
- Demonstrates `ON DELETE RESTRICT`: Attempting to delete a user with active tickets displays a friendly notification preventing data loss.

---

## 14. Screenshots

All screenshots were captured from the running application connected to MySQL and are saved in `Presentation-III/screenshots/`:

| View | Screenshot Preview |
|---|---|
| **Dashboard** | `Presentation-III/screenshots/dashboard.png` |
| **Tickets Queue** | `Presentation-III/screenshots/tickets-view.png` |
| **Add Ticket Form** | `Presentation-III/screenshots/ticket-insert-form.png` |
| **Before Insert** | `Presentation-III/screenshots/ticket-before-insert.png` |
| **After Insert** | `Presentation-III/screenshots/ticket-after-insert.png` |
| **Before Delete** | `Presentation-III/screenshots/ticket-before-delete.png` |
| **After Delete** | `Presentation-III/screenshots/ticket-after-delete.png` |
| **Users Directory** | `Presentation-III/screenshots/users-view.png` |
| **Assets Inventory** | `Presentation-III/screenshots/assets-view.png` |
| **Database Connected** | `Presentation-III/screenshots/database-connected.png` |

---

## 15. Project Structure

```text
it-helpdesk/
├── app.py                      # Flask Web Backend & REST API (26 endpoints)
├── db.py                       # MySQL Connection & Health-Check Engine
├── main.py                     # Primary entry point (Web UI by default; --cli for terminal)
├── schema.sql                  # 14-Table 3NF Normalized MySQL DDL
├── seed.sql                    # Initial sample seed dataset DML
├── test_dbms.py                # Automated Test Suite (TC01 – TC10)
├── capture_screenshots.py      # Automated screenshot capture script
├── requirements.txt            # Python dependencies (mysql-connector-python, flask)
├── er_diagram.html             # Interactive Entity-Relationship Diagram
├── presentation.html           # 7-Slide HTML5 Interactive Presentation Deck
├── .env.example                # Database configuration template
├── static/                     # Web UI Static Assets
│   ├── css/style.css           # Vanilla CSS Dark-Mode Design System
│   └── js/app.js               # Frontend Controller & REST API Client
├── templates/
│   └── index.html              # Main Single-Page Application Template
├── Presentation-I/             # Review 1 Deliverables & Scope Specification
├── Presentation-II/            # Review 2 Deliverables (Schema, ERD, Terminal CLI)
├── Presentation-III/           # Presentation-III Deliverables & Live Demo
│   ├── README.md               # Presentation-III guide & live demo script
│   ├── presentation.md         # 12-slide viva demonstration outline
│   ├── source/                 # Standalone source bundle
│   └── screenshots/            # 10 authentic UI screen captures
└── Project-Report/             # Official 5-Mark DBMS Project Report
    ├── README.md               # Report directory overview
    ├── project_report.md       # Comprehensive 22-section markdown report
    ├── project_report.html     # Print-ready HTML document
    └── project_report.pdf      # Exported PDF project report
```

---

## 16. GitHub Usage

```bash
# Check repository status:
git status

# View commit history:
git log --oneline -n 10

# Push changes:
git add .
git commit -m "Complete Presentation-III UI, live MySQL CRUD, test suite, and project report"
git push origin main
```
