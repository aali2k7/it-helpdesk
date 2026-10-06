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

# -------------------------------------------------------------
# PAGE 1: COVER PAGE
# -------------------------------------------------------------
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

# -------------------------------------------------------------
# PAGE 2: CERTIFICATE (Page i)
# -------------------------------------------------------------
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

# -------------------------------------------------------------
# PAGE 3: DECLARATION (Page ii)
# -------------------------------------------------------------
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

# -------------------------------------------------------------
# PAGE 4: ACKNOWLEDGMENT (Page iii)
# -------------------------------------------------------------
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

# -------------------------------------------------------------
# PAGE 5: ABSTRACT (Page iv)
# -------------------------------------------------------------
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

# -------------------------------------------------------------
# PAGE 6: TABLE OF CONTENTS (Page v)
# -------------------------------------------------------------
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

# -------------------------------------------------------------
# PAGE 7: LIST OF TABLES (Page vi)
# -------------------------------------------------------------
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

# -------------------------------------------------------------
# PAGE 8: LIST OF FIGURES (Page vii)
# -------------------------------------------------------------
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

print("Preliminary pages (1 to 8) generated.")
