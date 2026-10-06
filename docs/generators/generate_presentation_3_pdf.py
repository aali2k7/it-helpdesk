import subprocess
import os

dash_img = os.path.abspath("Presentation-III/screenshots/dashboard.png")
tickets_img = os.path.abspath("Presentation-III/screenshots/tickets-view.png")
insert_img = os.path.abspath("Presentation-III/screenshots/ticket-insert-form.png")
delete_img = os.path.abspath("Presentation-III/screenshots/ticket-before-delete.png")
db_img = os.path.abspath("Presentation-III/screenshots/database-connected.png")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Presentation-III: UI Demo & CRUD - IT Helpdesk System</title>
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

  .slide-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #e2e8f0;
    padding-top: 0.12in;
    font-size: 0.13in;
    color: #64748b;
  }}

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

<!-- SLIDE 1 -->
<div class="slide">
  <div class="title-container">
    <div>
      <div class="title-eyebrow">Database Management Systems (DBMS) Course Project</div>
      <h1 class="main-title">IT Helpdesk &amp; Asset Support<br>Management System</h1>
      <p class="main-subtitle">Presentation-III: Live User Interface Demonstration &amp; MySQL Relational CRUD Operations</p>
    </div>

    <div class="meta-grid">
      <div class="meta-box highlight">
        <div class="meta-label">Presented By</div>
        <div class="meta-name">Md Aali Rahman</div>
        <div class="meta-sub">
          Roll Number: <strong>25WU0102156</strong><br>
          Section: AIML Panthers | Serial No: 39<br>
          Presentation Slot: Wednesday, 7 October 2026 | 9:30 AM – 9:40 AM
        </div>
      </div>

      <div class="meta-box">
        <div class="meta-label">Academic Guidance</div>
        <div class="meta-name">Dr. Kiranmayee Adavala</div>
        <div class="meta-sub">
          Faculty Guide | School of Technology<br>
          Woxsen University, Hyderabad<br>
          Live Architecture: MySQL Community 9.x + Flask + Vanilla SPA
        </div>
      </div>
    </div>
  </div>
  <div class="slide-footer">
    <span>Woxsen University • School of Technology</span>
    <span>Slide 1 of 12</span>
  </div>
</div>

<!-- SLIDE 2: Problem Statement -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Problem Context</div>
    <div class="slide-title">Enterprise IT Support &amp; Asset Tracking Dilemma</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-amber">Operational Bottlenecks</div>
      <div class="card-title">Fragmented Channels</div>
      <ul class="bullet-list">
        <li>Enterprises manage hundreds of devices and support requests via chaotic emails and spreadsheets.</li>
        <li>Untracked tickets lead to missed SLAs and zero technician accountability.</li>
        <li>Hardware relocations occur without updating ownership or tracking warranty expiries.</li>
        <li>Lack of immutable audit logging leads to untracked status modifications.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-emerald">Relational Solution</div>
      <div class="card-title">Normalized Database</div>
      <ul class="bullet-list">
        <li>A centralized MySQL 8.0+ relational back-end (it_helpdesk) enforcing 3NF normalization.</li>
        <li>Clear subtype separation into Incidents vs Service Requests.</li>
        <li>Complete audit trail of status progressions and technician assignments.</li>
        <li>Real-time responsive web UI connected to MySQL demonstrating live CRUD.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 2 of 12</span>
  </div>
</div>

<!-- SLIDE 3: Objectives & Scope -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Project Goals</div>
    <div class="slide-title">Objectives &amp; Scope of Presentation-III</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-blue">Core Objectives</div>
      <div class="card-title">Core System Objectives</div>
      <ul class="bullet-list">
        <li>Deliver a fully working User Interface connected directly to MySQL (no mock data).</li>
        <li>Demonstrate real-time INSERT of ticket records reflected in database tables.</li>
        <li>Demonstrate permanent DELETION of records with referential cascade.</li>
        <li>Demonstrate multi-table VIEW of records with dynamic filtering and audit timelines.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-emerald">Technical Scope</div>
      <div class="card-title">Scope &amp; Verified Deliverables</div>
      <ul class="bullet-list">
        <li>14 Relational tables managed with foreign key cascades and restrict constraints.</li>
        <li>Live system health monitoring with active connection verification.</li>
        <li>Interactive 3D database visualizer inspecting schema nodes and relationships.</li>
        <li>SQL verification playground executing live analytical queries for faculty.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 3 of 12</span>
  </div>
</div>

<!-- SLIDE 4: Database Architecture -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Schema Architecture</div>
    <div class="slide-title">Database Architecture &amp; 3NF Relational Model</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-blue">Schema Structure</div>
      <div class="card-title">14 Normalized Tables</div>
      <ul class="bullet-list">
        <li>Master Entities: departments, users, categories, priorities, support_staff, warranties.</li>
        <li>Operational Entities: assets, tickets, incidents, service_requests, assignments.</li>
        <li>Audit &amp; Service Entities: status_histories, resolutions, maintenance.</li>
        <li>Storage Engine: MySQL InnoDB with ACID transaction support and foreign keys.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-emerald">Integrity Constraints</div>
      <div class="card-title">Enforced Relational Rules</div>
      <ul class="bullet-list">
        <li>ON DELETE RESTRICT: departments &rarr; users, categories &rarr; tickets, priorities &rarr; tickets.</li>
        <li>ON DELETE CASCADE: tickets &rarr; incidents, service_requests, assignments, status_histories, resolutions.</li>
        <li>ON DELETE SET NULL: users &rarr; assets, warranties &rarr; assets.</li>
        <li>CHECK constraints on priority levels (1-5), status enums, and positive maintenance costs.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 4 of 12</span>
  </div>
</div>

<!-- SLIDE 5: Technology Stack -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Technology Architecture</div>
    <div class="slide-title">Full-Stack System Architecture &amp; Decoupled Design</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-blue">Back-End &amp; Database</div>
      <div class="card-title">MySQL &amp; Python REST API</div>
      <ul class="bullet-list">
        <li>Database Server: MySQL 8.0+ / 9.x running locally on port 3306.</li>
        <li>Driver: mysql-connector-python with parameterized queries (zero SQL injection).</li>
        <li>Backend: Python Flask REST API server exposing CRUD endpoints.</li>
        <li>Transaction Management: Explicit autocommit=False with atomic commits and rollbacks.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-emerald">Front-End Presentation</div>
      <div class="card-title">Modern Single-Page Application</div>
      <ul class="bullet-list">
        <li>Vanilla HTML5 / CSS3 / ES6+ JavaScript client using the native Fetch API.</li>
        <li>Zero heavy frontend framework dependencies for high performance.</li>
        <li>Three.js 3D WebGL database relationship visualizer.</li>
        <li>Live SQL verification playground for faculty evaluation.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 5 of 12</span>
  </div>
</div>

<!-- SLIDE 6: Dashboard Overview -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">UI Architecture</div>
    <div class="slide-title">Operational Command Dashboard</div>
  </div>
  <div class="card" style="flex: 1; display: flex; flex-direction: row; gap: 0.3in; padding: 0.25in; align-items: center;">
    <div style="flex: 2; height: 100%; display: flex; align-items: center; justify-content: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.14in; overflow: hidden; padding: 0.1in;">
      <img src="file://{dash_img}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
      <div class="card-header badge-blue">Operational Highlights</div>
      <div class="card-title" style="font-size: 0.20in;">Live Metrics &amp; 3D Engine</div>
      <ul class="bullet-list" style="font-size: 0.145in;">
        <li>Real-time MySQL connectivity pill: ● MySQL Connected (it_helpdesk).</li>
        <li>Dynamic aggregate counters: Total Tickets, Open vs Resolved, Hardware Assets, Users, Maintenance Spend.</li>
        <li>Interactive 3D database visualizer mapping tables and relationships.</li>
        <li>Live quick-action shortcuts to create tickets, view queues, and run SQL queries.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 6 of 12</span>
  </div>
</div>

<!-- SLIDE 7: VIEW Operation -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">CRUD Operation 1</div>
    <div class="slide-title">VIEW: Multi-Table Relational Ticket Queue</div>
  </div>
  <div class="card" style="flex: 1; display: flex; flex-direction: row; gap: 0.3in; padding: 0.25in; align-items: center;">
    <div style="flex: 2; height: 100%; display: flex; align-items: center; justify-content: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.14in; overflow: hidden; padding: 0.1in;">
      <img src="file://{tickets_img}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
      <div class="card-header badge-blue">Relational Joins</div>
      <div class="card-title" style="font-size: 0.20in;">Queues &amp; Details</div>
      <ul class="bullet-list" style="font-size: 0.145in;">
        <li>Executes multi-table SQL JOIN across tickets, users, departments, categories, and priorities.</li>
        <li>Dynamic filtering by Status, Category, and Subtype (Incident vs Service Request).</li>
        <li>Real-time search across ticket number, title, requester name, and category.</li>
        <li>Detail modal displays full relational graph: requester details, assigned technicians, and status history.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 7 of 12</span>
  </div>
</div>

<!-- SLIDE 8: INSERT Operation -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">CRUD Operation 2</div>
    <div class="slide-title">INSERT: Form-Driven Record Creation &amp; Subtyping</div>
  </div>
  <div class="card" style="flex: 1; display: flex; flex-direction: row; gap: 0.3in; padding: 0.25in; align-items: center;">
    <div style="flex: 2; height: 100%; display: flex; align-items: center; justify-content: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.14in; overflow: hidden; padding: 0.1in;">
      <img src="file://{insert_img}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
      <div class="card-header badge-emerald">Atomic Creation</div>
      <div class="card-title" style="font-size: 0.20in;">Multi-Table Atomic Flow</div>
      <ul class="bullet-list" style="font-size: 0.145in;">
        <li>Dynamic foreign key dropdowns populated from live database tables.</li>
        <li>Automated sequential ticket tracking number generation (TKT-006).</li>
        <li>Atomic multi-table transaction inserting into tickets, subtypes, and status_histories.</li>
        <li>Immediate UI reflection: new row appears instantly in the table without page reload.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 8 of 12</span>
  </div>
</div>

<!-- SLIDE 9: DELETE Operation -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">CRUD Operation 3</div>
    <div class="slide-title">DELETE: Permanent Removal with Foreign Key Cascades</div>
  </div>
  <div class="card" style="flex: 1; display: flex; flex-direction: row; gap: 0.3in; padding: 0.25in; align-items: center;">
    <div style="flex: 2; height: 100%; display: flex; align-items: center; justify-content: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.14in; overflow: hidden; padding: 0.1in;">
      <img src="file://{delete_img}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
      <div class="card-header badge-amber">Referential Cascade</div>
      <div class="card-title" style="font-size: 0.20in;">Permanent Record Purge</div>
      <ul class="bullet-list" style="font-size: 0.145in;">
        <li>Confirmation dialog displaying exact record ID prevents accidental deletions.</li>
        <li>Executes DELETE FROM tickets WHERE ticket_id = %s directly in MySQL.</li>
        <li>ON DELETE CASCADE automatically purges sub-entities without leaving orphan rows.</li>
        <li>ON DELETE RESTRICT safely protects users and categories with active dependencies.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 9 of 12</span>
  </div>
</div>

<!-- SLIDE 10: Persistence Verification -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Integrity Verification</div>
    <div class="slide-title">Live Database Persistence &amp; Refresh Verification</div>
  </div>
  <div class="card" style="flex: 1; display: flex; flex-direction: row; gap: 0.3in; padding: 0.25in; align-items: center;">
    <div style="flex: 2; height: 100%; display: flex; align-items: center; justify-content: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.14in; overflow: hidden; padding: 0.1in;">
      <img src="file://{db_img}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
      <div class="card-header badge-blue">Zero Mock Data</div>
      <div class="card-title" style="font-size: 0.20in;">ACID Storage Guarantee</div>
      <ul class="bullet-list" style="font-size: 0.145in;">
        <li>State persistence verified across browser refreshes (Cmd+R / F5).</li>
        <li>Direct terminal verification via MySQL client confirms record existence in InnoDB storage.</li>
        <li>Zero mock data, fake arrays, or localStorage used — 100% real database transactions.</li>
        <li>Demonstrates end-to-end ACID consistency.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 10 of 12</span>
  </div>
</div>

<!-- SLIDE 11: Testing & QA -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Quality Assurance</div>
    <div class="slide-title">Automated DBMS Test Suite Execution (TC01 &ndash; TC10)</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-blue">Core CRUD Test Cases</div>
      <div class="card-title">CRUD &amp; Persistence Tests</div>
      <ul class="bullet-list">
        <li>TC01: Database Connection to MySQL &mdash; <strong>PASS</strong></li>
        <li>TC02: View Tickets Relational Query &mdash; <strong>PASS</strong></li>
        <li>TC03: Insert New Ticket Record &mdash; <strong>PASS</strong></li>
        <li>TC04: Refresh &amp; Persistence Verification &mdash; <strong>PASS</strong></li>
        <li>TC05: Delete Ticket from MySQL &mdash; <strong>PASS</strong></li>
        <li>TC06: Refresh After Delete (Remains Absent) &mdash; <strong>PASS</strong></li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-emerald">Constraint Tests</div>
      <div class="card-title">Relational Constraints &amp; Errors</div>
      <ul class="bullet-list">
        <li>TC07: Form Input Validation (Missing Required Fields) &mdash; <strong>PASS</strong></li>
        <li>TC08: Unique Constraint Enforcement (Duplicate Email) &mdash; <strong>PASS</strong></li>
        <li>TC09: Foreign Key Deletion Violation (RESTRICT) &mdash; <strong>PASS</strong></li>
        <li>TC10: MySQL Offline Error Handling (Safe User Message) &mdash; <strong>PASS</strong></li>
        <li><strong>Overall Result: 10/10 Test Scenarios Passed (100% Success Rate)</strong></li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 11 of 12</span>
  </div>
</div>

<!-- SLIDE 12: Conclusion & Future Scope -->
<div class="slide">
  <div class="slide-header">
    <div class="eyebrow">Summary &amp; Future Scope</div>
    <div class="slide-title">Conclusion &amp; Future System Enhancements</div>
  </div>
  <div class="cards-grid grid-2">
    <div class="card">
      <div class="card-header badge-emerald">Summary of Outcomes</div>
      <div class="card-title">Presentation-III Accomplishments</div>
      <ul class="bullet-list">
        <li>Successfully delivered an enterprise-grade IT Helpdesk and Asset Support Management System.</li>
        <li>Live MySQL database connectivity verified with real-time INSERT, DELETE, and VIEW operations.</li>
        <li>Strict 3NF normalization and foreign key integrity constraints maintained throughout.</li>
        <li>All official presentation requirements fulfilled.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header badge-blue">Future Roadmap</div>
      <div class="card-title">Future Enhancements</div>
      <ul class="bullet-list">
        <li>Automated SLA escalation triggers and email notification webhooks.</li>
        <li>Multi-factor authentication (MFA) and Role-Based Access Control (RBAC).</li>
        <li>Predictive hardware maintenance forecasting using machine learning models on servicing history.</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer">
    <span>IT Helpdesk &amp; Asset Support Management System</span>
    <span>Slide 12 of 12</span>
  </div>
</div>

</body>
</html>
"""

with open("Presentation-III/presentation_3.html", "w") as f:
    f.write(html_content)

chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
pdf_out = "Presentation-III/Presentation-III.pdf"
cmd = [
    chrome,
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_out}",
    "file://" + os.path.abspath("Presentation-III/presentation_3.html")
]
subprocess.run(cmd, check=True)
print(f"Successfully generated {pdf_out}")
