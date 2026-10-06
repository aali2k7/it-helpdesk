# IT Helpdesk and Asset Support Management System

**Student:** Md Aali Rahman  
**Roll Number:** 25WU0102156  
**Course:** Database Management Systems (DBMS)  
**Section:** AIML Panthers  
**Academic Year:** 2026  
**Institution:** Woxsen University, School of Technology  
**Faculty Guide:** Dr. Kiranmayee Adavala  

> **One-Line Description:**  
> *"An integrated MySQL-based IT Helpdesk and Asset Support Management System for managing tickets, users, assets, incidents, service requests and support operations."*

---

## 1. Project Overview

The **IT Helpdesk and Asset Support Management System** is a production-grade relational database management application designed to centralize IT service desk operations, hardware asset tracking, warranty schedules, and incident lifecycles across enterprise or university environments. 

Connected directly to a live **MySQL 8.0+ / 9.x** database via the ACID-compliant **InnoDB** engine, the system manages 14 relational tables in **Third Normal Form (3NF)**. It cleanly decouples unplanned outages (*Incidents*) from routine requests (*Service Requests*), maintains automated chronological status audit trails, tracks hardware custodianship and repair expenditures, and provides an interactive Single-Page Application (SPA) with a real-time 3D WebGL schema visualizer for live faculty evaluation.

---

## 2. Objectives

1. **Centralize Support Operations:** Provide a unified relational intake for technical tickets with unique tracking codes (`TKT-XXX`), 5 operational categories, and 4 priority levels.
2. **Specialized Relational Subtyping:** Model distinct subtype entities for unplanned outages (`incidents`) versus routine provisioning (`service_requests`) via 1:1 foreign key inheritance.
3. **Immutable Lifecycle Auditing:** Maintain an automated, append-only chronological audit trail (`status_histories`) tracking status transitions with previous state retention and timestamps.
4. **Hardware Asset Lifecycle Governance:** Catalog physical computing equipment with unique asset tags and serial numbers, linked to employee custodians, vendor warranty schedules, and itemized maintenance repair costs.
5. **Strict Data Integrity:** Enforce primary keys, unique indexes, domain `CHECK` constraints, and foreign key rules (`RESTRICT`, `CASCADE`, `SET NULL`).
6. **Live Interactive UI:** Deliver a responsive web user interface connected to MySQL, demonstrating real-time `INSERT`, `DELETE`, and `VIEW` operations.

---

## 3. Technology Stack

| Layer | Technology | Specification / Usage |
|---|---|---|
| **Database Engine** | **MySQL 9.7.1 / 8.0+** | InnoDB Storage Engine, UTF-8 Unicode, Port 3306 |
| **Backend & API** | **Python 3.14 / Flask 3.1.3** | Parameterized SQL queries (No ORM), REST API endpoints |
| **Database Driver** | **mysql-connector-python 26.7.0** | Pure Python connection pooling, explicit transaction commits |
| **Frontend Presentation** | **HTML5, CSS3, ES6+ JS** | Vanilla Single-Page Application (SPA), Fetch API, Native Modals |
| **3D Visualizer** | **Three.js (r128 WebGL)** | Interactive 3D database node and relationship topology graph |
| **Test Suite** | **Python unittest / CLI** | Automated verification suite (`test_dbms.py`) covering TC01–TC10 |

---

## 4. Database Architecture & Schema

The schema resides in **Third Normal Form (3NF)** and contains **14 normalized tables** grouped into 5 logical domains:

```text
                                 [ departments ]
                                        │ (1:N)
                                 [    users    ] ──(1:N)──┐
                                        │ (1:N)           │ (custodian)
 [ categories ] ──(1:N)──┐              │                 ▼
                         ├───────► [  tickets  ] ──(1:1)──► [ incidents ]
 [ priorities ] ──(1:N)──┤              │
                         │              ├──────────(1:1)──► [ service_requests ]
 [ warranties ] ──(1:N)──┤              │
                         │              ├──────────(1:1)──► [ resolutions ]
 [ support_staff ] ──┐   │              │
        │ (1:N)      │   ▼              ├──────────(1:N)──► [ status_histories ]
        └────────────┼──► [ assignments ]
                     │                  │
                     └───────────► [   assets  ] ──(1:N)──► [ maintenance ]
```

### Table Summary:
1. `departments`: Academic & operational departments (`department_id` PK, `name` UNIQUE, `location`).
2. `users`: Employees and students (`user_id` PK, `email` UNIQUE, `department_id` FK).
3. `categories`: Support ticket classifications (`category_id` PK, `name` UNIQUE, `description`).
4. `priorities`: Severity rankings (`priority_id` PK, `level` CHECK 1..5).
5. `support_staff`: Helpdesk engineers (`staff_id` PK, `email` UNIQUE, `specialization`).
6. `warranties`: Equipment vendor coverage contracts (`warranty_id` PK, `end_date >= start_date`).
7. `assets`: Hardware computing inventory (`asset_id` PK, `asset_tag` UNIQUE, `serial_no` UNIQUE, FKs to `users`, `categories`, `warranties`).
8. `tickets`: Central ticket records (`ticket_id` PK, `ticket_no` UNIQUE, `status` CHECK).
9. `incidents`: Ticket subtype for unplanned failures (`ticket_id` PK/FK ON DELETE CASCADE).
10. `service_requests`: Ticket subtype for provisioning (`ticket_id` PK/FK ON DELETE CASCADE).
11. `assignments`: Technician assignment records (`assignment_id` PK, FKs to `tickets`, `support_staff`).
12. `status_histories`: Chronological state audit trail (`history_id` PK, `ticket_id` FK ON DELETE CASCADE).
13. `resolutions`: Final resolution documentation (`resolution_id` PK, `ticket_id` UNIQUE FK ON DELETE CASCADE).
14. `maintenance`: Servicing logs & repair expenses (`maintenance_id` PK, `cost` CHECK >= 0, `asset_id` FK ON DELETE CASCADE).

---

## 5. Key Features

- **Live MySQL Connectivity Monitoring:** Real-time health check pill (`● MySQL Connected: it_helpdesk`) verified via database ping.
- **Dynamic Relational Operations Dashboard:** Live counters for Total Tickets, Open vs. Resolved, Hardware Assets, Users, and Maintenance Spend.
- **Interactive 3D WebGL Schema Visualizer:** Explores 14 table nodes, schema metadata, and relationship lines in 3D space using Three.js.
- **Form-Driven Atomic Record Creation (INSERT):** Populates foreign key dropdowns directly from live tables; generates sequential ticket numbers (`TKT-006`); executes multi-table atomic transactions inserting base ticket, subtype, and initial status history.
- **Permanent Removal with Cascading Integrity (DELETE):** Deletes records with confirmation; automatically cascades removals to subtypes and audit histories while strictly protecting master records (`ON DELETE RESTRICT`).
- **Relational Queues with Multi-Table Joins (VIEW):** Real-time status filtering, keyword search, priority sorting, and detail modal revealing the full relational graph and status audit history.
- **Live SQL Verification Playground:** Interactive query runner pre-configured with analytical queries (technician workloads, maintenance spend, audit logs) for live faculty demonstration.

---

## 6. Repository Structure

The repository is structured strictly according to official course guidelines into four primary submission directories:

```text
DBMS-Course-Project/
│
├── README.md                               # Root faculty navigation & project overview
├── .gitignore                              # Git ignore list
│
├── Presentation-I/                         # Evaluation-I Deliverables
│   ├── Presentation-I.pptx                 # Original Problem Description slides (Editable)
│   ├── Presentation-I.pdf                  # Original Problem Description slides (Academic PDF)
│   └── README.md                           # Presentation-I directory guide
│
├── Presentation-II/                        # Evaluation-II Deliverables
│   ├── Presentation-II.pptx                # Schema, ERD & SQL slides (Editable)
│   ├── Presentation-II.pdf                 # Schema, ERD & SQL slides (Academic PDF)
│   ├── ER-Diagram.png                      # High-resolution ER diagram
│   ├── ER-Diagram.pdf                      # High-resolution vector ER diagram
│   ├── SQL-Commands.sql                    # Consolidated DDL, DML, and query script
│   ├── Presentation-II-Query-Solution.sql  # Solution to assigned Presentation-II query
│   └── README.md                           # Presentation-II directory guide
│
├── Presentation-III/                       # Evaluation-III Deliverables
│   ├── Presentation-III.pptx               # UI Demo & CRUD presentation (Editable)
│   ├── Presentation-III.pdf                # UI Demo & CRUD presentation (Academic PDF)
│   ├── README.md                           # Demonstration script & viva guide
│   ├── presentation.md                     # 12-slide demonstration outline
│   ├── screenshots/                        # 11 authentic UI screen captures
│   └── source/                             # Complete standalone application source bundle
│
├── Project-Report/                         # Final Academic Report (5 Marks)
│   ├── Project-Report.pdf                  # Comprehensive 44-page academic project report
│   └── README.md                           # Project report directory guide
│
├── app.py                                  # Primary Flask web application server
├── main.py                                 # Application entry point & CLI runner
├── db.py                                   # MySQL connection pool & status checking
├── schema.sql                              # 14-table 3NF normalized DDL
├── seed.sql                                # 55 relational seed records
├── test_dbms.py                            # Automated DBMS test suite (TC01 - TC10)
├── requirements.txt                        # Python dependencies
├── static/                                 # Web UI styles, scripts, 3D visualizer
└── templates/                              # Single-Page Application HTML template
```

---

## 7. How to Run

### Step 1: Clone Repository & Create Virtual Environment
```bash
git clone https://github.com/aali2k7/DBMS-Course-Project.git
cd DBMS-Course-Project

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Step 2: Configure MySQL Database
Ensure local MySQL is running on port 3306, then initialize schema and seed dataset:
```bash
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql
```
*(Optional: configure custom credentials in `.env` or set environment variables `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`)*.

### Step 3: Launch the Application
```bash
# Start Web User Interface (Presentation-III Mode):
python3 main.py
# or:
python3 app.py
```
Open your browser to: **`http://127.0.0.1:5050`**

### Step 4: Run Automated DBMS Test Suite
```bash
python3 test_dbms.py
```
*Executes all 10 formal test cases (TC01 – TC10), validating MySQL connectivity, relational joins, atomic inserts, cascading deletes, and constraint enforcement.*

---

## 8. Presentation Files Directory

- **Presentation-I:** [`Presentation-I/Presentation-I.pdf`](Presentation-I/Presentation-I.pdf) | [`Presentation-I.pptx`](Presentation-I/Presentation-I.pptx)  
  *Covers Problem Description, Enterprise Context, SMART Objectives, Scope Boundaries, and Functional Requirements.*
- **Presentation-II:** [`Presentation-II/Presentation-II.pdf`](Presentation-II/Presentation-II.pdf) | [`Presentation-II.pptx`](Presentation-II/Presentation-II.pptx)  
  *Covers 3NF Relational Schema, Normalization Analysis, ER Diagram, DDL/DML Commands, and Presentation-II Query Solution.*
- **Presentation-III:** [`Presentation-III/Presentation-III.pdf`](Presentation-III/Presentation-III.pdf) | [`Presentation-III.pptx`](Presentation-III/Presentation-III.pptx)  
  *Covers Live Web UI Architecture, 3D Schema Visualizer, Before/After INSERT & DELETE verification, and DBMS test results.*

---

## 9. Project Report

- **Comprehensive Project Report:** [`Project-Report/Project-Report.pdf`](Project-Report/Project-Report.pdf)  
  *A complete 44-page university DBMS academic report structured into the 16 official required sections: Cover Page, Abstract, Problem Statement, Objectives, Requirements, ER Diagram, Normalization Proofs, Data Dictionary (14 tables), SQL Commands, Analytical Queries with Outputs, UI Screenshots, Implementation Architecture, Test Case Matrix (TC01–TC10), Conclusion, References, and Appendix.*

---

## 10. GitHub Submission Information

- **Repository Name:** `DBMS-Course-Project`
- **Candidate:** Md Aali Rahman (25WU0102156)
- **Course:** Database Management Systems (DBMS)
- **Section:** AIML Panthers
- **Institution:** Woxsen University, School of Technology
- **Repository URL:** [https://github.com/aali2k7/DBMS-Course-Project](https://github.com/aali2k7/DBMS-Course-Project)
