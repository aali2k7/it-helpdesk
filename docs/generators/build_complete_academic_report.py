import os
import subprocess
import pypdf

base_dir = os.path.abspath(".")
logo_img = "file://" + os.path.join(base_dir, "docs/woxsen_logo.png")
erd_img = "file://" + os.path.join(base_dir, "Presentation-II/ER-Diagram.png")
dash_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/dashboard.png")
db_conn_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/database-connected.png")
tickets_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/tickets-view.png")
insert_form_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/ticket-insert-form.png")
before_insert_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/ticket-before-insert.png")
after_insert_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/ticket-after-insert.png")
before_delete_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/ticket-before-delete.png")
after_delete_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/ticket-after-delete.png")
users_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/users-view.png")
assets_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/assets-view.png")
inspector_img = "file://" + os.path.join(base_dir, "Presentation-III/screenshots/dashboard-inspector.png")

pages = []

def make_page(content, page_num_str=None):
    num_div = f"<div class='page-number'>{page_num_str}</div>" if page_num_str else ""
    return f"""<div class="page">
  <div class="page-border"></div>
  {content}
  {num_div}
</div>"""

# =============================================================
# PRELIMINARY PAGES (1 to 8)
# =============================================================

# PAGE 1: COVER
p1 = f"""
<div style="text-align: center; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
  <div>
    <h1 style="font-size: 20pt; margin-bottom: 4pt; letter-spacing: 0.5px;">Woxsen University</h1>
    <h2 style="font-size: 14pt; font-weight: normal; margin-top: 0; margin-bottom: 25pt;">School of Technology</h2>
    
    <div style="margin: 20pt 0;">
      <img src="{logo_img}" style="max-height: 80pt; object-fit: contain;">
    </div>
    
    <p style="font-size: 13pt; margin-top: 25pt; margin-bottom: 4pt;">A</p>
    <p style="font-size: 14pt; font-weight: bold; letter-spacing: 1px; margin-bottom: 4pt;">PROJECT REPORT</p>
    <p style="font-size: 12pt; margin-bottom: 18pt;">on</p>
    
    <h2 style="font-size: 17pt; font-weight: bold; line-height: 1.35; margin-bottom: 25pt;">
      IT HELPDESK AND ASSET SUPPORT<br>MANAGEMENT SYSTEM
    </h2>
    
    <p style="font-size: 11.5pt; font-style: italic; margin-bottom: 6pt;">
      Submitted in partial fulfillment of the requirements for the degree of
    </p>
    <p style="font-size: 13pt; font-weight: bold; margin-bottom: 35pt;">
      B. Tech. in Artificial Intelligence and Machine Learning
    </p>
  </div>
  
  <div style="display: flex; justify-content: space-between; text-align: left; padding: 0 10pt; font-size: 11.5pt;">
    <div>
      <p style="font-weight: bold; margin-bottom: 3pt;">Submitted by:</p>
      <p style="margin-bottom: 2pt;">Md Aali Rahman</p>
      <p style="margin-bottom: 2pt;">Roll No: 25WU0102156</p>
      <p>AIML Panthers</p>
    </div>
    
    <div style="text-align: right;">
      <p style="font-weight: bold; margin-bottom: 3pt;">Under the guidance of:</p>
      <p style="margin-bottom: 2pt;">Dr. Kiranmayee Adavala</p>
      <p style="margin-bottom: 2pt;">Assistant Professor</p>
      <p>School of Technology</p>
    </div>
  </div>
</div>
"""
pages.append(make_page(p1, None))

# PAGE 2: CERTIFICATE (Page i)
p2 = """
<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
  <div>
    <h1 style="text-align: center; margin-top: 15pt; margin-bottom: 25pt;">CERTIFICATE</h1>
    
    <p style="line-height: 1.8; margin-bottom: 18pt;">
      This is to certify that the project report entitled <strong>"IT Helpdesk and Asset Support Management System"</strong> submitted by <strong>Md Aali Rahman</strong> (Roll Number: <strong>25WU0102156</strong>), student of <strong>AIML Panthers</strong>, in partial fulfillment of the requirements for the award of the degree of <strong>B. Tech. in Artificial Intelligence and Machine Learning</strong> from <strong>Woxsen University</strong> is a bonafide record of work carried out by the student under my supervision and guidance.
    </p>
    
    <p style="line-height: 1.8; margin-bottom: 18pt;">
      The work embodied in this project report has been carried out by the candidate and has not been submitted elsewhere for the award of any other degree or diploma.
    </p>
  </div>
  
  <div style="margin-bottom: 40pt; font-size: 11.5pt; line-height: 1.6;">
    <p style="margin-bottom: 35pt;">Signature of Mentor</p>
    <p><strong>Name:</strong> Dr. Kiranmayee Adavala</p>
    <p><strong>Designation:</strong> Assistant Professor</p>
    <p><strong>Department:</strong> Computer Science and Engineering, School of Technology</p>
    <p><strong>Institution:</strong> Woxsen University, Hyderabad</p>
    <p><strong>Date:</strong> 10 October 2026</p>
  </div>
</div>
"""
pages.append(make_page(p2, "i"))

# PAGE 3: DECLARATION (Page ii)
p3 = """
<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
  <div>
    <h1 style="text-align: center; margin-top: 15pt; margin-bottom: 25pt;">DECLARATION of the candidate</h1>
    
    <p style="line-height: 1.8; margin-bottom: 18pt;">
      I hereby declare that the project work entitled <strong>"IT Helpdesk and Asset Support Management System"</strong> submitted to the <strong>Department of Computer Science and Engineering, School of Technology, Woxsen University</strong>, in partial fulfillment of the requirements for the award of the degree of <strong>B. Tech. in Artificial Intelligence and Machine Learning</strong> is my original work and has been carried out under the guidance of <strong>Dr. Kiranmayee Adavala</strong>.
    </p>
    
    <p style="line-height: 1.8; margin-bottom: 18pt;">
      I further declare that the work reported in this project has not been submitted and will not be submitted, either in part or in full, for the award of any other degree or diploma in this institute or any other institute or university.
    </p>
  </div>
  
  <div style="margin-bottom: 50pt; font-size: 11.5pt; line-height: 1.6;">
    <p style="margin-bottom: 40pt;">Signature of Student</p>
    <p><strong>Name:</strong> Md Aali Rahman</p>
    <p><strong>Roll Number:</strong> 25WU0102156</p>
    <p><strong>Section:</strong> AIML Panthers</p>
    <p><strong>Date:</strong> 10 October 2026</p>
  </div>
</div>
"""
pages.append(make_page(p3, "ii"))

# PAGE 4: ACKNOWLEDGMENT (Page iii)
p4 = """
<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
  <div>
    <h1 style="text-align: center; margin-top: 15pt; margin-bottom: 22pt;">ACKNOWLEDGMENT</h1>
    
    <p style="line-height: 1.7; margin-bottom: 12pt;">
      I would like to express my sincere gratitude to all those who have contributed to the successful completion of this project on <strong>IT Helpdesk and Asset Support Management System</strong>.
    </p>
    
    <p style="line-height: 1.7; margin-bottom: 12pt;">
      First and foremost, I extend my heartfelt thanks to my project guide, <strong>Dr. Kiranmayee Adavala</strong>, Assistant Professor, School of Technology, for her invaluable guidance, continuous support, and constructive feedback throughout the duration of this project. Her expertise in Database Management Systems, relational design, and software architecture has been instrumental in shaping this work.
    </p>
    
    <p style="line-height: 1.7; margin-bottom: 12pt;">
      I am grateful to <strong>Dr. P. Swapna</strong>, Head of the Department of Computer Science and Engineering, and the academic leadership of the School of Technology, Woxsen University, for providing the necessary computational infrastructure, laboratory facilities, and resources required for developing and testing this project.
    </p>
    
    <p style="line-height: 1.7; margin-bottom: 12pt;">
      My sincere thanks to my peers and colleagues of <strong>AIML Panthers</strong> who provided valuable insights, critical suggestions, and collaborative discussions during various phases of schema design and live verification.
    </p>
    
    <p style="line-height: 1.7; margin-bottom: 12pt;">
      Finally, I am deeply grateful to my family for their unwavering encouragement, understanding, and support throughout my academic journey.
    </p>
  </div>
  
  <div style="text-align: right; margin-bottom: 40pt; font-size: 11.5pt;">
    <p style="font-weight: bold;">Md Aali Rahman</p>
    <p>Roll No: 25WU0102156</p>
    <p>AIML Panthers</p>
  </div>
</div>
"""
pages.append(make_page(p4, "iii"))

# PAGE 5: ABSTRACT (Page iv)
p5 = """
<h1 style="text-align: center; margin-top: 15pt; margin-bottom: 18pt;">ABSTRACT</h1>

<p>
This project presents the design, mathematical normalization, physical implementation, and interactive verification of the <strong>IT Helpdesk and Asset Support Management System</strong>. In modern enterprise and university environments, managing technical service requests and computing hardware through informal channels such as spreadsheets and email threads leads to lost tickets, unmonitored technician workloads, untracked warranty expirations, and missing historical audit trails.
</p>

<p>
The primary objective of this project is to develop and evaluate a centralized, normalized relational database system using <strong>MySQL 8.0+ / 9.x</strong> and the ACID-compliant <strong>InnoDB</strong> storage engine. The database architecture comprises 14 normalized tables in <strong>Third Normal Form (3NF)</strong>, cleanly partitioning organizational entities (departments, users), technical operational entities (tickets, incidents, service requests, categories, priorities), personnel entities (support staff, assignments), and equipment inventory entities (assets, manufacturer warranties, maintenance expenditures).
</p>

<p>
Key architectural innovations include relational subtyping through 1:1 foreign key inheritance to distinguish unplanned outages (<em>Incidents</em>) from routine provisioning (<em>Service Requests</em>), an append-only chronological state transition log (<code>status_histories</code>) capturing every status update with timestamps, and full hardware asset tracking linking computing equipment to employee custodians, vendor warranty validity, and repair invoices.
</p>

<p>
A full-stack Single-Page Application (SPA) web interface was constructed using semantic HTML5, Vanilla CSS, and JavaScript with the native Fetch API, connected to a Python Flask REST API server utilizing parameterized SQL queries without Object-Relational Mapping (ORM) overhead. The user interface demonstrates live, real-time <code>INSERT</code>, <code>DELETE</code>, and <code>VIEW</code> operations directly reflected in MySQL, supplemented by an interactive Three.js 3D WebGL database relationship visualizer and live SQL verification playground. Automated test suites verify 100% pass rates across connection health, transactional persistence, cascading purges, and foreign key constraint protections.
</p>

<p style="margin-top: 15pt;">
<strong>Keywords:</strong> Database Management Systems, MySQL, IT Helpdesk, Asset Management, Relational Database, CRUD, SQL, Database Normalization, Entity-Relationship Modeling.
</p>
"""
pages.append(make_page(p5, "iv"))

# PAGE 6: TABLE OF CONTENTS (Page v)
p6 = """
<h1 style="text-align: center; margin-top: 15pt; margin-bottom: 16pt;">TABLE OF CONTENTS</h1>

<div style="font-size: 10.5pt; line-height: 1.55;">
  <div style="display:flex; justify-content:space-between; font-weight:bold; margin-bottom:4pt;">
    <span>Title</span><span>Page No.</span>
  </div>
  <div style="display:flex; justify-content:space-between; margin-bottom:2pt;"><span>Certificate</span><span>i</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:2pt;"><span>Declaration of the Candidate</span><span>ii</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:2pt;"><span>Acknowledgment</span><span>iii</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:2pt;"><span>Abstract</span><span>iv</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:2pt;"><span>List of Tables</span><span>vi</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:6pt;"><span>List of Figures</span><span>vii</span></div>
  
  <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top:4pt;"><span>1. INTRODUCTION</span><span>1</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>1.1 Background</span><span>1</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>1.2 Motivation</span><span>1</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>1.3 Problem Statement</span><span>1</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>1.4 Objectives</span><span>2</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>1.5 Scope and Limitations</span><span>2</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>1.6 System Environment Overview</span><span>2</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>1.7 Organization of the Report</span><span>2</span></div>

  <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top:4pt;"><span>2. TECHNOLOGY / DATABASE REVIEW</span><span>3</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>2.1 Database Management Systems</span><span>3</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>2.2 Relational Database Model</span><span>3</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>2.3 MySQL Architecture & InnoDB Engine</span><span>3</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>2.4 Structured Query Language (SQL)</span><span>4</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>2.5 Database Normalization Theory</span><span>4</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>2.6 Database Transactions & ACID Properties</span><span>4</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>2.7 IT Helpdesk Systems</span><span>4</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>2.8 Full-Stack Technology Review</span><span>4</span></div>

  <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top:4pt;"><span>3. SYSTEM ANALYSIS AND DESIGN</span><span>5</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>3.1 System Overview</span><span>5</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>3.2 Functional Requirements</span><span>5</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>3.3 Non-Functional Requirements</span><span>5</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>3.4 System Architecture</span><span>6</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>3.5 Entity-Relationship (ER) Diagram</span><span>7</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>3.6 Relational Schema</span><span>8</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>3.7 Database Design & Integrity Constraints</span><span>8</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>3.8 Normalization Analysis (1NF, 2NF, 3NF Proofs)</span><span>9</span></div>

  <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top:4pt;"><span>4. DATABASE IMPLEMENTATION</span><span>10</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>4.1 Database Creation</span><span>10</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>4.2 Table Creation & DDL Specifications</span><span>10</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>4.3 Integrity Constraints</span><span>10</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>4.4 Data Insertion & Seed Dataset</span><span>11</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>4.5 SQL Queries</span><span>12</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>4.6 Query Outputs & Presentation-II Solution</span><span>13</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>4.7 Complete Data Dictionary</span><span>14</span></div>

  <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top:4pt;"><span>5. USER INTERFACE AND IMPLEMENTATION</span><span>16</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>5.1 UI Overview & Architecture</span><span>16</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>5.2 Command Dashboard & 3D Visualizer</span><span>16</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>5.3 Ticket Management & Queues (VIEW)</span><span>17</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>5.4 Ticket Subtyping & Incident Management</span><span>17</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>5.5 Service Requests</span><span>17</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>5.6 Hardware Asset Management</span><span>18</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>5.7 User & Department Management</span><span>18</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>5.8 Support Staff & Technician Workloads</span><span>18</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>5.9 Record Insertion & Cascaded Deletion (INSERT & DELETE)</span><span>19</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>5.10 SQL Verification & Database Connectivity</span><span>20</span></div>

  <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top:4pt;"><span>6. TESTING AND RESULTS</span><span>21</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>6.1 Testing Methodology</span><span>21</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>6.2 Test Cases (TC01 - TC10)</span><span>21</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>6.3 CRUD Operations Testing</span><span>21</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>6.4 Database Persistence Testing</span><span>22</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>6.5 SQL Query Testing</span><span>22</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>6.6 Results and Discussion</span><span>22</span></div>

  <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top:4pt;"><span>7. CONCLUSION AND FUTURE ENHANCEMENTS</span><span>23</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>7.1 Conclusion</span><span>23</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>7.2 Limitations</span><span>23</span></div>
  <div style="padding-left:15pt; display:flex; justify-content:space-between;"><span>7.3 Future Enhancements</span><span>23</span></div>

  <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top:4pt;"><span>REFERENCES</span><span>24</span></div>
  <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top:4pt;"><span>APPENDIX – I: PROJECT SCREENSHOTS & VIVA MATERIAL</span><span>25</span></div>
  <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top:4pt;"><span>APPENDIX – II: REPOSITORY DIRECTORY & SETUP GUIDE</span><span>26</span></div>
</div>
"""
pages.append(make_page(p6, "v"))

# PAGE 7: LIST OF TABLES (Page vi)
p7 = """
<h1 style="text-align: center; margin-top: 15pt; margin-bottom: 20pt;">LIST OF TABLES</h1>

<div style="font-size: 11pt; line-height: 1.8;">
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 1.1: System Environment & Initial Dataset Statistics</span><span>2</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 3.1: Functional Requirements Specification</span><span>5</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 3.2: Database Tables Overview</span><span>6</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 3.3: Relationship Cardinalities & Participation Constraints</span><span>7</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.1: Data Dictionary — departments</span><span>14</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.2: Data Dictionary — users</span><span>14</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.3: Data Dictionary — categories</span><span>14</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.4: Data Dictionary — priorities</span><span>14</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.5: Data Dictionary — support_staff</span><span>14</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.6: Data Dictionary — warranties</span><span>14</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.7: Data Dictionary — assets</span><span>15</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.8: Data Dictionary — tickets</span><span>15</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.9: Data Dictionary — incidents</span><span>15</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.10: Data Dictionary — service_requests</span><span>15</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.11: Data Dictionary — assignments</span><span>15</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.12: Data Dictionary — status_histories</span><span>15</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.13: Data Dictionary — resolutions</span><span>15</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.14: Data Dictionary — maintenance</span><span>15</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.15: Multi-Table Ticket Queue Query Output</span><span>13</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.16: Technician Workload Aggregation Output</span><span>13</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.17: Departmental Maintenance Expenditure Output</span><span>13</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 4.18: Presentation-II Assigned Query Output</span><span>13</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table 6.1: Automated DBMS Test Suite Execution Matrix (TC01 - TC10)</span><span>21</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Table A.1: Repository Structure & File Organization</span><span>26</span></div>
</div>
"""
pages.append(make_page(p7, "vi"))

# PAGE 8: LIST OF FIGURES (Page vii)
p8 = """
<h1 style="text-align: center; margin-top: 15pt; margin-bottom: 20pt;">LIST OF FIGURES</h1>

<div style="font-size: 11pt; line-height: 1.8;">
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure 3.1: Three-Tier System Architecture Diagram</span><span>6</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure 3.2: High-Resolution Entity-Relationship (ER) Diagram</span><span>7</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure 5.1: IT Helpdesk System Operations Dashboard</span><span>16</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure 5.2: Live MySQL Database Connectivity Status Pill</span><span>16</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure 5.3: Three.js Interactive 3D Relational Database Visualizer</span><span>16</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure 5.4: Ticket Management Relational Queue View (VIEW Operation)</span><span>17</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure 5.5: Add Ticket Form Modal (INSERT Operation)</span><span>19</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure 5.6: Ticket Queue Before Record Insertion (5 Records)</span><span>19</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure 5.7: Ticket Queue After Record Insertion (6 Records, TKT-006)</span><span>19</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure 5.8: Delete Confirmation Modal (DELETE Operation)</span><span>20</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure 5.9: Ticket Queue After Record Deletion (Permanently Purged)</span><span>20</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure 5.10: Users Directory & Department Mapping View</span><span>18</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure 5.11: Hardware Assets Inventory & Warranty View</span><span>18</span></div>
  <div style="display:flex; justify-content:space-between; margin-bottom:4pt;"><span>Figure A.1: 3D Schema Inspector Drawer</span><span>25</span></div>
</div>
"""
pages.append(make_page(p8, "vii"))

# =============================================================
# MAIN REPORT PAGES (9 to 34 -> Printed Page Numbers 1 to 26)
# =============================================================

# PAGE 9 (Report Page 1): Chapter 1 - Introduction (Part 1)
p9 = """
<h1>1. INTRODUCTION</h1>
<p>
The management of enterprise computing hardware and technical support operations represents a vital foundation for modern organizational productivity. With academic institutions, research facilities, and commercial enterprises deploying hundreds of heterogeneous computing assets—including developer workstations, faculty laptops, networking hardware, and specialized laboratory peripherals—systematic management of user inquiries and physical equipment becomes critical. This project focuses on designing, mathematically normalizing, physically implementing, and interactively verifying a comprehensive relational database system: the <strong>IT Helpdesk and Asset Support Management System</strong> using MySQL 8.0+ / 9.x.
</p>

<h2>1.1 Background</h2>
<p>
IT service desk operations govern the lifecycle of all incoming technical issues and service requests. In conventional settings, organizations frequently attempt to handle support requests using unstructured email chains, shared spreadsheets, and informal verbal communications. While such informal mechanisms may suffice for small groups, they scale poorly and introduce acute operational risks, including lost tickets, unassigned responsibilities, unmonitored hardware reassignments, and complete absence of historical audit trails.
</p>
<p>
Relational Database Management Systems (RDBMS) provide the mathematical and transactional framework necessary to centralize support operations. By applying relational algebra, rigorous schema normalization, domain integrity constraints, and ACID transactions, an RDBMS guarantees data consistency, prevents redundant record storage, and enables multi-dimensional reporting across users, technicians, and hardware inventory.
</p>

<h2>1.2 Motivation</h2>
<p>
The motivation for this project stems from acute operational vulnerabilities observed in spreadsheet-dependent IT workflows:
</p>
<ul>
  <li><strong>Operational Accountability:</strong> Without automated assignment logging and chronological status tracking, technicians cannot be held accountable for unresolved tickets or SLA breaches.</li>
  <li><strong>Hardware Asset Preservation:</strong> Computing equipment is frequently relocated between faculty, employees, and departments without updating central records, leading to misplaced assets and untracked depreciation.</li>
  <li><strong>Financial Optimization:</strong> Enterprises lose substantial financial resources paying out-of-pocket for equipment servicing because maintenance personnel lack immediate relational access to manufacturer warranty validity dates.</li>
  <li><strong>Relational Integrity:</strong> Flat file spreadsheets fail to enforce referential integrity; deleting a department or employee row can inadvertently orphan active support tickets and warranty records.</li>
</ul>

<h2>1.3 Problem Statement</h2>
<p>
The primary problem addressed in this project is the construction of a robust, Third Normal Form (3NF) relational database management system capable of unifying helpdesk operations, incident tracking, service provisioning, and hardware lifecycle accounting into a secure, transactional back-end. Specifically, the system must:
</p>
<ul>
  <li>Eliminate data redundancy across organizational departments, corporate users, categories, and technicians.</li>
  <li>Model specialized ticket subtypes (<em>Incidents</em> vs <em>Service Requests</em>) through relational foreign key inheritance without null-heavy tables.</li>
  <li>Enforce immutable chronological state transition histories capturing all ticket updates with timestamps.</li>
  <li>Provide a live, responsive web interface executing real-time parameterized SQL CRUD operations over MySQL.</li>
</ul>
"""
pages.append(make_page(p9, "1"))

# PAGE 10 (Report Page 2): Chapter 1 - Introduction (Part 2)
p10 = """
<h2>1.4 Objectives</h2>
<p>
The specific SMART objectives of this project are:
</p>
<ol>
  <li>To design and deploy a 14-table relational database schema in MySQL residing strictly in Third Normal Form (3NF).</li>
  <li>To implement relational subtyping separating unplanned failure tickets (<em>Incidents</em>) from routine provisioning requests (<em>Service Requests</em>).</li>
  <li>To track the physical lifecycle of hardware assets by linking asset tags and serial numbers to user custodians, manufacturer warranty contracts, and maintenance expenditure receipts.</li>
  <li>To enforce complete referential integrity across all entities utilizing primary keys, foreign keys (<code>CASCADE</code>, <code>RESTRICT</code>, <code>SET NULL</code>), unique indexes, and domain <code>CHECK</code> constraints.</li>
  <li>To construct a modern web Single-Page Application (SPA) demonstrating live, real-time <code>INSERT</code>, <code>DELETE</code>, and <code>VIEW</code> operations directly connected to MySQL.</li>
  <li>To validate system correctness through an automated Python test suite achieving 100% pass rates across connection health, transaction persistence, and constraint enforcement.</li>
</ol>

<h2>1.5 Scope and Limitations</h2>
<p>
The operational scope of the system encompasses user ticket creation, technician assignment, priority escalation, chronological status audit logging, equipment allocation, warranty tracking, and departmental repair expense accounting. 
</p>
<p>
Project limitations include: commercial payment gateway transactions are omitted (maintenance expenses represent internal accounting records), public internet self-registration is disabled (user directories are managed by administrators), and low-level BIOS/telemetry firmware flashing is outside the database scope.
</p>

<h2>1.6 System Environment Overview</h2>
<p>
The system executes on a standardized open-source technology environment with initial baseline parameters:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 50%;">Attribute / Architectural Layer</th>
      <th style="width: 50%;">Specification / Deployed Parameter</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Database Management Engine</td><td>MySQL Community Server 9.7.1 / 8.0+</td></tr>
    <tr><td>Database Storage Engine</td><td>InnoDB (ACID Compliant, Row-Level Locking)</td></tr>
    <tr><td>Total Relational Tables</td><td>14 Normalized Tables (3NF Compliant)</td></tr>
    <tr><td>Foreign Key Relationships</td><td>14 Enforced Referential Integrity Links</td></tr>
    <tr><td>Initial Seed Records</td><td>55 Relational Rows across All Tables</td></tr>
    <tr><td>Application Server</td><td>Python 3.14 / Flask 3.1.3 REST API</td></tr>
    <tr><td>Database Connector</td><td>mysql-connector-python 26.7.0 (Parameterized)</td></tr>
    <tr><td>User Interface Stack</td><td>Semantic HTML5, Vanilla CSS, ES6+ JS, Three.js</td></tr>
  </tbody>
</table>
<div class="caption">Table 1.1: System Environment &amp; Initial Dataset Statistics</div>

<h2>1.7 Organization of the Report</h2>
<p>
The remainder of this report is organized as follows: Chapter 2 reviews foundational database theory, MySQL architecture, and technology stacks. Chapter 3 provides detailed system analysis, functional requirements, ER modeling, and normalization proofs. Chapter 4 details physical database implementation, SQL scripts, query outputs, and the data dictionary. Chapter 5 demonstrates the web user interface and live CRUD operations. Chapter 6 presents automated test results. Chapter 7 concludes the report and highlights future enhancements.
</p>
"""
pages.append(make_page(p10, "2"))

# PAGE 11 (Report Page 3): Chapter 2 - Literature Review (Part 1)
p11 = """
<h1>2. TECHNOLOGY / DATABASE REVIEW</h1>
<p>
This chapter provides a theoretical review of relational database management systems, normal form theory, transactional integrity, and the full-stack technology suite deployed in the <strong>IT Helpdesk and Asset Support Management System</strong>.
</p>

<h2>2.1 Database Management Systems (DBMS)</h2>
<p>
A Database Management System (DBMS) is specialized systems software that provides an interface between end-users, application programs, and physical database files. Prior to the advent of database systems, organizations stored information in conventional operating system flat files. As demonstrated by Silberschatz et al. (2020), file-processing environments exhibit severe inherent deficiencies, including data redundancy and inconsistency, difficulty in accessing data, data isolation, integrity problems, atomicity violations during system crashes, and concurrent-access anomalies.
</p>
<p>
A modern DBMS overcomes these limitations by centralizing data definition, enforcing global schema constraints, maintaining transactional atomicity, and providing declarative query languages that abstract physical data storage away from logical application views.
</p>

<h2>2.2 Relational Database Model</h2>
<p>
Introduced by E. F. Codd in his seminal 1970 paper, the relational model represents all data logically in the form of mathematical two-dimensional tables termed <em>relations</em>. Each row in a relation constitutes a <em>tuple</em>, representing an individual entity instance, while each column represents an <em>attribute</em> drawn from an atomic domain.
</p>
<p>
The relational model derives its mathematical rigor from set theory and first-order predicate logic. Relational integrity is maintained through formal constraints:
</p>
<ul>
  <li><strong>Entity Integrity:</strong> Every base relation must have a Primary Key comprising unique, non-null attribute values.</li>
  <li><strong>Referential Integrity:</strong> If attribute <em>FK</em> in relation <em>R1</em> references primary key <em>PK</em> in relation <em>R2</em>, then every value of <em>FK</em> in <em>R1</em> must either match an existing value of <em>PK</em> in <em>R2</em> or be NULL (if permitted).</li>
  <li><strong>Domain Integrity:</strong> Every attribute value must be an atomic element belonging to the pre-declared domain data type.</li>
</ul>

<h2>2.3 MySQL Architecture &amp; InnoDB Storage Engine</h2>
<p>
MySQL is one of the world's most widely deployed open-source relational database management systems. The MySQL server architecture operates on a modular two-tier model separating the connection handling and SQL parsing layer from the pluggable storage engine layer.
</p>
<p>
For the IT Helpdesk system, the <strong>InnoDB</strong> storage engine was selected exclusively. InnoDB is the default, fully ACID-compliant storage engine for MySQL, offering key enterprise features:
</p>
<ul>
  <li><strong>B+ Tree Clustered Indexes:</strong> Primary key lookups achieve <em>O(log N)</em> retrieval performance because data rows are organized directly within the leaf pages of the primary index B+ tree.</li>
  <li><strong>Foreign Key Constraint Enforcement:</strong> Unlike legacy engines such as MyISAM, InnoDB physically parses and enforces foreign key referential integrity at the database layer.</li>
  <li><strong>Row-Level Locking:</strong> Utilizes multi-version concurrency control (MVCC) to achieve high transaction throughput without table-wide locking bottlenecks.</li>
  <li><strong>Crash Recovery &amp; Redo Logging:</strong> Implements write-ahead logging (WAL) via doublewrite buffers and redo logs, guaranteeing zero data loss following unexpected power failures.</li>
</ul>
"""
pages.append(make_page(p11, "3"))

# PAGE 12 (Report Page 4): Chapter 2 - Literature Review (Part 2)
p12 = """
<h2>2.4 Structured Query Language (SQL)</h2>
<p>
Structured Query Language (SQL) is the standard declarative computer language used to define, manipulate, and query relational databases. SQL commands are formally classified into functional subsets:
</p>
<ul>
  <li><strong>Data Definition Language (DDL):</strong> Statements such as <code>CREATE</code>, <code>ALTER</code>, and <code>DROP</code> that define, modify, and drop relational schema structures and constraints.</li>
  <li><strong>Data Manipulation Language (DML):</strong> Statements such as <code>INSERT</code>, <code>UPDATE</code>, and <code>DELETE</code> used to insert, modify, and remove data tuples.</li>
  <li><strong>Data Query Language (DQL):</strong> The <code>SELECT</code> statement used to retrieve data using relational algebra operations including selection (&sigma;), projection (&pi;), Cartesian product (&times;), natural join (&bowtie;), and aggregation functions.</li>
</ul>

<h2>2.5 Database Normalization Theory</h2>
<p>
Database normalization is a formal mathematical process developed to eliminate data redundancy and prevent data anomalies (insertion, deletion, and update anomalies). Normalization decomposes relations using functional dependency analysis into progressively higher normal forms: First Normal Form (1NF), Second Normal Form (2NF), and Third Normal Form (3NF). A relation in 3NF guarantees that every non-key attribute depends solely on the key, the whole key, and nothing but the key.
</p>

<h2>2.6 Database Transactions &amp; ACID Properties</h2>
<p>
A database transaction is a logical unit of work comprising one or more SQL operations that must execute with complete integrity. A DBMS guarantees transaction reliability through the four classical <strong>ACID</strong> properties:
</p>
<ul>
  <li><strong>Atomicity:</strong> All operations within a transaction succeed completely, or the entire transaction is rolled back to its previous state (All-or-Nothing).</li>
  <li><strong>Consistency:</strong> A transaction transitions the database from one valid state satisfying all schema constraints to another valid state.</li>
  <li><strong>Isolation:</strong> Concurrent transaction executions yield the same state as if executed serially without interference.</li>
  <li><strong>Durability:</strong> Once a transaction commits, its modifications are permanently recorded in non-volatile storage.</li>
</ul>

<h2>2.7 IT Helpdesk Systems &amp; Industry Standards</h2>
<p>
In enterprise software engineering, modern helpdesks are modeled following the Information Technology Infrastructure Library (ITIL) framework. ITIL distinguishes between two fundamental support workflows:
</p>
<ol>
  <li><strong>Incident Management:</strong> Restoring normal service operations as rapidly as possible following an unplanned disruption or failure (e.g., hardware failure, network outage).</li>
  <li><strong>Service Request Management:</strong> Fulfilling standard, pre-approved user requests for hardware allocations, software installations, or access provisioning.</li>
</ol>
<p>
Our relational model directly mirrors this ITIL separation through relational subtype inheritance.
</p>

<h2>2.8 Full-Stack Technology Review</h2>
<p>
The application connects the MySQL database to end-users via a modern three-tier web stack. The backend employs <strong>Python 3.14</strong> and <strong>Flask 3.1.3</strong>, executing raw, parameterized SQL queries via <code>mysql-connector-python</code> without ORM overhead. The frontend employs a responsive Single-Page Application (SPA) utilizing <strong>Vanilla CSS</strong> custom properties, native HTML5 dialogs, asynchronous JavaScript Fetch clients, and <strong>Three.js</strong> for interactive 3D WebGL database relationship visualization.
</p>
"""
pages.append(make_page(p12, "4"))

# PAGE 13 (Report Page 5): Chapter 3 - System Analysis & Design (Part 1)
p13 = """
<h1>3. SYSTEM ANALYSIS AND DESIGN</h1>
<p>
This chapter presents the functional requirements analysis, non-functional constraints, high-level system architecture, conceptual Entity-Relationship (ER) model, physical relational schema, and mathematical normalization analysis for the <strong>IT Helpdesk and Asset Support Management System</strong>.
</p>

<h2>3.1 System Overview</h2>
<p>
The system models a multi-departmental corporate or academic IT support environment. Three primary stakeholder roles interact with the system:
</p>
<ul>
  <li><strong>End-Users (Employees / Students):</strong> File support tickets, select operational categories, track real-time resolution progress, and inspect personal hardware asset allocations.</li>
  <li><strong>Support Technicians:</strong> Inspect assigned tickets filtered by technical specialization, accept tickets into <em>In Progress</em> state, investigate root causes, and submit formal resolution records.</li>
  <li><strong>Helpdesk Administrators:</strong> Supervise queue metrics, balance technician workloads, register physical computing assets, manage warranty contracts, and record hardware repair invoices.</li>
</ul>

<h2>3.2 Functional Requirements</h2>
<p>
The system's core capabilities are formalized into seven major functional requirements:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 15%;">Req ID</th>
      <th style="width: 25%;">Module Name</th>
      <th style="width: 60%;">Detailed Functional Specification</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><strong>FR1</strong></td><td>Ticket Ingestion & Subtyping</td><td>Capture ticket title, description, category, priority, and classify ticket as an Incident or Service Request.</td></tr>
    <tr><td><strong>FR2</strong></td><td>Technician Assignment</td><td>Assign pending tickets to specialized support staff and transition ticket status to 'In Progress'.</td></tr>
    <tr><td><strong>FR3</strong></td><td>Audit Lifecycle Logging</td><td>Record every status change (Open &rarr; In Progress &rarr; Resolved) into <code>status_histories</code> with old/new states.</td></tr>
    <tr><td><strong>FR4</strong></td><td>Formal Resolution Log</td><td>Record resolution description and timestamp; enforce 1:1 uniqueness preventing duplicate resolutions.</td></tr>
    <tr><td><strong>FR5</strong></td><td>Asset Inventory Governance</td><td>Catalog hardware assets with unique asset tags, serial numbers, categories, warranties, and user custodians.</td></tr>
    <tr><td><strong>FR6</strong></td><td>Maintenance Accounting</td><td>Record asset servicing dates, repair descriptions, and costs with non-negative check constraints.</td></tr>
    <tr><td><strong>FR7</strong></td><td>Relational Reporting & SQL</td><td>Execute multi-table joins, workload aggregations, expenditure calculations, and live SQL queries.</td></tr>
  </tbody>
</table>
<div class="caption">Table 3.1: Functional Requirements Specification</div>

<h2>3.3 Non-Functional Requirements</h2>
<ul>
  <li><strong>ACID Reliability:</strong> All multi-table insertions must commit atomically; errors must trigger an automatic database rollback.</li>
  <li><strong>Referential Integrity:</strong> The database must prevent orphan records using <code>ON DELETE CASCADE</code> and protect master tables using <code>ON DELETE RESTRICT</code>.</li>
  <li><strong>Security:</strong> All SQL queries must use parameterized placeholders (<code>%s</code>) to eliminate SQL injection vulnerabilities.</li>
  <li><strong>Performance:</strong> Primary keys and foreign keys must be indexed in B+ trees to achieve sub-millisecond lookups.</li>
</ul>
"""
pages.append(make_page(p13, "5"))

# PAGE 14 (Report Page 6): Chapter 3 - System Analysis & Design (Part 2)
p14 = """
<h2>3.4 System Architecture</h2>
<p>
The application architecture is organized as a decoupled three-tier client-server system. The presentation tier interacts with the application tier exclusively through structured JSON REST endpoints, while the application tier manages database connectivity and executes parameterized SQL statements against MySQL:
</p>

<div style="background: #f8fafc; border: 1.5px solid #000000; padding: 12pt; margin: 10pt auto; max-width: 95%; text-align: center; font-family: 'Times New Roman', serif;">
  <div style="border: 1px solid #2563eb; background: #eff6ff; padding: 6pt; margin-bottom: 8pt; font-weight: bold;">
    PRESENTATION TIER (Web Single-Page Application)<br>
    <span style="font-weight: normal; font-size: 10pt;">Semantic HTML5 • Vanilla CSS Custom Properties • ES6+ Fetch API • Three.js 3D WebGL</span>
  </div>
  <div style="font-size: 14pt; color: #2563eb; margin: 4pt 0;">&#8597; HTTP REST API (JSON Payloads / Parameterized Endpoints)</div>
  <div style="border: 1px solid #16a34a; background: #f0fdf4; padding: 6pt; margin: 8pt 0; font-weight: bold;">
    APPLICATION &amp; LOGIC TIER (Python Flask Server &amp; DB Connection Pool)<br>
    <span style="font-weight: normal; font-size: 10pt;">REST Controllers • Input Validation • Atomic Transaction Control (conn.commit / rollback)</span>
  </div>
  <div style="font-size: 14pt; color: #16a34a; margin: 4pt 0;">&#8597; MySQL Native Protocol (Port 3306 / Parameterized SQL Execution)</div>
  <div style="border: 1px solid #d97706; background: #fffbeb; padding: 6pt; margin-top: 8pt; font-weight: bold;">
    DATA STORAGE TIER (MySQL Community Server 9.7.1 / 8.0+)<br>
    <span style="font-weight: normal; font-size: 10pt;">InnoDB Storage Engine • 14 Normalized 3NF Tables • 14 Foreign Keys • B+ Tree Indexes</span>
  </div>
</div>
<div class="caption">Figure 3.1: Three-Tier System Architecture Diagram</div>

<h2>3.5 Entity-Relationship (ER) Modeling</h2>
<p>
The database architecture organizes 14 relational tables into five cohesive operational domains:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Operational Domain</th>
      <th style="width: 35%;">Relational Tables</th>
      <th style="width: 40%;">Domain Scope &amp; Relational Responsibilities</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><strong>Organization Domain</strong></td><td><code>departments</code>, <code>users</code></td><td>Institutional structure, employee profiles, and unique corporate email addresses.</td></tr>
    <tr><td><strong>Classification Domain</strong></td><td><code>categories</code>, <code>priorities</code></td><td>Support categories and 4 priority severity rankings with domain CHECK constraints.</td></tr>
    <tr><td><strong>Support Staff Domain</strong></td><td><code>support_staff</code>, <code>assignments</code></td><td>IT technicians, technical specializations, and ticket dispatch mappings.</td></tr>
    <tr><td><strong>Asset &amp; Maintenance</strong></td><td><code>warranties</code>, <code>assets</code>, <code>maintenance</code></td><td>Hardware serial numbers, vendor warranty contracts, and cumulative repair costs.</td></tr>
    <tr><td><strong>Ticketing &amp; Auditing</strong></td><td><code>tickets</code>, <code>incidents</code>, <code>service_requests</code>, <code>status_histories</code>, <code>resolutions</code></td><td>Central ticket intake, 1:1 subtype inheritance, chronological status audit logs, and resolution narratives.</td></tr>
  </tbody>
</table>
<div class="caption">Table 3.2: Database Tables Overview</div>
"""
pages.append(make_page(p14, "6"))

# PAGE 15 (Report Page 7): Chapter 3 - ER Diagram
p15 = f"""
<h2>3.5.1 Detailed Entity-Relationship Diagram</h2>
<p>
Figure 3.2 illustrates the complete Entity-Relationship (ER) Diagram for the <code>it_helpdesk</code> system. The diagram accurately specifies all 14 entities, primary keys (PK), foreign keys (FK), and precise structural cardinalities:
</p>

<div style="text-align: center; margin: 6pt auto; border: 1px solid #000000; padding: 4pt; background: #ffffff;">
  <img src="{erd_img}" style="max-width: 100%; max-height: 125mm; object-fit: contain;">
</div>
<div class="caption">Figure 3.2: High-Resolution Entity-Relationship (ER) Diagram of the IT Helpdesk System</div>

<h2>3.5.2 Cardinalities and Participation Constraints</h2>
<table>
  <thead>
    <tr>
      <th style="width: 25%;">Relationship</th>
      <th style="width: 15%;">Cardinality</th>
      <th style="width: 20%;">Participation</th>
      <th style="width: 40%;">Relational Semantic Rule</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>departments &rarr; users</code></td><td>1 : N</td><td>Mandatory &rarr; Mandatory</td><td>Every user belongs to exactly one department.</td></tr>
    <tr><td><code>users &rarr; tickets</code></td><td>1 : N</td><td>Optional &rarr; Mandatory</td><td>A user can file multiple tickets; a ticket must have 1 requester.</td></tr>
    <tr><td><code>categories &rarr; tickets</code></td><td>1 : N</td><td>Optional &rarr; Mandatory</td><td>Every ticket belongs to exactly one category.</td></tr>
    <tr><td><code>priorities &rarr; tickets</code></td><td>1 : N</td><td>Optional &rarr; Mandatory</td><td>Every ticket is assigned exactly one priority level (1-5).</td></tr>
    <tr><td><code>tickets &rarr; incidents</code></td><td>1 : 1</td><td>Optional &rarr; Mandatory</td><td>Specialized subtype for unplanned system failures.</td></tr>
    <tr><td><code>tickets &rarr; service_requests</code></td><td>1 : 1</td><td>Optional &rarr; Mandatory</td><td>Specialized subtype for routine provisioning requests.</td></tr>
    <tr><td><code>tickets &rarr; assignments</code></td><td>1 : N</td><td>Optional &rarr; Mandatory</td><td>Tickets can be assigned sequentially to support staff.</td></tr>
    <tr><td><code>tickets &rarr; status_histories</code></td><td>1 : N</td><td>Mandatory &rarr; Mandatory</td><td>Every ticket maintains an append-only chronological audit log.</td></tr>
    <tr><td><code>tickets &rarr; resolutions</code></td><td>1 : 1</td><td>Optional &rarr; Mandatory</td><td>A resolved ticket has exactly one resolution (UNIQUE FK).</td></tr>
    <tr><td><code>warranties &rarr; assets</code></td><td>1 : N</td><td>Optional &rarr; Optional</td><td>A warranty covers hardware assets; assets can be out of warranty.</td></tr>
    <tr><td><code>assets &rarr; maintenance</code></td><td>1 : N</td><td>Optional &rarr; Mandatory</td><td>Physical devices accumulate servicing and repair expense logs.</td></tr>
  </tbody>
</table>
<div class="caption">Table 3.3: Relationship Cardinalities &amp; Participation Constraints</div>
"""
pages.append(make_page(p15, "7"))

# PAGE 16 (Report Page 8): Chapter 3 - Relational Schema & Design
p16 = """
<h2>3.6 Relational Schema Specification</h2>
<p>
The conceptual ER diagram is mapped into 14 physical relational schemas. Primary keys are underlined and foreign keys are designated with an asterisk (*):
</p>
<ol style="font-size: 11pt; line-height: 1.6; margin-left: 20pt;">
  <li><strong>departments</strong> (<u>department_id</u>, name, location)</li>
  <li><strong>users</strong> (<u>user_id</u>, name, email, department_id*)</li>
  <li><strong>categories</strong> (<u>category_id</u>, name, description)</li>
  <li><strong>priorities</strong> (<u>priority_id</u>, name, level)</li>
  <li><strong>support_staff</strong> (<u>staff_id</u>, name, email, specialization)</li>
  <li><strong>warranties</strong> (<u>warranty_id</u>, start_date, end_date, provider)</li>
  <li><strong>assets</strong> (<u>asset_id</u>, asset_tag, name, serial_no, user_id*, category_id*, warranty_id*)</li>
  <li><strong>tickets</strong> (<u>ticket_id</u>, ticket_no, user_id*, category_id*, priority_id*, title, description, status, created_at)</li>
  <li><strong>incidents</strong> (<u>ticket_id*</u>, incident_type)</li>
  <li><strong>service_requests</strong> (<u>ticket_id*</u>, request_type)</li>
  <li><strong>assignments</strong> (<u>assignment_id</u>, ticket_id*, staff_id*, assigned_at)</li>
  <li><strong>status_histories</strong> (<u>history_id</u>, ticket_id*, old_status, new_status, changed_at)</li>
  <li><strong>resolutions</strong> (<u>resolution_id</u>, ticket_id*, description, resolved_at)</li>
  <li><strong>maintenance</strong> (<u>maintenance_id</u>, asset_id*, maintenance_date, description, cost)</li>
</ol>

<h2>3.7 Database Design &amp; Referential Integrity Constraints</h2>
<p>
Referential integrity rules ensure the database remains in a consistent state during record modifications and deletions:
</p>
<ul>
  <li><strong>Master Table Protection (<code>ON DELETE RESTRICT</code>):</strong> Applied to <code>departments &rarr; users</code>, <code>categories &rarr; tickets</code>, <code>priorities &rarr; tickets</code>, and <code>support_staff &rarr; assignments</code>. This prevents accidental deletion of foundational lookup data while referenced by active transactional records.</li>
  <li><strong>Synchronized Cascading Deletions (<code>ON DELETE CASCADE</code>):</strong> Applied to ticket child entities (<code>incidents</code>, <code>service_requests</code>, <code>assignments</code>, <code>status_histories</code>, <code>resolutions</code>) and <code>assets &rarr; maintenance</code>. When a ticket or asset is permanently removed, all dependent operational records are purged cleanly without leaving orphan records.</li>
  <li><strong>Nullification on User Reassignment (<code>ON DELETE SET NULL</code>):</strong> Applied to <code>users &rarr; assets</code>. When an employee departs, their assigned computing hardware is not deleted; instead, <code>user_id</code> is set to NULL, safely returning the asset to general stock.</li>
  <li><strong>Domain Constraints (<code>CHECK</code>):</strong> Enforces business rules at the schema level: <code>priorities.level BETWEEN 1 AND 5</code>, <code>tickets.status IN ('Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Cancelled')</code>, <code>warranties.end_date >= start_date</code>, and <code>maintenance.cost >= 0</code>.</li>
</ul>
"""
pages.append(make_page(p16, "8"))

# PAGE 17 (Report Page 9): Chapter 3 - Normalization Analysis
p17 = """
<h2>3.8 Normalization Analysis (1NF, 2NF, 3NF Proofs)</h2>
<p>
To ensure the database is free of update, insertion, and deletion anomalies, the schema was analyzed and normalized according to formal functional dependency theory:
</p>

<h3>3.8.1 First Normal Form (1NF) Compliance</h3>
<p>
<em>Definition:</em> A relation <em>R</em> is in 1NF if and only if all underlying attribute domains contain only atomic, indivisible values, and there are no repeating groups or multi-valued attributes.
</p>
<p>
<em>Proof:</em> All attributes in every table represent primitive scalar values (integers, strings, dates, decimals, timestamps). Multi-valued attributes were decomposed into dedicated child relations: multiple technicians assigned to a ticket are stored across multiple rows in <code>assignments</code> rather than as comma-separated values in <code>tickets</code>. Multiple maintenance logs for an asset are normalized into <code>maintenance</code>. Every relation possesses an explicit Primary Key. Hence, all 14 tables satisfy 1NF.
</p>

<h3>3.8.2 Second Normal Form (2NF) Compliance</h3>
<p>
<em>Definition:</em> A relation <em>R</em> is in 2NF if and only if it is in 1NF and every non-prime attribute is fully functionally dependent on the entire primary key (no partial dependencies on a proper subset of any candidate key).
</p>
<p>
<em>Proof:</em> Every table in the system employs a single-attribute surrogate Primary Key (e.g., <code>ticket_id</code>, <code>asset_id</code>, <code>user_id</code>). In relations with subtype inheritance (<code>incidents</code> and <code>service_requests</code>), the primary key <code>ticket_id</code> is also a single attribute. Because no candidate key is composite, a proper subset of a candidate key cannot exist. Therefore, partial functional dependencies are mathematically impossible. All 14 tables strictly satisfy 2NF.
</p>

<h3>3.8.3 Third Normal Form (3NF) Compliance</h3>
<p>
<em>Definition:</em> A relation <em>R</em> is in 3NF if and only if it is in 2NF and whenever a non-trivial functional dependency <em>X &rarr; A</em> holds, either <em>X</em> is a superkey of <em>R</em>, or <em>A</em> is a prime attribute of <em>R</em> (elimination of transitive dependencies).
</p>
<p>
<em>Proof:</em> Transitive dependencies occur when non-key attributes determine other non-key attributes (<em>PK &rarr; X &rarr; Y</em>). The schema systematically eliminates all transitive dependencies:
</p>
<ul>
  <li>In <code>users</code>, storing department location would yield: <code>user_id &rarr; department_id &rarr; location</code>. The schema isolates departments into <code>departments(department_id, name, location)</code>.</li>
  <li>In <code>assets</code>, storing warranty provider and validity dates directly would yield: <code>asset_id &rarr; warranty_id &rarr; (provider, end_date)</code>. The schema isolates warranties into <code>warranties(warranty_id, start_date, end_date, provider)</code>.</li>
  <li>In <code>tickets</code>, category descriptions and priority levels are isolated into reference tables <code>categories</code> and <code>priorities</code>.</li>
</ul>
<p>
Consequently, every non-key attribute in every table depends strictly on the primary key, the whole primary key, and nothing but the primary key. All 14 tables reside in <strong>Third Normal Form (3NF)</strong>.
</p>
"""
pages.append(make_page(p17, "9"))

# PAGE 18 (Report Page 10): Chapter 4 - Database Implementation (Part 1)
p18 = """
<h1>4. DATABASE IMPLEMENTATION</h1>
<p>
This chapter presents the physical database implementation in MySQL, Data Definition Language (DDL) specifications, integrity constraint scripts, seed data insertion, and representative SQL queries.
</p>

<h2>4.1 Database Creation &amp; Engine Configuration</h2>
<pre><code>DROP DATABASE IF EXISTS it_helpdesk;
CREATE DATABASE it_helpdesk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE it_helpdesk;</code></pre>

<h2>4.2 Table Creation &amp; DDL Specifications</h2>
<pre><code>-- 1. Departments Master Table
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 2. Users Entity with Department Foreign Key
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. Tickets Central Entity with Domain Constraints
CREATE TABLE tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_no VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    priority_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_ticket_status 
        CHECK (status IN ('Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Cancelled')),
    CONSTRAINT fk_tickets_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_tickets_category 
        FOREIGN KEY (category_id) REFERENCES categories(category_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_tickets_priority 
        FOREIGN KEY (priority_id) REFERENCES priorities(priority_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. Incidents Subtype (1:1 Relational Inheritance)
CREATE TABLE incidents (
    ticket_id INT PRIMARY KEY,
    incident_type VARCHAR(100) NOT NULL,
    CONSTRAINT fk_incidents_ticket 
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 12. Status Histories (Immutable Audit Trail)
CREATE TABLE status_histories (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    old_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_status_histories_ticket 
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;</code></pre>
"""
pages.append(make_page(p18, "10"))

# PAGE 19 (Report Page 11): Chapter 4 - Database Implementation (Part 2)
p19 = """
<h2>4.4 Data Insertion &amp; Seed Dataset</h2>
<p>
To establish a realistic operational testing baseline, 55 relational records were loaded into the database across all 14 tables via <code>seed.sql</code>:
</p>
<ul>
  <li>4 Departments (Engineering, Human Resources, Finance & Accounts, Marketing & Sales)</li>
  <li>5 Registered Corporate Users spanning diverse departments</li>
  <li>5 Operational Categories (Hardware, Software, Network/VPN, Access/IAM, Asset Procurement)</li>
  <li>4 Priority Rankings (Low, Medium, High, Critical) with verified numeric weights (1 to 4)</li>
  <li>4 Support Staff Engineers with distinct specializations (Hardware, Network, OS, Identity)</li>
  <li>4 Manufacturer Warranties (Dell ProSupport Plus, AppleCare Enterprise, Lenovo Premier, HP Care Pack)</li>
  <li>5 Hardware Assets (Dell Latitude 7440, MacBook Pro 16", ThinkPad T14, HP EliteBook, UltraSharp Monitor)</li>
  <li>5 Initial Tickets partitioned into 3 Incidents and 2 Service Requests</li>
  <li>5 Support Staff Assignments and 5 Status History chronological audit entries</li>
  <li>1 Formal Resolution record and 3 Asset Maintenance servicing invoices totaling $2,400.00</li>
</ul>

<pre><code>-- Inserting Departments Seed Records
INSERT INTO departments (department_id, name, location) VALUES
(1, 'Engineering', 'Building A, Floor 3'),
(2, 'Human Resources', 'Building B, Floor 1'),
(3, 'Finance & Accounts', 'Building A, Floor 2'),
(4, 'Marketing & Sales', 'Building C, Floor 4');

-- Inserting Users Seed Records
INSERT INTO users (user_id, name, email, department_id) VALUES
(1, 'Aarav Sharma', 'aarav.sharma@company.com', 1),
(2, 'Priya Patel', 'priya.patel@company.com', 2),
(3, 'Rohan Verma', 'rohan.verma@company.com', 3),
(4, 'Ananya Iyer', 'ananya.iyer@company.com', 4),
(5, 'Vikram Singh', 'vikram.singh@company.com', 1);

-- Inserting Base Tickets with Foreign Keys
INSERT INTO tickets (ticket_id, ticket_no, user_id, category_id, priority_id, title, description, status, created_at)
VALUES 
(1, 'TKT-001', 1, 1, 3, 'Laptop display flickering constantly', 'Dell Latitude screen flickers when docked.', 'In Progress', '2026-08-20 09:30:00'),
(2, 'TKT-002', 2, 4, 2, 'VPN access setup for remote working', 'Need VPN credentials and MFA setup on phone.', 'Resolved', '2026-08-21 11:15:00'),
(3, 'TKT-003', 3, 3, 4, 'Finance accounting portal connection timeout', 'Unable to reach SAP Finance server from Floor 2.', 'In Progress', '2026-08-22 14:00:00');

-- Inserting Subtypes (Incidents vs Service Requests)
INSERT INTO incidents (ticket_id, incident_type) VALUES
(1, 'Hardware Malfunction'),
(3, 'Network Outage');

INSERT INTO service_requests (ticket_id, request_type) VALUES
(2, 'Access Provisioning');

-- Inserting Chronological Audit Trail
INSERT INTO status_histories (ticket_id, old_status, new_status, changed_at) VALUES
(1, NULL, 'Open', '2026-08-20 09:30:00'),
(1, 'Open', 'In Progress', '2026-08-20 10:00:00'),
(2, NULL, 'Open', '2026-08-21 11:15:00'),
(2, 'Open', 'In Progress', '2026-08-21 11:30:00'),
(2, 'In Progress', 'Resolved', '2026-08-21 15:45:00');</code></pre>
"""
pages.append(make_page(p19, "11"))

# PAGE 20 (Report Page 12): Chapter 4 - Database Implementation (Part 3)
p20 = """
<h2>4.5 SQL Queries &amp; Performance Optimization</h2>
<p>
The database utilizes optimized SQL queries demonstrating relational selections, multi-table joins, conditional aggregations, and subqueries:
</p>

<h3>4.5.1 Multi-Table Ticket Queue Query (7-Table JOIN)</h3>
<p>
Synthesizes a complete operational queue view combining tickets, users, departments, categories, priorities, and subtype classifications:
</p>
<pre><code>SELECT 
    t.ticket_no,
    t.title,
    t.status,
    p.name AS priority,
    c.name AS category,
    u.name AS requester,
    d.name AS department,
    CASE 
        WHEN i.ticket_id IS NOT NULL THEN 'Incident'
        WHEN sr.ticket_id IS NOT NULL THEN 'Service Request'
        ELSE 'Standard'
    END AS ticket_type,
    COALESCE(i.incident_type, sr.request_type, 'N/A') AS subtype_detail
FROM tickets t
JOIN users u ON t.user_id = u.user_id
JOIN departments d ON u.department_id = d.department_id
JOIN categories c ON t.category_id = c.category_id
JOIN priorities p ON t.priority_id = p.priority_id
LEFT JOIN incidents i ON t.ticket_id = i.ticket_id
LEFT JOIN service_requests sr ON t.ticket_id = sr.ticket_id
ORDER BY p.level DESC, t.created_at DESC;</code></pre>

<h3>4.5.2 Aggregate Technician Workload Query</h3>
<p>
Calculates active tickets versus completed tickets per technician using <code>LEFT JOIN</code>, <code>GROUP BY</code>, and conditional <code>SUM(CASE...)</code>:
</p>
<pre><code>SELECT 
    s.name AS technician,
    s.specialization,
    COUNT(a.assignment_id) AS total_assigned_tickets,
    SUM(CASE WHEN t.status IN ('Open', 'In Progress', 'Pending') THEN 1 ELSE 0 END) AS active_tickets,
    SUM(CASE WHEN t.status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS completed_tickets
FROM support_staff s
LEFT JOIN assignments a ON s.staff_id = a.staff_id
LEFT JOIN tickets t ON a.ticket_id = t.ticket_id
GROUP BY s.staff_id, s.name, s.specialization
ORDER BY active_tickets DESC;</code></pre>

<h3>4.5.3 Departmental Maintenance Expenditure Aggregation</h3>
<p>
Aggregates total physical hardware repair expenditure per department:
</p>
<pre><code>SELECT 
    d.name AS department_name,
    COUNT(DISTINCT a.asset_id) AS total_assets,
    CONCAT('$', FORMAT(COALESCE(SUM(m.cost), 0.00), 2)) AS total_maintenance_spent
FROM departments d
LEFT JOIN users u ON d.department_id = u.department_id
LEFT JOIN assets a ON u.user_id = a.user_id
LEFT JOIN maintenance m ON a.asset_id = m.asset_id
GROUP BY d.department_id, d.name
ORDER BY SUM(m.cost) DESC;</code></pre>
"""
pages.append(make_page(p20, "12"))

# PAGE 21 (Report Page 13): Chapter 4 - Query Outputs & Presentation-II Solution
p21 = """
<h2>4.6 Query Outputs &amp; Verification</h2>
<p>
Below are the authentic output results returned by the live MySQL database for the queries defined above:
</p>

<table>
  <thead>
    <tr>
      <th>Ticket No</th><th>Title</th><th>Status</th><th>Priority</th><th>Category</th><th>Requester</th><th>Department</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>TKT-003</td><td>Finance portal connection timeout</td><td>In Progress</td><td>Critical</td><td>Network &amp; VPN</td><td>Rohan Verma</td><td>Finance</td><td>Incident</td></tr>
    <tr><td>TKT-001</td><td>Laptop display flickering constantly</td><td>In Progress</td><td>High</td><td>Hardware Issue</td><td>Aarav Sharma</td><td>Engineering</td><td>Incident</td></tr>
    <tr><td>TKT-002</td><td>VPN access setup for remote working</td><td>Resolved</td><td>Medium</td><td>Access/IAM</td><td>Priya Patel</td><td>HR</td><td>Service Req</td></tr>
    <tr><td>TKT-005</td><td>Request second monitor for dev</td><td>Open</td><td>Medium</td><td>Procurement</td><td>Vikram Singh</td><td>Engineering</td><td>Service Req</td></tr>
    <tr><td>TKT-004</td><td>Install Figma desktop client</td><td>Open</td><td>Low</td><td>Software &amp; OS</td><td>Ananya Iyer</td><td>Marketing</td><td>Incident</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.15: Multi-Table Ticket Queue Query Output</div>

<table>
  <thead>
    <tr>
      <th>Technician Name</th><th>Specialization</th><th>Total Assigned</th><th>Active Tickets</th><th>Completed Tickets</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Karan Malhotra</td><td>Hardware &amp; Peripherals</td><td>2</td><td>2</td><td>0</td></tr>
    <tr><td>Sneha Rao</td><td>Network &amp; Security</td><td>1</td><td>1</td><td>0</td></tr>
    <tr><td>Amit Joshi</td><td>Operating Systems &amp; Software</td><td>1</td><td>1</td><td>0</td></tr>
    <tr><td>Divya Nair</td><td>Identity &amp; Access Management</td><td>1</td><td>0</td><td>1</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.16: Technician Workload Aggregation Output</div>

<table>
  <thead>
    <tr>
      <th>Department Name</th><th>Total Allocated Assets</th><th>Total Maintenance Spent</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Finance &amp; Accounts</td><td>1</td><td>$1,200.00</td></tr>
    <tr><td>Engineering</td><td>2</td><td>$750.00</td></tr>
    <tr><td>Marketing &amp; Sales</td><td>1</td><td>$450.00</td></tr>
    <tr><td>Human Resources</td><td>1</td><td>$0.00</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.17: Departmental Maintenance Expenditure Output</div>

<h2>4.6.1 Presentation-II Assigned Viva Query &amp; Solution</h2>
<p>
<em>Problem Statement:</em> Retrieve all IT support technicians who have been assigned tickets with high or critical priority (level &ge; 3), calculate their active workload, and list their specializations:
</p>
<pre><code>SELECT 
    s.name AS technician,
    s.specialization,
    COUNT(t.ticket_id) AS total_high_priority_tickets,
    SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_tickets
FROM support_staff s
JOIN assignments a ON s.staff_id = a.staff_id
JOIN tickets t ON a.ticket_id = t.ticket_id
JOIN priorities p ON t.priority_id = p.priority_id
WHERE p.level >= 3
GROUP BY s.staff_id, s.name, s.specialization
HAVING COUNT(t.ticket_id) > 0
ORDER BY total_high_priority_tickets DESC;</code></pre>

<table>
  <thead>
    <tr>
      <th>Technician</th><th>Specialization</th><th>High/Critical Tickets</th><th>In Progress Tickets</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Karan Malhotra</td><td>Hardware &amp; Peripherals</td><td>1</td><td>1</td></tr>
    <tr><td>Sneha Rao</td><td>Network &amp; Security</td><td>1</td><td>1</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.18: Presentation-II Assigned Query Output</div>
"""
pages.append(make_page(p21, "13"))

# PAGE 22 (Report Page 14): Chapter 4 - Data Dictionary (Part 1)
p22 = """
<h2>4.7 Complete Data Dictionary (All 14 Tables)</h2>
<p>
This section presents the physical data dictionary derived from <code>schema.sql</code> for Tables 1 through 6:
</p>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>department_id</code></td><td>INT</td><td>NO</td><td>PK</td><td>AUTO_INCREMENT. Primary key for departments.</td></tr>
    <tr><td><code>name</code></td><td>VARCHAR(100)</td><td>NO</td><td>UNI</td><td>Unique department name (e.g. Engineering).</td></tr>
    <tr><td><code>location</code></td><td>VARCHAR(100)</td><td>NO</td><td>-</td><td>Building and floor location.</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.1: Data Dictionary — departments</div>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>user_id</code></td><td>INT</td><td>NO</td><td>PK</td><td>AUTO_INCREMENT. Primary user identifier.</td></tr>
    <tr><td><code>name</code></td><td>VARCHAR(100)</td><td>NO</td><td>-</td><td>Full name of corporate employee.</td></tr>
    <tr><td><code>email</code></td><td>VARCHAR(150)</td><td>NO</td><td>UNI</td><td>Unique corporate email address.</td></tr>
    <tr><td><code>department_id</code></td><td>INT</td><td>NO</td><td>FK</td><td>References departments(department_id) ON DELETE RESTRICT.</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.2: Data Dictionary — users</div>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>category_id</code></td><td>INT</td><td>NO</td><td>PK</td><td>AUTO_INCREMENT. Primary category key.</td></tr>
    <tr><td><code>name</code></td><td>VARCHAR(100)</td><td>NO</td><td>UNI</td><td>Unique category designation (e.g. Hardware Issue).</td></tr>
    <tr><td><code>description</code></td><td>TEXT</td><td>YES</td><td>-</td><td>Detailed scope and purpose of the category.</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.3: Data Dictionary — categories</div>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>priority_id</code></td><td>INT</td><td>NO</td><td>PK</td><td>AUTO_INCREMENT. Primary priority key.</td></tr>
    <tr><td><code>name</code></td><td>VARCHAR(50)</td><td>NO</td><td>UNI</td><td>Priority label (Low, Medium, High, Critical).</td></tr>
    <tr><td><code>level</code></td><td>INT</td><td>NO</td><td>-</td><td>CHECK (level BETWEEN 1 AND 5). Numeric ranking.</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.4: Data Dictionary — priorities</div>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>staff_id</code></td><td>INT</td><td>NO</td><td>PK</td><td>AUTO_INCREMENT. Primary technician key.</td></tr>
    <tr><td><code>name</code></td><td>VARCHAR(100)</td><td>NO</td><td>-</td><td>Support engineer full name.</td></tr>
    <tr><td><code>email</code></td><td>VARCHAR(150)</td><td>NO</td><td>UNI</td><td>Unique support staff email address.</td></tr>
    <tr><td><code>specialization</code></td><td>VARCHAR(100)</td><td>NO</td><td>-</td><td>Technical expertise domain (e.g. Network & Security).</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.5: Data Dictionary — support_staff</div>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>warranty_id</code></td><td>INT</td><td>NO</td><td>PK</td><td>AUTO_INCREMENT. Primary warranty key.</td></tr>
    <tr><td><code>start_date</code></td><td>DATE</td><td>NO</td><td>-</td><td>Warranty coverage inception date.</td></tr>
    <tr><td><code>end_date</code></td><td>DATE</td><td>NO</td><td>-</td><td>CHECK (end_date >= start_date). Expiration date.</td></tr>
    <tr><td><code>provider</code></td><td>VARCHAR(100)</td><td>NO</td><td>-</td><td>Vendor coverage provider (e.g. Dell ProSupport).</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.6: Data Dictionary — warranties</div>
"""
pages.append(make_page(p22, "14"))

# PAGE 23 (Report Page 15): Chapter 4 - Data Dictionary (Part 2)
p23 = """
<h2>4.7 Complete Data Dictionary (Continued: Tables 7 to 14)</h2>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>asset_id</code></td><td>INT</td><td>NO</td><td>PK</td><td>AUTO_INCREMENT. Primary asset identifier.</td></tr>
    <tr><td><code>asset_tag</code></td><td>VARCHAR(50)</td><td>NO</td><td>UNI</td><td>Unique inventory tag (AST-DELL-001).</td></tr>
    <tr><td><code>name</code></td><td>VARCHAR(100)</td><td>NO</td><td>-</td><td>Hardware equipment model name.</td></tr>
    <tr><td><code>serial_no</code></td><td>VARCHAR(100)</td><td>NO</td><td>UNI</td><td>Manufacturer hardware serial number.</td></tr>
    <tr><td><code>user_id</code></td><td>INT</td><td>YES</td><td>FK</td><td>References users(user_id) ON DELETE SET NULL.</td></tr>
    <tr><td><code>category_id</code></td><td>INT</td><td>NO</td><td>FK</td><td>References categories(category_id) ON DELETE RESTRICT.</td></tr>
    <tr><td><code>warranty_id</code></td><td>INT</td><td>YES</td><td>FK</td><td>References warranties(warranty_id) ON DELETE SET NULL.</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.7: Data Dictionary — assets</div>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>ticket_id</code></td><td>INT</td><td>NO</td><td>PK</td><td>AUTO_INCREMENT. Primary ticket identifier.</td></tr>
    <tr><td><code>ticket_no</code></td><td>VARCHAR(50)</td><td>NO</td><td>UNI</td><td>Sequential tracking code (TKT-001).</td></tr>
    <tr><td><code>user_id</code></td><td>INT</td><td>NO</td><td>FK</td><td>References users(user_id) ON DELETE RESTRICT.</td></tr>
    <tr><td><code>category_id</code></td><td>INT</td><td>NO</td><td>FK</td><td>References categories(category_id) ON DELETE RESTRICT.</td></tr>
    <tr><td><code>priority_id</code></td><td>INT</td><td>NO</td><td>FK</td><td>References priorities(priority_id) ON DELETE RESTRICT.</td></tr>
    <tr><td><code>title</code></td><td>VARCHAR(200)</td><td>NO</td><td>-</td><td>Brief issue synopsis.</td></tr>
    <tr><td><code>description</code></td><td>TEXT</td><td>NO</td><td>-</td><td>Detailed problem description.</td></tr>
    <tr><td><code>status</code></td><td>VARCHAR(50)</td><td>NO</td><td>-</td><td>CHECK (status IN ('Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Cancelled')).</td></tr>
    <tr><td><code>created_at</code></td><td>TIMESTAMP</td><td>NO</td><td>-</td><td>Default CURRENT_TIMESTAMP. Filing time.</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.8: Data Dictionary — tickets</div>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>ticket_id</code></td><td>INT</td><td>NO</td><td>PK/FK</td><td>References tickets(ticket_id) ON DELETE CASCADE.</td></tr>
    <tr><td><code>incident_type</code></td><td>VARCHAR(100)</td><td>NO</td><td>-</td><td>Nature of outage (Hardware Malfunction, Outage).</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.9: Data Dictionary — incidents</div>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>ticket_id</code></td><td>INT</td><td>NO</td><td>PK/FK</td><td>References tickets(ticket_id) ON DELETE CASCADE.</td></tr>
    <tr><td><code>request_type</code></td><td>VARCHAR(100)</td><td>NO</td><td>-</td><td>Nature of request (Access Provisioning, Allocation).</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.10: Data Dictionary — service_requests</div>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>assignment_id</code></td><td>INT</td><td>NO</td><td>PK</td><td>AUTO_INCREMENT. Primary assignment key.</td></tr>
    <tr><td><code>ticket_id</code></td><td>INT</td><td>NO</td><td>FK</td><td>References tickets(ticket_id) ON DELETE CASCADE.</td></tr>
    <tr><td><code>staff_id</code></td><td>INT</td><td>NO</td><td>FK</td><td>References support_staff(staff_id) ON DELETE RESTRICT.</td></tr>
    <tr><td><code>assigned_at</code></td><td>TIMESTAMP</td><td>NO</td><td>-</td><td>Default CURRENT_TIMESTAMP. Assignment time.</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.11: Data Dictionary — assignments</div>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>history_id</code></td><td>INT</td><td>NO</td><td>PK</td><td>AUTO_INCREMENT. Primary audit log key.</td></tr>
    <tr><td><code>ticket_id</code></td><td>INT</td><td>NO</td><td>FK</td><td>References tickets(ticket_id) ON DELETE CASCADE.</td></tr>
    <tr><td><code>old_status</code></td><td>VARCHAR(50)</td><td>YES</td><td>-</td><td>Previous state (NULL on initial ticket creation).</td></tr>
    <tr><td><code>new_status</code></td><td>VARCHAR(50)</td><td>NO</td><td>-</td><td>Updated state (Open, In Progress, Resolved).</td></tr>
    <tr><td><code>changed_at</code></td><td>TIMESTAMP</td><td>NO</td><td>-</td><td>Default CURRENT_TIMESTAMP. Transition time.</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.12: Data Dictionary — status_histories</div>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>resolution_id</code></td><td>INT</td><td>NO</td><td>PK</td><td>AUTO_INCREMENT. Primary resolution key.</td></tr>
    <tr><td><code>ticket_id</code></td><td>INT</td><td>NO</td><td>FK</td><td>References tickets(ticket_id) UNIQUE ON DELETE CASCADE.</td></tr>
    <tr><td><code>description</code></td><td>TEXT</td><td>NO</td><td>-</td><td>Official resolution narrative.</td></tr>
    <tr><td><code>resolved_at</code></td><td>TIMESTAMP</td><td>NO</td><td>-</td><td>Default CURRENT_TIMESTAMP. Resolution time.</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.13: Data Dictionary — resolutions</div>

<table>
  <thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Constraints &amp; Description</th></tr></thead>
  <tbody>
    <tr><td><code>maintenance_id</code></td><td>INT</td><td>NO</td><td>PK</td><td>AUTO_INCREMENT. Primary maintenance key.</td></tr>
    <tr><td><code>asset_id</code></td><td>INT</td><td>NO</td><td>FK</td><td>References assets(asset_id) ON DELETE CASCADE.</td></tr>
    <tr><td><code>maintenance_date</code></td><td>DATE</td><td>NO</td><td>-</td><td>Servicing date.</td></tr>
    <tr><td><code>description</code></td><td>TEXT</td><td>NO</td><td>-</td><td>Details of work performed.</td></tr>
    <tr><td><code>cost</code></td><td>DECIMAL(10,2)</td><td>NO</td><td>-</td><td>CHECK (cost >= 0). Invoiced cost in dollars.</td></tr>
  </tbody>
</table>
<div class="caption">Table 4.14: Data Dictionary — maintenance</div>
"""
pages.append(make_page(p23, "15"))

# PAGE 24 (Report Page 16): Chapter 5 - User Interface (Part 1)
p24 = f"""
<h1>5. USER INTERFACE AND IMPLEMENTATION</h1>
<p>
This chapter presents the user interface design, full-stack implementation architecture, and authentic screen captures obtained from the running application executing on <code>http://127.0.0.1:5050</code> connected to MySQL <code>it_helpdesk</code>.
</p>

<h2>5.1 UI Overview &amp; Architecture</h2>
<p>
The user interface is designed as an interactive Single-Page Application (SPA) adhering to modern web design standards. The frontend uses a custom design token system in Vanilla CSS, native HTML5 dialogs, and asynchronous JavaScript using the native Fetch API. A central Three.js WebGL canvas provides an interactive 3D relationship visualizer rendering database tables and relationships.
</p>

<h2>5.2 Operations Dashboard &amp; 3D Visualizer</h2>
<p>
The command dashboard displays real-time aggregate counters queried dynamically from MySQL (Total Tickets, Open vs. Resolved, Hardware Assets, Users, Maintenance Expenditure), an active database connection health pill, and the 3D database visualizer:
</p>

<div style="text-align: center; margin: 4pt auto; border: 1px solid #000000; padding: 2pt;">
  <img src="{dash_img}" style="max-width: 100%; max-height: 80mm; object-fit: contain;">
</div>
<div class="caption">Figure 5.1: IT Helpdesk System Operations Dashboard</div>

<div style="text-align: center; margin: 4pt auto; border: 1px solid #000000; padding: 2pt;">
  <img src="{db_conn_img}" style="max-width: 100%; max-height: 25mm; object-fit: contain;">
</div>
<div class="caption">Figure 5.2: Live MySQL Database Connectivity Status Pill</div>

<p>
The connection pill (Figure 5.2) executes an asynchronous ping to <code>/api/status</code>, displaying a live green indicator verifying active connectivity to MySQL on port 3306.
</p>
"""
pages.append(make_page(p24, "16"))

# PAGE 25 (Report Page 17): Chapter 5 - User Interface (Part 2)
p25 = f"""
<h2>5.3 Ticket Management &amp; Relational Queues (VIEW Operation)</h2>
<p>
The ticket management queue executes a multi-table SQL join to present relational tickets with priority badges, dynamic subtype icons, requester contact details, and department office locations. Users can filter records by status (Open, In Progress, Resolved), category, or search across ticket numbers:
</p>

<div style="text-align: center; margin: 6pt auto; border: 1px solid #000000; padding: 2pt;">
  <img src="{tickets_img}" style="max-width: 100%; max-height: 95mm; object-fit: contain;">
</div>
<div class="caption">Figure 5.4: Ticket Management Relational Queue View (VIEW Operation)</div>

<h2>5.4 Ticket Subtyping &amp; Incident Management</h2>
<p>
When an incident is reported (e.g., TKT-001 "Laptop display flickering constantly"), the system links the base ticket to <code>incidents</code> with a specific <code>incident_type</code> (Hardware Malfunction). This clean 1:1 relational inheritance ensures incident-specific attributes are recorded without sparse NULL values in the base ticket table.
</p>

<h2>5.5 Service Requests</h2>
<p>
Routine user requests (e.g., TKT-002 "VPN access setup" or TKT-005 "Request second monitor") are classified as Service Requests and mapped to <code>service_requests</code> with a designated <code>request_type</code> (Access Provisioning or Hardware Allocation).
</p>
"""
pages.append(make_page(p25, "17"))

# PAGE 26 (Report Page 18): Chapter 5 - User Interface (Part 3)
p26 = f"""
<h2>5.6 Hardware Asset Management &amp; Warranties</h2>
<p>
The hardware asset management module catalogs all physical computing equipment, serial numbers, institutional asset tags, assigned employee custodians, and active manufacturer warranty validity dates:
</p>

<div style="text-align: center; margin: 4pt auto; border: 1px solid #000000; padding: 2pt;">
  <img src="{assets_img}" style="max-width: 100%; max-height: 80mm; object-fit: contain;">
</div>
<div class="caption">Figure 5.11: Hardware Assets Inventory &amp; Warranty View</div>

<h2>5.7 User &amp; Department Management</h2>
<p>
The user directory maps employees and faculty to their respective academic departments, showing active ticket workloads and allocated computing hardware:
</p>

<div style="text-align: center; margin: 4pt auto; border: 1px solid #000000; padding: 2pt;">
  <img src="{users_img}" style="max-width: 100%; max-height: 80mm; object-fit: contain;">
</div>
<div class="caption">Figure 5.10: Users Directory &amp; Department Mapping View</div>

<h2>5.8 Support Staff &amp; Technician Workloads</h2>
<p>
Support staff profiles display specialized domain tags (Hardware & Peripherals, Network & Security, Operating Systems, Identity/Access) and active assignment counts, enabling managers to balance ticket distribution.
</p>
"""
pages.append(make_page(p26, "18"))

# PAGE 27 (Report Page 19): Chapter 5 - User Interface (Part 4: INSERT)
p27 = f"""
<h2>5.9 Form-Driven Record Insertion (INSERT Operation)</h2>
<p>
The ticket insertion workflow demonstrates form-driven atomic record creation. The "Add Ticket" modal dynamically populates foreign key dropdowns (Users, Categories, Priorities) directly from live MySQL tables and provides a radio selector for ticket subtyping (Incident vs Service Request):
</p>

<div style="text-align: center; margin: 4pt auto; border: 1px solid #000000; padding: 2pt;">
  <img src="{insert_form_img}" style="max-width: 100%; max-height: 72mm; object-fit: contain;">
</div>
<div class="caption">Figure 5.5: Add Ticket Form Modal (INSERT Operation)</div>

<p>
Figures 5.6 and 5.7 illustrate the exact before-and-after states of the database table when a new ticket (<code>TKT-006</code>) is inserted:
</p>

<div style="text-align: center; margin: 4pt auto; border: 1px solid #000000; padding: 2pt;">
  <img src="{before_insert_img}" style="max-width: 100%; max-height: 50mm; object-fit: contain;">
</div>
<div class="caption">Figure 5.6: Ticket Queue Before Record Insertion (5 Records)</div>

<div style="text-align: center; margin: 4pt auto; border: 1px solid #000000; padding: 2pt;">
  <img src="{after_insert_img}" style="max-width: 100%; max-height: 50mm; object-fit: contain;">
</div>
<div class="caption">Figure 5.7: Ticket Queue After Record Insertion (6 Records, TKT-006)</div>
"""
pages.append(make_page(p27, "19"))

# PAGE 28 (Report Page 20): Chapter 5 - User Interface (Part 5: DELETE)
p28 = f"""
<h2>5.10 Referential Deletion &amp; Constraint Protection (DELETE Operation)</h2>
<p>
The deletion workflow demonstrates permanent record deletion executing <code>DELETE FROM tickets WHERE ticket_id = %s</code> directly in MySQL. To prevent accidental data loss, the user interface displays a confirmation dialog featuring the specific ticket tracking code:
</p>

<div style="text-align: center; margin: 4pt auto; border: 1px solid #000000; padding: 2pt;">
  <img src="{before_delete_img}" style="max-width: 100%; max-height: 65mm; object-fit: contain;">
</div>
<div class="caption">Figure 5.8: Delete Confirmation Modal (DELETE Operation)</div>

<p>
Upon confirmation, the database engine executes an <code>ON DELETE CASCADE</code>, permanently purging the ticket, its associated subtype row in <code>incidents</code> or <code>service_requests</code>, and its audit history in <code>status_histories</code>. The ticket table immediately updates, restoring the record count to 5:
</p>

<div style="text-align: center; margin: 4pt auto; border: 1px solid #000000; padding: 2pt;">
  <img src="{after_delete_img}" style="max-width: 100%; max-height: 65mm; object-fit: contain;">
</div>
<div class="caption">Figure 5.9: Ticket Queue After Record Deletion (Permanently Purged)</div>

<h2>5.11 SQL Verification &amp; Database Connectivity</h2>
<p>
The application includes an in-browser SQL verification playground configured with pre-built analytical queries (technician workloads, maintenance spend, audit timelines) allowing evaluators to verify raw database outputs live.
</p>
"""
pages.append(make_page(p28, "20"))

# PAGE 29 (Report Page 21): Chapter 6 - Testing & Results (Part 1)
p29 = """
<h1>6. TESTING AND RESULTS</h1>
<p>
This chapter presents the testing methodology, automated test case execution matrix (TC01 to TC10), CRUD testing, and database persistence results for the <code>it_helpdesk</code> system.
</p>

<h2>6.1 Testing Methodology</h2>
<p>
Testing was conducted using a dedicated automated test suite (<code>test_dbms.py</code>) executing directly against the live MySQL 9.7.1 server on port 3306. The test harness evaluates connection health, relational data retrieval, multi-table transactional insertions, cascading deletions, client refresh persistence, input validation, unique constraint catches, and foreign key RESTRICT violations.
</p>

<h2>6.2 Automated Test Case Results Matrix</h2>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">ID</th>
      <th style="width: 22%;">Feature Tested</th>
      <th style="width: 28%;">Test Action / Input</th>
      <th style="width: 30%;">Expected &amp; Actual Result</th>
      <th style="width: 12%;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><strong>TC01</strong></td><td>MySQL Connection</td><td>Connect via <code>db.py</code> pinging port 3306</td><td>Active connection to <code>it_helpdesk</code> verified (v9.7.1, 14 tables)</td><td><span class="badge-pass">PASS</span></td></tr>
    <tr><td><strong>TC02</strong></td><td>View Tickets (JOIN)</td><td>Execute 7-table SELECT JOIN</td><td>Retrieved relational tickets with priority and subtype details</td><td><span class="badge-pass">PASS</span></td></tr>
    <tr><td><strong>TC03</strong></td><td>Insert Ticket (DML)</td><td>POST <code>/api/tickets</code> with valid fields</td><td>HTTP 201 Created; auto-generated ticket_no; atomic insert</td><td><span class="badge-pass">PASS</span></td></tr>
    <tr><td><strong>TC04</strong></td><td>Persistence Check</td><td>Query MySQL: <code>SELECT WHERE ticket_id=26</code></td><td>Record confirmed in InnoDB storage with status 'Open'</td><td><span class="badge-pass">PASS</span></td></tr>
    <tr><td><strong>TC05</strong></td><td>Delete Ticket (DML)</td><td>DELETE <code>/api/tickets/26</code></td><td>HTTP 200 Success; cascading purge of subtype &amp; audit rows</td><td><span class="badge-pass">PASS</span></td></tr>
    <tr><td><strong>TC06</strong></td><td>Delete Persistence</td><td>Query MySQL: <code>SELECT WHERE ticket_id=26</code></td><td>Query returns exactly 0 rows (permanent removal verified)</td><td><span class="badge-pass">PASS</span></td></tr>
    <tr><td><strong>TC07</strong></td><td>Form Validation</td><td>POST ticket with empty title: <code>{"title": ""}</code></td><td>HTTP 400 Bad Request; caught validation error cleanly</td><td><span class="badge-pass">PASS</span></td></tr>
    <tr><td><strong>TC08</strong></td><td>UNIQUE Constraint</td><td>POST user with duplicate email</td><td>HTTP 409 Conflict; MySQL Error 1062 caught gracefully</td><td><span class="badge-pass">PASS</span></td></tr>
    <tr><td><strong>TC09</strong></td><td>FK RESTRICT Check</td><td>DELETE user with active tickets</td><td>HTTP 409 Conflict; MySQL Error 1451 caught cleanly</td><td><span class="badge-pass">PASS</span></td></tr>
    <tr><td><strong>TC10</strong></td><td>Offline Handling</td><td>Simulate offline port in health check</td><td>Graceful error dictionary without leaking database passwords</td><td><span class="badge-pass">PASS</span></td></tr>
  </tbody>
</table>
<div class="caption">Table 6.1: Automated DBMS Test Suite Execution Matrix (TC01 - TC10)</div>

<h2>6.3 CRUD Operations Testing</h2>
<p>
CRUD testing confirmed that all <code>VIEW</code>, <code>INSERT</code>, and <code>DELETE</code> operations translate into real, parameterized SQL statements. Zero mock arrays or client-side storage were used.
</p>
"""
pages.append(make_page(p29, "21"))

# PAGE 30 (Report Page 22): Chapter 6 - Testing & Results (Part 2)
p30 = """
<h2>6.4 Database Persistence Testing</h2>
<p>
A core requirement for Presentation-III evaluation is verifying that modifications persist across client application reloads:
</p>
<ol>
  <li><strong>Insert Verification:</strong> When a new ticket record was created via the web interface, the newly assigned ticket tracking number was queried directly via the MySQL command-line client. The row was confirmed to reside physically within the InnoDB data pages on disk.</li>
  <li><strong>Browser Refresh Verification:</strong> The client web browser was force-refreshed (<code>Cmd+R</code> / <code>Ctrl+F5</code>). The updated ticket record was immediately fetched via a fresh SQL <code>SELECT</code> query and rendered in the table, proving persistence.</li>
  <li><strong>Delete Verification:</strong> Following record deletion, the browser was refreshed again; the record remained permanently absent from the database, confirming the deletion was executed on persistent storage rather than a transient memory state.</li>
</ol>

<h2>6.5 SQL Query Testing</h2>
<p>
The database engine's query optimizer was tested across complex analytical queries using the <code>EXPLAIN</code> statement. Because primary keys and foreign keys in InnoDB automatically create underlying B+ tree indexes, multi-table joins between <code>tickets</code>, <code>users</code>, and <code>departments</code> utilized efficient index lookups (<code>eq_ref</code> / <code>ref</code>), achieving sub-millisecond execution times (&lt; 2 ms) on the development hardware.
</p>

<h2>6.6 Results and Discussion</h2>
<p>
The experimental results demonstrate that the <code>it_helpdesk</code> system satisfies all functional, relational, and performance criteria:
</p>
<ul>
  <li><strong>100% Test Pass Rate:</strong> All 10 automated test scenarios (TC01 to TC10) passed consistently without errors or race conditions.</li>
  <li><strong>Referential Cascade Reliability:</strong> Deleting a parent ticket consistently purged corresponding subtype rows in <code>incidents</code> and status histories in <code>status_histories</code>, guaranteeing zero orphan tuples.</li>
  <li><strong>Master Data Protection:</strong> Attempting to delete a registered department or user associated with active tickets was strictly blocked by InnoDB foreign key rules (<code>RESTRICT</code>), returning friendly HTTP 409 conflict messages to the user interface.</li>
  <li><strong>Full Stack Cohesion:</strong> The decoupled Python Flask backend proved lightweight, responsive, and completely reliable in bridging the MySQL database with the Single-Page Application frontend.</li>
</ul>
"""
pages.append(make_page(p30, "22"))

# PAGE 31 (Report Page 23): Chapter 7 - Conclusion & Future Work
p31 = """
<h1>7. CONCLUSION AND FUTURE ENHANCEMENTS</h1>
<p>
This chapter summarizes the contributions of the project, outlines current operational limitations, and proposes directions for future enhancement.
</p>

<h2>7.1 Conclusion</h2>
<p>
The <strong>IT Helpdesk and Asset Support Management System</strong> successfully achieves all objectives established by the DBMS Course Project curriculum. The key contributions of this work include:
</p>
<ol>
  <li><strong>Normalized Relational Architecture:</strong> Design and deployment of a 14-table schema residing strictly in Third Normal Form (3NF), eliminating update, deletion, and insertion anomalies.</li>
  <li><strong>Relational Subtype Modeling:</strong> Clean differentiation between unplanned operational outages (<em>Incidents</em>) and routine access requests (<em>Service Requests</em>) through 1:1 foreign key inheritance.</li>
  <li><strong>Automated Audit Trails:</strong> Implementation of an append-only chronological state transition log (<code>status_histories</code>) capturing all status updates with timestamps and previous states.</li>
  <li><strong>Hardware Asset Governance:</strong> Comprehensive tracking of computing assets, unique serial numbers, employee custodians, vendor warranty validity, and maintenance repair expenditures.</li>
  <li><strong>Full-Stack Interactive Interface:</strong> Delivery of a responsive web Single-Page Application (SPA) demonstrating live, real-time <code>INSERT</code>, <code>DELETE</code>, and <code>VIEW</code> database operations connected to MySQL.</li>
  <li><strong>Verified Quality Assurance:</strong> 100% pass rate achieved across automated test suites evaluating connection health, transactions, foreign key cascades, and constraint violations.</li>
</ol>

<h2>7.2 Limitations</h2>
<ul>
  <li>User account management is currently administrated internally; self-service password resets and user registration workflows are managed through the database administration tier.</li>
  <li>The current deployment targets local institutional server environments (<code>localhost:3306</code>) rather than multi-region cloud clusters.</li>
</ul>

<h2>7.3 Future Enhancements</h2>
<ol>
  <li><strong>Role-Based Access Control (RBAC):</strong> Implementing cryptographic password hashing (Argon2id) and JWT session tokens to enforce role-based access separating End-Users, Technicians, and System Administrators.</li>
  <li><strong>Automated SLA Escalation:</strong> Integrating background database triggers or scheduled cron jobs to detect tickets approaching SLA breach deadlines and sending automated email notifications.</li>
  <li><strong>Predictive Maintenance Forecasting:</strong> Training machine learning models on historical maintenance servicing dates and equipment failure descriptions to forecast hardware breakdown probabilities.</li>
  <li><strong>Real-Time Duplex WebSockets:</strong> Replacing client polling with WebSockets to enable instantaneous queue updates across multiple technician workstations simultaneously.</li>
</ol>
"""
pages.append(make_page(p31, "23"))

# PAGE 32 (Report Page 24): References
p32 = """
<h1>REFERENCES</h1>

<div style="font-size: 11pt; line-height: 1.8; margin-left: 25pt; text-indent: -25pt;">
  <p>[1] A. Silberschatz, H. F. Korth, and S. Sudarshan, <em>Database System Concepts</em>, 7th ed. New York, NY, USA: McGraw-Hill Education, 2020.</p>
  <p>[2] R. Elmasri and S. B. Navathe, <em>Fundamentals of Database Systems</em>, 7th ed. Boston, MA, USA: Pearson, 2015.</p>
  <p>[3] E. F. Codd, "A relational model of data for large shared data banks," <em>Communications of the ACM</em>, vol. 13, no. 6, pp. 377–387, Jun. 1970.</p>
  <p>[4] Oracle Corporation, <em>MySQL 8.0 Reference Manual: The InnoDB Storage Engine and Foreign Key Constraints</em>, Oracle Documentation, 2026. [Online]. Available: https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html</p>
  <p>[5] Oracle Corporation, <em>MySQL Connector/Python Developer Guide</em>, Oracle Documentation, 2026. [Online]. Available: https://dev.mysql.com/doc/connector-python/en/</p>
  <p>[6] Pallets Projects, <em>Flask Documentation (Version 3.1.x)</em>, Pallets Community, 2026. [Online]. Available: https://flask.palletsprojects.com/</p>
  <p>[7] R. Cabello and Three.js Authors, <em>Three.js JavaScript 3D Library Documentation</em>, Three.js Community, 2026. [Online]. Available: https://threejs.org/docs/</p>
  <p>[8] Mozilla Developer Network (MDN), <em>Using the Fetch API and HTML5 Dialog Elements</em>, Mozilla Web Docs, 2026. [Online]. Available: https://developer.mozilla.org/</p>
  <p>[9] AXELOS, <em>ITIL Foundation: ITIL 4 Edition</em>. London, UK: TSO (The Stationery Office), 2019.</p>
  <p>[10] C. J. Date, <em>An Introduction to Database Systems</em>, 8th ed. Boston, MA, USA: Addison-Wesley, 2004.</p>
</div>
"""
pages.append(make_page(p32, "24"))

# PAGE 33 (Report Page 25): Appendix - I (Screenshots)
p33 = f"""
<h1>APPENDIX – I</h1>
<h2 style="text-align: center; margin-bottom: 15pt;">PROJECT SCREENSHOTS &amp; VIVA DEMONSTRATION MATERIAL</h2>

<p>
This appendix provides supplementary high-resolution captures of the interactive 3D WebGL schema visualizer, schema inspector drawer, and system architecture views:
</p>

<div style="text-align: center; margin: 8pt auto; border: 1px solid #000000; padding: 2pt;">
  <img src="{inspector_img}" style="max-width: 100%; max-height: 105mm; object-fit: contain;">
</div>
<div class="caption">Figure A.1: 3D Schema Inspector Drawer displaying live table metadata, record counts, and foreign key relations</div>

<p style="margin-top: 15pt;">
The 3D schema inspector allows evaluators to click on any relational entity node within the WebGL canvas to inspect its primary key, attribute data types, row counts, and incoming/outgoing foreign key associations in real time.
</p>
"""
pages.append(make_page(p33, "25"))

# PAGE 34 (Report Page 26): Appendix - II (Repository & Setup)
p34 = """
<h1>APPENDIX – II</h1>
<h2 style="text-align: center; margin-bottom: 15pt;">REPOSITORY DIRECTORY &amp; SETUP GUIDE</h2>

<h2>A.1 Official Submission GitHub Repository</h2>
<p style="font-size: 11.5pt; margin-bottom: 12pt;">
<strong>Public GitHub Repository Link:</strong><br>
<a href="https://github.com/aali2k7/DBMS-Course-Project" style="font-weight: bold; color: #000000;">https://github.com/aali2k7/DBMS-Course-Project</a>
</p>

<h2>A.2 Repository Structure</h2>
<table>
  <thead><tr><th>Folder / File</th><th>Submission Purpose &amp; Academic Content</th></tr></thead>
  <tbody>
    <tr><td><code>README.md</code></td><td>Root faculty navigation, project metadata, and 10-second folder mapping.</td></tr>
    <tr><td><code>Presentation-I/</code></td><td>Problem Description slides in editable PPTX and academic PDF formats.</td></tr>
    <tr><td><code>Presentation-II/</code></td><td>Schema implementation slides (PPTX/PDF), ER diagrams (PNG/PDF), and SQL script.</td></tr>
    <tr><td><code>Presentation-III/</code></td><td>UI demonstration slides (PPTX/PDF), source bundle, and 11 authentic screenshots.</td></tr>
    <tr><td><code>Project-Report/</code></td><td>Official final academic project report in PDF format (Project-Report.pdf).</td></tr>
    <tr><td><code>schema.sql</code></td><td>Complete 14-table 3NF normalized DDL schema.</td></tr>
    <tr><td><code>seed.sql</code></td><td>55-record operational baseline seed dataset.</td></tr>
    <tr><td><code>test_dbms.py</code></td><td>Automated DBMS test suite executing TC01 through TC10.</td></tr>
    <tr><td><code>app.py</code> / <code>main.py</code></td><td>Flask application backend and CLI application entry points.</td></tr>
  </tbody>
</table>
<div class="caption">Table A.1: Repository Structure &amp; File Organization</div>

<h2>A.3 Local Execution Guide</h2>
<pre><code># 1. Clone repository
git clone https://github.com/aali2k7/DBMS-Course-Project.git
cd DBMS-Course-Project

# 2. Configure Python Virtual Environment & Install Dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Initialize MySQL Database & Seed Data
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql

# 4. Launch Application
python3 main.py
# Open web browser to: http://127.0.0.1:5050

# 5. Execute Automated DBMS Test Suite
python3 test_dbms.py</code></pre>
"""
pages.append(make_page(p34, "26"))

# Combine full HTML
full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>IT Helpdesk and Asset Support Management System - Project Report</title>
<style>
@page {{
  size: A4 portrait;
  margin: 0;
}}
* {{
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}}
body {{
  font-family: 'Times New Roman', Times, serif;
  font-size: 12pt;
  line-height: 1.5;
  color: #000000;
  background: #ffffff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}}
.page {{
  width: 210mm;
  height: 297mm;
  padding: 22mm 24mm 22mm 24mm;
  position: relative;
  page-break-after: always;
  background: #ffffff;
  overflow: hidden;
}}
.page-border {{
  position: absolute;
  top: 12mm;
  left: 14mm;
  right: 14mm;
  bottom: 12mm;
  border: 1.5px solid #000000;
  pointer-events: none;
}}
.page-number {{
  position: absolute;
  bottom: 15mm;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 11pt;
  font-family: 'Times New Roman', serif;
}}
h1 {{
  font-size: 16pt;
  font-weight: bold;
  color: #000000;
  margin-top: 4pt;
  margin-bottom: 10pt;
  text-transform: uppercase;
}}
h2 {{
  font-size: 14pt;
  font-weight: bold;
  color: #000000;
  margin-top: 10pt;
  margin-bottom: 5pt;
}}
h3 {{
  font-size: 13pt;
  font-weight: bold;
  color: #000000;
  margin-top: 8pt;
  margin-bottom: 3pt;
}}
p {{
  text-align: justify;
  margin-bottom: 5pt;
  line-height: 1.5;
}}
ul, ol {{
  margin-left: 0.4in;
  margin-bottom: 5pt;
  line-height: 1.5;
}}
li {{
  margin-bottom: 2pt;
}}
table {{
  width: 100%;
  border-collapse: collapse;
  margin: 5pt auto;
  font-size: 10pt;
  font-family: 'Times New Roman', serif;
}}
th, td {{
  border: 1px solid #000000;
  padding: 3.5pt 5pt;
  text-align: left;
  vertical-align: top;
}}
th {{
  background-color: #d5e8f0;
  font-weight: bold;
  color: #000000;
}}
.caption {{
  text-align: center;
  font-style: italic;
  font-size: 10.5pt;
  margin-top: 3pt;
  margin-bottom: 6pt;
}}
.badge-pass {{
  font-weight: bold;
  color: #15803d;
}}
pre, code {{
  font-family: 'Courier New', Consolas, monospace;
}}
pre {{
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  padding: 5pt 7pt;
  font-size: 8.5pt;
  line-height: 1.35;
  margin: 5pt 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}}
</style>
</head>
<body>
{''.join(pages)}
</body>
</html>"""

out_html = "Project-Report/project_report_academic.html"
with open(out_html, "w") as f:
    f.write(full_html)
print(f"Generated {out_html} with {len(pages)} total pages.")

# Render to PDF using Headless Chrome
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
pdf_out = "Project-Report/Project-Report.pdf"
cmd = [
    chrome,
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_out}",
    "file://" + os.path.abspath(out_html)
]
subprocess.run(cmd, check=True)
print(f"Successfully compiled {pdf_out}")

reader = pypdf.PdfReader(pdf_out)
print(f"Final Project-Report.pdf Page Count: {len(reader.pages)}")
