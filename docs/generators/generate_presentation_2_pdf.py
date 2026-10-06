import subprocess
import os

erd_path = os.path.abspath("Presentation-II/ER-Diagram.png")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Presentation-II: Schema Implementation & SQL - IT Helpdesk System</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  @page {{
    size: 16in 9in;
    margin: 0;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f8fafc;
    color: #0f172a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}

  .slide {{
    width: 16in;
    height: 9in;
    padding: 0.8in 1in 0.6in 1in;
    position: relative;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
    overflow: hidden;
  }}

  .slide-header {{
    margin-bottom: 0.35in;
  }}

  .eyebrow {{
    font-size: 0.16in;
    font-weight: 700;
    color: #2563eb;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.06in;
    display: flex;
    align-items: center;
    gap: 0.08in;
  }}

  .eyebrow::before {{
    content: '';
    display: inline-block;
    width: 0.18in;
    height: 0.04in;
    background: #2563eb;
    border-radius: 2px;
  }}

  .slide-title {{
    font-size: 0.36in;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }}

  .cards-grid {{
    display: grid;
    gap: 0.35in;
    flex: 1;
    margin-bottom: 0.35in;
  }}

  .grid-2 {{ grid-template-columns: 1fr 1fr; }}
  .grid-3 {{ grid-template-columns: 1fr 1fr 1fr; }}

  .card {{
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 0.18in;
    padding: 0.32in;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
    display: flex;
    flex-direction: column;
  }}

  .card-header {{
    font-size: 0.13in;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.06in;
  }}

  .badge-blue {{ color: #2563eb; }}
  .badge-amber {{ color: #d97706; }}
  .badge-emerald {{ color: #059669; }}
  .badge-purple {{ color: #7c3aed; }}
  .badge-muted {{ color: #64748b; }}

  .card-title {{
    font-size: 0.22in;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.16in;
    line-height: 1.25;
  }}

  .bullet-list {{
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.12in;
    flex: 1;
  }}

  .bullet-list li {{
    font-size: 0.16in;
    line-height: 1.45;
    color: #334155;
    position: relative;
    padding-left: 0.26in;
  }}

  .bullet-list li::before {{
    content: '•';
    position: absolute;
    left: 0.05in;
    top: -0.02in;
    color: #2563eb;
    font-size: 0.26in;
  }}

  .code-block {{
    background: #0f172a;
    color: #f1f5f9;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.135in;
    line-height: 1.45;
    padding: 0.2in;
    border-radius: 0.12in;
    overflow: hidden;
    margin-top: 0.1in;
  }}

  .slide-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #e2e8f0;
    padding-top: 0.12in;
    font-size: 0.13in;
    color: #64748b;
  }}

  /* Title Slide Specific */
  .title-container {{
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 0.22in;
    padding: 0.65in 0.8in;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);
  }}

  .title-eyebrow {{
    font-size: 0.15in;
    font-weight: 700;
    color: #2563eb;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.12in;
  }}

  .main-title {{
    font-size: 0.50in;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.1;
    letter-spacing: -0.025em;
    margin-bottom: 0.16in;
  }}

  .main-subtitle {{
    font-size: 0.21in;
    font-weight: 500;
    color: #475569;
    max-width: 10in;
    line-height: 1.35;
  }}

  .meta-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4in;
    margin-top: 0.4in;
  }}

  .meta-box {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.14in;
    padding: 0.25in 0.3in;
  }}

  .meta-box.highlight {{
    background: #eff6ff;
    border-color: #bfdbfe;
  }}

  .meta-label {{
    font-size: 0.12in;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #2563eb;
    margin-bottom: 0.06in;
  }}

  .meta-name {{
    font-size: 0.24in;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.04in;
  }}

  .meta-sub {{
    font-size: 0.15in;
    color: #475569;
    line-height: 1.35;
  }}
</style>
</head>
<body>

<!-- SLIDE 1: Title Slide -->
<div class="slide">
  <div class="title-container">
    <div>
      <div class="title-eyebrow">Database Management Systems (DBMS) Course Project</div>
      <h1 class="main-title">IT Helpdesk &amp; Asset Support<br>Management System</h1>
      <p class="main-subtitle">Presentation-II: Relational Schema Design, 3NF Normalization, ER Diagram &amp; SQL Query Implementation</p>
    </div>

    <div class="meta-grid">
      <div class="meta-box highlight">
        <div class="meta-label">Presented By</div>
        <div class="meta-name">Md Aali Rahman</div>
        <div class="meta-sub">
          Roll Number: <strong>25WU0102156</strong><br>
          Section: AIML Panthers | Academic Year: 2026<br>
          Woxsen University, School of Technology
        </div>
      </div>

      <div class="meta-box">
        <div class="meta-label">Academic Guidance</div>
        <div class="meta-name">Dr. Kiranmayee Adavala</div>
        <div class="meta-sub">
          Faculty Guide | School of Technology<br>
          Course: Database Management Systems<br>
          Relational Engine: MySQL 8.0+ / 9.x (InnoDB)
        </div>
      </div>
    </div>
  </div>
  <div class="slide-footer">
    <span>Woxsen University • School of Technology</span>
    <span>Slide 1 of 14</span>
  </div>
</div>

<!-- SLIDE 2: Problem / System Overview -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">System Overview</div>
    <div class="slide-title">Problem Recap &amp; Relational Database Scope</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-blue">Operational Context</div>
      <div class="card-title">IT Service Coordination</div>
      <ul class="bullet-list">
        <li>Manual, email-driven support causes lost tickets, delayed resolutions, and missing asset records.</li>
        <li>Absence of relational linking between computing hardware, warranties, and cumulative repair expenditures.</li>
        <li>Need for a robust relational back-end to enforce data consistency and historical audit trails.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-emerald">Database Scope</div>
      <div class="card-title">Centralized it_helpdesk Schema</div>
      <ul class="bullet-list">
        <li>Centralized MySQL relational database managing 14 distinct tables in 3rd Normal Form (3NF).</li>
        <li>Dual-path ticket classification: Incidents (unplanned faults) and Service Requests (access &amp; allocations).</li>
        <li>Full lifecycle tracking with assignments, status histories, and resolution logging.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 2 of 14</span>
  </div>
</div>

<!-- SLIDE 3: Database Objectives -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Engineering Goals</div>
    <div class="slide-title">Relational Database Design Objectives</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-blue">Integrity &amp; Reliability</div>
      <div class="card-title">Data Governance Objectives</div>
      <ul class="bullet-list">
        <li><strong>Eliminate Data Redundancy:</strong> Apply 1NF, 2NF, and 3NF across all entities to achieve single-source data storage.</li>
        <li><strong>Enforce Referential Integrity:</strong> Implement foreign key actions (RESTRICT, CASCADE, SET NULL) matching real-world lifecycle semantics.</li>
        <li><strong>Domain Constraints:</strong> Enforce CHECK constraints on priority levels (1-5), status enums, and non-negative maintenance costs.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-emerald">Performance &amp; Auditing</div>
      <div class="card-title">Analytical &amp; Operational Goals</div>
      <ul class="bullet-list">
        <li><strong>Audit Trail Accountability:</strong> Automatically capture old vs new states with timestamps in status_histories.</li>
        <li><strong>High-Performance Queries:</strong> Support multi-table JOINs and GROUP BY aggregation for technician workloads and expenditure.</li>
        <li><strong>Production Readiness:</strong> Ensure InnoDB ACID compliance and crash resilience.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 3 of 14</span>
  </div>
</div>

<!-- SLIDE 4: ER Diagram -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Conceptual Model</div>
    <div class="slide-title">Entity-Relationship (ER) Diagram Architecture</div>
  </div>
  <div class="card" style="flex: 1; display: flex; flex-direction: row; gap: 0.3in; padding: 0.25in; align-items: center;">
    <div style="flex: 2.2; height: 100%; display: flex; align-items: center; justify-content: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.14in; overflow: hidden; padding: 0.1in;">
      <img src="file://{erd_path}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
      <div class="card-header badge-blue">Cardinality &amp; Mappings</div>
      <div class="card-title" style="font-size: 0.20in;">14 Entities &amp; Relations</div>
      <ul class="bullet-list" style="font-size: 0.145in;">
        <li><strong>1:N:</strong> departments &rarr; users</li>
        <li><strong>1:N:</strong> users &rarr; tickets</li>
        <li><strong>1:N:</strong> categories &rarr; tickets, assets</li>
        <li><strong>1:N:</strong> priorities &rarr; tickets</li>
        <li><strong>1:N:</strong> warranties &rarr; assets</li>
        <li><strong>1:N:</strong> assets &rarr; maintenance</li>
        <li><strong>1:1:</strong> tickets &rarr; incidents</li>
        <li><strong>1:1:</strong> tickets &rarr; service_requests</li>
        <li><strong>1:1:</strong> tickets &rarr; resolutions</li>
        <li><strong>1:N:</strong> tickets &rarr; assignments, status_histories</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 4 of 14</span>
  </div>
</div>

<!-- SLIDE 5: Relational Schema -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Physical Schema</div>
    <div class="slide-title">Relational Schema Architecture (14 Tables)</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-blue">Core Master Tables</div>
      <div class="card-title">Master &amp; Reference Entities</div>
      <ul class="bullet-list">
        <li><strong>departments:</strong> department_id (PK), name (UNIQUE), location</li>
        <li><strong>users:</strong> user_id (PK), name, email (UNIQUE), department_id (FK)</li>
        <li><strong>categories:</strong> category_id (PK), name (UNIQUE), description</li>
        <li><strong>priorities:</strong> priority_id (PK), name (UNIQUE), level (CHECK 1..5)</li>
        <li><strong>support_staff:</strong> staff_id (PK), name, email (UNIQUE), specialization</li>
        <li><strong>warranties:</strong> warranty_id (PK), start_date, end_date (CHECK), provider</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-emerald">Operational &amp; Transactional</div>
      <div class="card-title">Transactional &amp; Audit Entities</div>
      <ul class="bullet-list">
        <li><strong>assets:</strong> asset_id (PK), asset_tag, serial_no, user_id (FK), category_id (FK), warranty_id (FK)</li>
        <li><strong>tickets:</strong> ticket_id (PK), ticket_no (UNIQUE), user_id (FK), category_id (FK), priority_id (FK), status, created_at</li>
        <li><strong>incidents:</strong> ticket_id (PK/FK), incident_type</li>
        <li><strong>service_requests:</strong> ticket_id (PK/FK), request_type</li>
        <li><strong>assignments:</strong> assignment_id (PK), ticket_id (FK), staff_id (FK), assigned_at</li>
        <li><strong>status_histories:</strong> history_id (PK), ticket_id (FK), old_status, new_status, changed_at</li>
        <li><strong>resolutions:</strong> resolution_id (PK), ticket_id (FK UNIQUE), description, resolved_at</li>
        <li><strong>maintenance:</strong> maintenance_id (PK), asset_id (FK), maintenance_date, cost, description</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 5 of 14</span>
  </div>
</div>

<!-- SLIDE 6: Tables and Relationships -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Referential Integrity</div>
    <div class="slide-title">Foreign Key Semantics &amp; Cascading Rules</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-blue">RESTRICT Actions</div>
      <div class="card-title">Master Data Protection</div>
      <ul class="bullet-list">
        <li><strong>departments &rarr; users (ON DELETE RESTRICT):</strong> Prevents deleting a department while active employees exist.</li>
        <li><strong>categories &rarr; tickets / assets (ON DELETE RESTRICT):</strong> Protects operational categories from accidental deletion.</li>
        <li><strong>priorities &rarr; tickets (ON DELETE RESTRICT):</strong> Guarantees priority integrity for active queues.</li>
        <li><strong>support_staff &rarr; assignments (ON DELETE RESTRICT):</strong> Preserves technician service history.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-emerald">CASCADE &amp; SET NULL</div>
      <div class="card-title">Lifecycle Synchronized Rules</div>
      <ul class="bullet-list">
        <li><strong>tickets &rarr; incidents / service_requests / assignments / status_histories / resolutions (ON DELETE CASCADE):</strong> Deleting a ticket cleanly purges sub-entities without leaving orphan rows.</li>
        <li><strong>assets &rarr; maintenance (ON DELETE CASCADE):</strong> Removing an asset purges historical maintenance receipts.</li>
        <li><strong>users &rarr; assets (ON DELETE SET NULL):</strong> Removing an employee safely unassigns hardware back into general inventory.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 6 of 14</span>
  </div>
</div>

<!-- SLIDE 7: Normalization -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Database Theory</div>
    <div class="slide-title">Normalization Analysis (1NF to 3NF)</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-blue">1NF &amp; 2NF</div>
      <div class="card-title">First &amp; Second Normal Form</div>
      <ul class="bullet-list">
        <li><strong>1NF (First Normal Form):</strong> All table attributes are atomic. No multi-valued attributes, comma-separated lists, or repeating groups. Every column has defined scalar data types.</li>
        <li><strong>2NF (Second Normal Form):</strong> Satisfies 1NF, and all non-key attributes are fully functionally dependent on the entire primary key. Composite keys eliminated in favor of surrogate integer PKs, preventing partial functional dependencies.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-emerald">3NF</div>
      <div class="card-title">Third Normal Form Compliance</div>
      <ul class="bullet-list">
        <li><strong>3NF (Third Normal Form):</strong> Satisfies 2NF and eliminates all transitive functional dependencies (X &rarr; Y and Y &rarr; Z).</li>
        <li>Departments are decoupled from users (users store only department_id, not department location).</li>
        <li>Warranties are isolated into a separate entity (assets store warranty_id rather than repeating provider and dates).</li>
        <li>Categories and priorities are independent reference tables.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 7 of 14</span>
  </div>
</div>

<!-- SLIDE 8: DDL Commands -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Implementation</div>
    <div class="slide-title">Data Definition Language (DDL) Architecture</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-blue">Schema Construction</div>
      <div class="card-title">Table Creation &amp; Data Types</div>
      <ul class="bullet-list">
        <li>Engineered with MySQL InnoDB storage engine for transactional safety and row-level locking.</li>
        <li>Character set configured to utf8mb4 with utf8mb4_unicode_ci collation for universal Unicode text support.</li>
        <li>AUTO_INCREMENT surrogate primary keys for high-efficiency B-Tree indexing.</li>
        <li>Appropriate sizing: VARCHAR(100), VARCHAR(150), TEXT for narratives, TIMESTAMP for audit precision.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-amber">Constraints Enforcement</div>
      <div class="card-title">DDL Constraints Verification</div>
      <ul class="bullet-list">
        <li><code>CHECK (level BETWEEN 1 AND 5)</code> on table priorities.</li>
        <li><code>CHECK (status IN ('Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Cancelled'))</code> on table tickets.</li>
        <li><code>CHECK (end_date &gt;= start_date)</code> on table warranties.</li>
        <li><code>CHECK (cost &gt;= 0)</code> on table maintenance.</li>
        <li>UNIQUE constraints on emails, ticket numbers, asset tags, and serial numbers.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 8 of 14</span>
  </div>
</div>

<!-- SLIDE 9: DML Commands -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Data Manipulation</div>
    <div class="slide-title">DML Seed Dataset Implementation</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-blue">Seed Dataset</div>
      <div class="card-title">55 Relational Seed Records</div>
      <ul class="bullet-list">
        <li>Structured seed dataset in <code>seed.sql</code> establishing realistic operational baseline across 14 tables.</li>
        <li>4 Departments: Engineering, Human Resources, Finance, Marketing.</li>
        <li>5 Registered Corporate Users across all departments.</li>
        <li>5 Ticket Categories &amp; 4 Priority Levels (Low, Medium, High, Critical).</li>
        <li>4 Support Staff Technicians with distinct specializations (Network, Hardware, Software, IAM).</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-emerald">Referential Linking</div>
      <div class="card-title">Integrated Relational Records</div>
      <ul class="bullet-list">
        <li>4 Manufacturer Warranties (Dell ProSupport, AppleCare, Lenovo Premier, HP Care Pack).</li>
        <li>5 Computing Assets linked to user custodians and warranty providers.</li>
        <li>5 Base Tickets spanning Incidents and Service Requests with initial status histories.</li>
        <li>Active technician assignments and recorded maintenance repairs.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 9 of 14</span>
  </div>
</div>

<!-- SLIDE 10: SELECT Queries -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Query Optimization</div>
    <div class="slide-title">Representative SELECT &amp; Multi-Table JOIN Queries</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-blue">Relational JOINs</div>
      <div class="card-title">Multi-Table Ticket Queue Query</div>
      <ul class="bullet-list">
        <li>Joins tickets, users, departments, categories, priorities, incidents, and service_requests.</li>
        <li>Utilizes CASE expressions to determine ticket subtype dynamically (Incident vs Service Request).</li>
        <li>Extracts human-readable status queues ordered by priority level descending.</li>
        <li>Preserves NULL values using LEFT OUTER JOINs for unassigned subtypes.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-emerald">Aggregate Analytics</div>
      <div class="card-title">Workload &amp; Expenditure Aggregation</div>
      <ul class="bullet-list">
        <li><strong>Technician Workload Query:</strong> Uses GROUP BY with COUNT and conditional SUM(CASE...) to calculate active vs resolved tickets per engineer.</li>
        <li><strong>Department Maintenance Spend:</strong> Aggregates total equipment repair cost per department using SUM(m.cost) and FORMAT().</li>
        <li><strong>Status Distribution:</strong> Calculates real-time percentage distribution across ticket lifecycle states.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 10 of 14</span>
  </div>
</div>

<!-- SLIDE 11: Presentation-II Assigned Query -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Evaluation Review</div>
    <div class="slide-title">Presentation-II Assigned Viva Query</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-amber">Evaluation Status</div>
      <div class="card-title">Assigned Query Notice</div>
      <ul class="bullet-list">
        <li>During Presentation-II evaluation, each learner was assigned a specific SQL problem statement to solve live.</li>
        <li>The official template in <code>Presentation-II/Presentation-II-Query-Solution.sql</code> archives the query, explanation, and output.</li>
        <li>Repository status: Ready for student viva query parameters as reviewed by faculty.</li>
        <li>System provides the live SQL Execution Playground to test and demonstrate any complex query.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-blue">Core Problem Pattern</div>
      <div class="card-title">Analytical Helpdesk Requirements</div>
      <ul class="bullet-list">
        <li>Focuses on multi-table joins combining operational tickets with technician workloads.</li>
        <li>Filtering on date ranges, ticket statuses, or departmental asset allocations.</li>
        <li>Demonstrates aggregate grouping (GROUP BY) and conditional aggregation (HAVING).</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 11 of 14</span>
  </div>
</div>

<!-- SLIDE 12: Query Output & Verification -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Query Execution</div>
    <div class="slide-title">Query Output Verification &amp; Performance</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-emerald">Live Execution</div>
      <div class="card-title">Verified Database Output</div>
      <ul class="bullet-list">
        <li><strong>Technician Workload Summary Output:</strong></li>
        <li>• Sneha Rao (Network &amp; Security): 1 Total, 1 Active, 0 Completed</li>
        <li>• Karan Malhotra (Hardware &amp; Peripherals): 2 Total, 2 Active, 0 Completed</li>
        <li>• Amit Joshi (OS &amp; Software): 1 Total, 1 Active, 0 Completed</li>
        <li>• Divya Nair (IAM): 1 Total, 0 Active, 1 Completed</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-blue">Cost Output</div>
      <div class="card-title">Departmental Maintenance Spend</div>
      <ul class="bullet-list">
        <li>• <strong>Finance &amp; Accounts:</strong> 1 Asset | $1,200.00 Maintenance Spent</li>
        <li>• <strong>Engineering:</strong> 2 Assets | $750.00 Maintenance Spent</li>
        <li>• <strong>Marketing &amp; Sales:</strong> 1 Asset | $450.00 Maintenance Spent</li>
        <li>• <strong>Human Resources:</strong> 1 Asset | $0.00 Maintenance Spent</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 12 of 14</span>
  </div>
</div>

<!-- SLIDE 13: Database Summary -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">System Summary</div>
    <div class="slide-title">Database Architecture Metrics &amp; Implementation Summary</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-blue">Schema Metrics</div>
      <div class="card-title">14 Normalized Tables</div>
      <ul class="bullet-list">
        <li><strong>Tables:</strong> departments, users, categories, priorities, support_staff, warranties, assets, tickets, incidents, service_requests, assignments, status_histories, resolutions, maintenance.</li>
        <li><strong>Relationships:</strong> 14 Foreign Keys enforcing strict referential integrity.</li>
        <li><strong>Constraints:</strong> 4 Domain CHECK constraints, 8 UNIQUE constraints, 14 Primary Keys.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-emerald">Storage &amp; Engine</div>
      <div class="card-title">MySQL InnoDB Implementation</div>
      <ul class="bullet-list">
        <li>55 Relational seed records ensuring immediate operational verification.</li>
        <li>Terminal CLI interface implemented in main.py (--cli mode) with full tabular views.</li>
        <li>Live MySQL connectivity verified on port 3306.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 13 of 14</span>
  </div>
</div>

<!-- SLIDE 14: Conclusion -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Conclusion</div>
    <div class="slide-title">Presentation-II Conclusion &amp; Transition to UI Demo</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-emerald">Milestones Achieved</div>
      <div class="card-title">Presentation-II Deliverables Finalized</div>
      <ul class="bullet-list">
        <li>Robust, 3NF-compliant relational database fully implemented in MySQL.</li>
        <li>Complete DDL schema (schema.sql) and seed dataset (seed.sql) operational.</li>
        <li>Interactive ER diagram and high-resolution exports generated.</li>
        <li>Analytical SQL queries tested and documented.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-blue">Next Phase</div>
      <div class="card-title">Presentation-III (UI Demonstration)</div>
      <ul class="bullet-list">
        <li>Development of interactive Web User Interface connected to MySQL.</li>
        <li>Live demonstration of INSERT, DELETE, and VIEW operations with real-time database reflection.</li>
        <li>Preparation of complete 16-chapter Project Report PDF.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 14 of 14</span>
  </div>
</div>

</body>
</html>
"""

with open("Presentation-II/presentation_2.html", "w") as f:
    f.write(html_content)

chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
pdf_out = "Presentation-II/Presentation-II.pdf"
cmd = [
    chrome,
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_out}",
    "file://" + os.path.abspath("Presentation-II/presentation_2.html")
]
subprocess.run(cmd, check=True)
print(f"Successfully generated {pdf_out}")
