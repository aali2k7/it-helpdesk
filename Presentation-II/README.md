# Presentation-II: Schema Implementation, ERD & SQL Queries
## IT Helpdesk & Asset Support Management System

**Course:** Database Management Systems (DBMS)  
**Student:** Md Aali Rahman (Roll No: 25WU0102156)  
**Section:** AIML Panthers  
**Academic Year:** 2026  
**Institution:** Woxsen University, School of Technology  
**Faculty Guide:** Dr. Kiranmayee Adavala  

---

This folder contains the Presentation-II slides, ER diagram, SQL commands and Presentation-II query solution:

- **Presentation Slides (Editable PPTX):** [`Presentation-II.pptx`](Presentation-II.pptx)
- **Presentation Slides (Academic PDF):** [`Presentation-II.pdf`](Presentation-II.pdf)
- **High-Resolution ER Diagram (PNG):** [`ER-Diagram.png`](ER-Diagram.png)
- **Vector ER Diagram (PDF):** [`ER-Diagram.pdf`](ER-Diagram.pdf)
- **Consolidated SQL Script (DDL, DML, Queries):** [`SQL-Commands.sql`](SQL-Commands.sql)
- **Presentation-II Query Solution:** [`Presentation-II-Query-Solution.sql`](Presentation-II-Query-Solution.sql)

### Deliverables Summary:
1. **Relational Schema:** 14 normalized tables in 3rd Normal Form (3NF) deployed on MySQL 8.0+ / 9.x.
2. **Referential Integrity:** 14 Foreign Keys configured with explicit `ON DELETE RESTRICT`, `CASCADE`, and `SET NULL` semantics.
3. **Domain Constraints:** Verified `CHECK` constraints on priority levels (1-5), status enums, warranty validity, and non-negative maintenance costs.
4. **Seed Dataset:** 55 relational records (`seed.sql`) establishing verified referential links across all 14 tables.
5. **Analytical Queries:** Multi-table relational joins, technician workload metrics, and departmental maintenance cost aggregation.
