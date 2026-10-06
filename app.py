#!/usr/bin/env python3
"""
IT Helpdesk & Asset Support Management System
Flask Backend Application & REST API
Academic DBMS Project - Woxsen University (Md Aali Rahman - 25WU0102156)
"""

import os
import re
from datetime import date, datetime
from decimal import Decimal
from flask import Flask, jsonify, request, render_template, send_from_directory
from mysql.connector import Error, IntegrityError

from db import get_connection, check_db_status, get_db_config

app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["JSON_SORT_KEYS"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0


# -----------------------------------------------------------------------------
# JSON Serialization Helper for Dates, Decimals, etc.
# -----------------------------------------------------------------------------
def serialize_row(row):
    """Convert MySQL row dictionary to JSON-serializable types."""
    if not row:
        return row
    clean = {}
    for k, v in row.items():
        if isinstance(v, (datetime, date)):
            clean[k] = v.isoformat()
        elif isinstance(v, Decimal):
            clean[k] = float(v)
        elif isinstance(v, bytes):
            clean[k] = v.decode("utf-8", errors="replace")
        else:
            clean[k] = v
    return clean


def serialize_rows(rows):
    return [serialize_row(r) for r in rows] if rows else []


# -----------------------------------------------------------------------------
# HTML Page Routes
# -----------------------------------------------------------------------------
@app.route("/")
def index():
    """Render the primary DBMS Helpdesk & Asset Management Dashboard."""
    return render_template("index.html")


@app.route("/er-diagram")
def er_diagram():
    """Serve the interactive Entity-Relationship Diagram."""
    return send_from_directory(".", "er_diagram.html")


@app.route("/presentation")
def presentation():
    """Serve the interactive HTML5 Presentation Slide Deck."""
    return send_from_directory(".", "presentation.html")


# -----------------------------------------------------------------------------
# API: Database Connection & System Health
# -----------------------------------------------------------------------------
@app.route("/api/status", methods=["GET"])
def api_status():
    """Return live MySQL database connection status."""
    status = check_db_status()
    code = 200 if status.get("connected") else 503
    return jsonify(status), code


# -----------------------------------------------------------------------------
# API: Dashboard Analytics & Metric Summaries
# -----------------------------------------------------------------------------
@app.route("/api/stats", methods=["GET"])
def api_stats():
    """Return live dashboard aggregate metrics from MySQL."""
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err, "connected": False}), 503

    try:
        cursor = conn.cursor(dictionary=True)

        # 1. Total Tickets
        cursor.execute("SELECT COUNT(*) AS total FROM tickets")
        total_tickets = cursor.fetchone()["total"]

        # 2. Open / In Progress Tickets
        cursor.execute("SELECT COUNT(*) AS open_count FROM tickets WHERE status IN ('Open', 'In Progress', 'Pending')")
        open_tickets = cursor.fetchone()["open_count"]

        # 3. Resolved / Closed Tickets
        cursor.execute("SELECT COUNT(*) AS resolved_count FROM tickets WHERE status IN ('Resolved', 'Closed')")
        resolved_tickets = cursor.fetchone()["resolved_count"]

        # 4. Total Assets
        cursor.execute("SELECT COUNT(*) AS total FROM assets")
        total_assets = cursor.fetchone()["total"]

        # 5. Total Users
        cursor.execute("SELECT COUNT(*) AS total FROM users")
        total_users = cursor.fetchone()["total"]

        # 6. Total Support Staff
        cursor.execute("SELECT COUNT(*) AS total FROM support_staff")
        total_staff = cursor.fetchone()["total"]

        # 7. Total Departments
        cursor.execute("SELECT COUNT(*) AS total FROM departments")
        total_depts = cursor.fetchone()["total"]

        # 8. Total Maintenance Expenditure
        cursor.execute("SELECT COALESCE(SUM(cost), 0.00) AS total_maint FROM maintenance")
        maint_cost = float(cursor.fetchone()["total_maint"])

        # 9. Recent 5 Tickets
        cursor.execute("""
            SELECT 
                t.ticket_id, t.ticket_no, t.title, t.status, 
                DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i') AS created_at,
                u.name AS user_name, c.name AS category_name, p.name AS priority_name, p.level AS priority_level
            FROM tickets t
            JOIN users u ON t.user_id = u.user_id
            JOIN categories c ON t.category_id = c.category_id
            JOIN priorities p ON t.priority_id = p.priority_id
            ORDER BY t.ticket_id DESC
            LIMIT 5
        """)
        recent_tickets = serialize_rows(cursor.fetchall())

        cursor.close()
        conn.close()

        return jsonify({
            "connected": True,
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "resolved_tickets": resolved_tickets,
            "total_assets": total_assets,
            "total_users": total_users,
            "total_staff": total_staff,
            "total_departments": total_depts,
            "total_maintenance_cost": maint_cost,
            "recent_tickets": recent_tickets
        })
    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return jsonify({"error": str(e), "connected": False}), 500


# -----------------------------------------------------------------------------
# API: 3D Database Graph & Architecture Metadata (Derived from information_schema)
# -----------------------------------------------------------------------------
@app.route("/api/database/graph", methods=["GET"])
def api_database_graph():
    """
    Dynamically introspect MySQL information_schema and return real-time schema topology,
    table definitions, columns, primary keys, foreign-key relationships, and exact record counts.
    """
    import time
    start_time = time.perf_counter()
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err, "connected": False}), 503

    try:
        cursor = conn.cursor(dictionary=True)
        config = get_db_config()
        db_name = config["database"]

        # 1. Fetch tables list
        cursor.execute("SHOW TABLES")
        tables_raw = [list(r.values())[0] for r in cursor.fetchall()]

        # 2. Fetch all column definitions
        cursor.execute("""
            SELECT TABLE_NAME, COLUMN_NAME, COLUMN_KEY, DATA_TYPE, IS_NULLABLE
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = %s
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        """, (db_name,))
        all_cols = cursor.fetchall()

        # 3. Fetch foreign key constraints
        cursor.execute("""
            SELECT 
                TABLE_NAME AS source,
                COLUMN_NAME AS foreign_key,
                REFERENCED_TABLE_NAME AS target,
                REFERENCED_COLUMN_NAME AS target_pk,
                CONSTRAINT_NAME AS constraint_name
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = %s AND REFERENCED_TABLE_NAME IS NOT NULL
        """, (db_name,))
        all_fks = cursor.fetchall()

        # 4. Domain classification and color definitions for architectural visualization
        domain_styles = {
            "tickets": {"domain": "Operations", "color": "#d97706", "importance": 10},
            "incidents": {"domain": "Operations", "color": "#dc2626", "importance": 8},
            "service_requests": {"domain": "Operations", "color": "#2563eb", "importance": 8},
            "resolutions": {"domain": "Operations", "color": "#10b981", "importance": 7},
            "assignments": {"domain": "Operations", "color": "#f59e0b", "importance": 7},
            "status_histories": {"domain": "Audit", "color": "#8b5cf6", "importance": 9},
            "assets": {"domain": "Inventory", "color": "#475569", "importance": 9},
            "warranties": {"domain": "Inventory", "color": "#0284c7", "importance": 6},
            "maintenance": {"domain": "Inventory", "color": "#c2410c", "importance": 7},
            "users": {"domain": "Organization", "color": "#94a3b8", "importance": 9},
            "departments": {"domain": "Organization", "color": "#059669", "importance": 7},
            "support_staff": {"domain": "Organization", "color": "#6366f1", "importance": 8},
            "categories": {"domain": "Classification", "color": "#64748b", "importance": 6},
            "priorities": {"domain": "Classification", "color": "#ea580c", "importance": 6},
        }

        # 5. Build nodes dictionary and compute exact row counts
        tables_dict = {}
        total_records = 0

        for t in tables_raw:
            cursor.execute(f"SELECT COUNT(*) AS cnt FROM `{t}`")
            cnt = cursor.fetchone()["cnt"]
            total_records += cnt

            meta = domain_styles.get(t, {"domain": "System", "color": "#64748b", "importance": 5})

            tables_dict[t] = {
                "name": t,
                "record_count": cnt,
                "primary_key": None,
                "columns": [],
                "foreign_keys": [],
                "domain": meta["domain"],
                "color": meta["color"],
                "importance": meta["importance"],
                "inbound_count": 0,
                "outbound_count": 0
            }

        # Populate columns and PKs
        for c in all_cols:
            t = c["TABLE_NAME"]
            if t in tables_dict:
                is_pk = (c["COLUMN_KEY"] == "PRI")
                if is_pk and not tables_dict[t]["primary_key"]:
                    tables_dict[t]["primary_key"] = c["COLUMN_NAME"]
                tables_dict[t]["columns"].append({
                    "name": c["COLUMN_NAME"],
                    "type": c["DATA_TYPE"],
                    "is_pk": is_pk,
                    "is_nullable": c["IS_NULLABLE"] == "YES"
                })

        # Populate relationships and count in/out degrees
        relationships = []
        for fk in all_fks:
            src = fk["source"]
            tgt = fk["target"]
            if src in tables_dict and tgt in tables_dict:
                tables_dict[src]["foreign_keys"].append(fk)
                tables_dict[src]["outbound_count"] += 1
                tables_dict[tgt]["inbound_count"] += 1
                relationships.append({
                    "source": src,
                    "target": tgt,
                    "foreign_key": fk["foreign_key"],
                    "target_pk": fk["target_pk"],
                    "constraint_name": fk["constraint_name"]
                })

        cursor.close()
        conn.close()

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return jsonify({
            "database": db_name,
            "connected": True,
            "total_tables": len(tables_dict),
            "total_records": total_records,
            "total_relationships": len(relationships),
            "latency_ms": latency_ms,
            "tables": list(tables_dict.values()),
            "relationships": relationships
        })
    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return jsonify({"error": str(e), "connected": False}), 500



# -----------------------------------------------------------------------------
# API: Tickets (VIEW, INSERT, DELETE, DETAILS, STATUS UPDATE)
# -----------------------------------------------------------------------------
@app.route("/api/tickets", methods=["GET"])
def get_tickets():
    """
    Retrieve all tickets with relational JOINs.
    Supports query parameters: search, status, category_id, priority_id, type.
    """
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503

    search = request.args.get("search", "").strip()
    status_filter = request.args.get("status", "").strip()
    category_filter = request.args.get("category_id", "").strip()
    priority_filter = request.args.get("priority_id", "").strip()
    type_filter = request.args.get("type", "").strip()

    try:
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT 
                t.ticket_id,
                t.ticket_no,
                t.title,
                t.description,
                t.status,
                DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i') AS created_at_fmt,
                t.created_at,
                u.user_id,
                u.name AS user_name,
                u.email AS user_email,
                d.name AS department_name,
                c.category_id,
                c.name AS category_name,
                p.priority_id,
                p.name AS priority_name,
                p.level AS priority_level,
                i.incident_type,
                sr.request_type,
                CASE 
                    WHEN i.ticket_id IS NOT NULL THEN 'Incident'
                    WHEN sr.ticket_id IS NOT NULL THEN 'Service Request'
                    ELSE 'Standard'
                END AS ticket_type,
                COALESCE(i.incident_type, sr.request_type, '-') AS subtype_detail,
                (SELECT s.name 
                 FROM assignments a 
                 JOIN support_staff s ON a.staff_id = s.staff_id 
                 WHERE a.ticket_id = t.ticket_id 
                 ORDER BY a.assignment_id DESC LIMIT 1) AS assigned_staff
            FROM tickets t
            JOIN users u ON t.user_id = u.user_id
            JOIN departments d ON u.department_id = d.department_id
            JOIN categories c ON t.category_id = c.category_id
            JOIN priorities p ON t.priority_id = p.priority_id
            LEFT JOIN incidents i ON t.ticket_id = i.ticket_id
            LEFT JOIN service_requests sr ON t.ticket_id = sr.ticket_id
            WHERE 1=1
        """
        params = []

        if search:
            query += """ AND (
                t.ticket_no LIKE %s OR 
                t.title LIKE %s OR 
                u.name LIKE %s OR 
                c.name LIKE %s
            )"""
            pattern = f"%{search}%"
            params.extend([pattern, pattern, pattern, pattern])

        if status_filter and status_filter.lower() != "all":
            query += " AND t.status = %s"
            params.append(status_filter)

        if category_filter and category_filter.isdigit():
            query += " AND t.category_id = %s"
            params.append(int(category_filter))

        if priority_filter and priority_filter.isdigit():
            query += " AND t.priority_id = %s"
            params.append(int(priority_filter))

        if type_filter == "Incident":
            query += " AND i.ticket_id IS NOT NULL"
        elif type_filter == "Service Request":
            query += " AND sr.ticket_id IS NOT NULL"

        query += " ORDER BY t.ticket_id DESC"

        cursor.execute(query, tuple(params))
        rows = serialize_rows(cursor.fetchall())
        cursor.close()
        conn.close()

        return jsonify({"tickets": rows, "count": len(rows)})
    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return jsonify({"error": f"Failed to retrieve tickets: {str(e)}"}), 500


@app.route("/api/tickets/<int:ticket_id>", methods=["GET"])
def get_ticket_details(ticket_id):
    """Retrieve comprehensive ticket details, assignments, status histories, and resolution."""
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503

    try:
        cursor = conn.cursor(dictionary=True)

        # 1. Base Ticket Information
        cursor.execute("""
            SELECT 
                t.ticket_id,
                t.ticket_no,
                t.title,
                t.description,
                t.status,
                DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') AS created_at_fmt,
                u.user_id,
                u.name AS user_name,
                u.email AS user_email,
                d.name AS department_name,
                d.location AS department_location,
                c.category_id,
                c.name AS category_name,
                c.description AS category_description,
                p.priority_id,
                p.name AS priority_name,
                p.level AS priority_level,
                i.incident_type,
                sr.request_type,
                CASE 
                    WHEN i.ticket_id IS NOT NULL THEN 'Incident'
                    WHEN sr.ticket_id IS NOT NULL THEN 'Service Request'
                    ELSE 'Standard Ticket'
                END AS ticket_type,
                COALESCE(i.incident_type, sr.request_type, 'None') AS subtype_detail
            FROM tickets t
            JOIN users u ON t.user_id = u.user_id
            JOIN departments d ON u.department_id = d.department_id
            JOIN categories c ON t.category_id = c.category_id
            JOIN priorities p ON t.priority_id = p.priority_id
            LEFT JOIN incidents i ON t.ticket_id = i.ticket_id
            LEFT JOIN service_requests sr ON t.ticket_id = sr.ticket_id
            WHERE t.ticket_id = %s
        """, (ticket_id,))
        ticket = cursor.fetchone()

        if not ticket:
            cursor.close()
            conn.close()
            return jsonify({"error": f"Ticket ID {ticket_id} not found"}), 404

        # 2. Assigned Support Staff
        cursor.execute("""
            SELECT 
                a.assignment_id,
                s.staff_id,
                s.name AS staff_name,
                s.email AS staff_email,
                s.specialization,
                DATE_FORMAT(a.assigned_at, '%Y-%m-%d %H:%i:%s') AS assigned_at
            FROM assignments a
            JOIN support_staff s ON a.staff_id = s.staff_id
            WHERE a.ticket_id = %s
            ORDER BY a.assignment_id ASC
        """, (ticket_id,))
        assignments = serialize_rows(cursor.fetchall())

        # 3. Status History Audit Trail
        cursor.execute("""
            SELECT 
                history_id,
                COALESCE(old_status, 'Initial Creation (None)') AS old_status,
                new_status,
                DATE_FORMAT(changed_at, '%Y-%m-%d %H:%i:%s') AS changed_at
            FROM status_histories
            WHERE ticket_id = %s
            ORDER BY history_id ASC
        """, (ticket_id,))
        histories = serialize_rows(cursor.fetchall())

        # 4. Resolution Details (if present)
        cursor.execute("""
            SELECT 
                resolution_id,
                description,
                DATE_FORMAT(resolved_at, '%Y-%m-%d %H:%i:%s') AS resolved_at
            FROM resolutions
            WHERE ticket_id = %s
        """, (ticket_id,))
        resolution = cursor.fetchone()

        cursor.close()
        conn.close()

        ticket = serialize_row(ticket)
        if resolution:
            resolution = serialize_row(resolution)

        return jsonify({
            "ticket": ticket,
            "assignments": assignments,
            "status_histories": histories,
            "resolution": resolution
        })
    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return jsonify({"error": f"Error fetching ticket details: {str(e)}"}), 500


@app.route("/api/tickets", methods=["POST"])
def create_ticket():
    """
    INSERT OPERATION: Create a new helpdesk ticket in MySQL.
    - Validates User, Category, Priority foreign keys.
    - Generates sequential ticket_no (e.g. TKT-006).
    - Inserts ticket into `tickets`.
    - Inserts into subtype table (`incidents` or `service_requests`).
    - Inserts initial audit record into `status_histories`.
    - Manages atomic transaction commit / rollback.
    """
    data = request.get_json() or {}

    title = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()
    user_id = data.get("user_id")
    category_id = data.get("category_id")
    priority_id = data.get("priority_id")
    ticket_type = str(data.get("ticket_type", "Incident")).strip()
    subtype_detail = str(data.get("subtype_detail", "")).strip()

    # Field validations
    if not title:
        return jsonify({"error": "Ticket title is required."}), 400
    if len(title) > 200:
        return jsonify({"error": "Title exceeds 200 characters limit."}), 400
    if not description:
        return jsonify({"error": "Ticket description is required."}), 400

    try:
        user_id = int(user_id)
        category_id = int(category_id)
        priority_id = int(priority_id)
    except (TypeError, ValueError):
        return jsonify({"error": "User, Category, and Priority must be valid IDs."}), 400

    if ticket_type not in ("Incident", "Service Request"):
        return jsonify({"error": "Ticket type must be 'Incident' or 'Service Request'."}), 400

    if not subtype_detail:
        subtype_detail = "Hardware Malfunction" if ticket_type == "Incident" else "Access Provisioning"

    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503

    try:
        cursor = conn.cursor(dictionary=True)

        # 1. Foreign Key Validations
        cursor.execute("SELECT user_id, name FROM users WHERE user_id = %s", (user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            cursor.close()
            conn.close()
            return jsonify({"error": f"Selected user (ID: {user_id}) does not exist in MySQL."}), 400

        cursor.execute("SELECT category_id, name FROM categories WHERE category_id = %s", (category_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": f"Selected category (ID: {category_id}) does not exist."}), 400

        cursor.execute("SELECT priority_id, name FROM priorities WHERE priority_id = %s", (priority_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": f"Selected priority (ID: {priority_id}) does not exist."}), 400

        # 2. Generate Next Ticket Number
        cursor.execute("SELECT MAX(ticket_id) AS max_id FROM tickets")
        row = cursor.fetchone()
        next_id = (row["max_id"] or 0) + 1
        ticket_no = f"TKT-{next_id:03d}"

        # Ensure uniqueness of ticket_no in case of previous manual entries
        cursor.execute("SELECT ticket_id FROM tickets WHERE ticket_no = %s", (ticket_no,))
        while cursor.fetchone():
            next_id += 1
            ticket_no = f"TKT-{next_id:03d}"
            cursor.execute("SELECT ticket_id FROM tickets WHERE ticket_no = %s", (ticket_no,))

        # 3. Insert into tickets
        insert_sql = """
            INSERT INTO tickets (ticket_no, user_id, category_id, priority_id, title, description, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, 'Open', NOW())
        """
        cursor.execute(insert_sql, (ticket_no, user_id, category_id, priority_id, title, description))
        new_ticket_id = cursor.lastrowid

        # 4. Insert into subtype table
        if ticket_type == "Incident":
            cursor.execute(
                "INSERT INTO incidents (ticket_id, incident_type) VALUES (%s, %s)",
                (new_ticket_id, subtype_detail)
            )
        else:
            cursor.execute(
                "INSERT INTO service_requests (ticket_id, request_type) VALUES (%s, %s)",
                (new_ticket_id, subtype_detail)
            )

        # 5. Insert initial status history audit trail
        cursor.execute(
            "INSERT INTO status_histories (ticket_id, old_status, new_status, changed_at) VALUES (%s, %s, %s, NOW())",
            (new_ticket_id, None, "Open")
        )

        # Commit Transaction
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"Ticket {ticket_no} created successfully in MySQL database.",
            "ticket_id": new_ticket_id,
            "ticket_no": ticket_no,
            "status": "Open",
            "type": ticket_type,
            "subtype_detail": subtype_detail
        }), 201

    except IntegrityError as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Database integrity violation: {e.msg}"}), 400
    except Exception as e:
        if conn and conn.is_connected():
            conn.rollback()
            conn.close()
        return jsonify({"error": f"Database error creating ticket: {str(e)}"}), 500


@app.route("/api/tickets/<int:ticket_id>", methods=["DELETE"])
def delete_ticket(ticket_id):
    """
    DELETE OPERATION: Delete a ticket from MySQL.
    - Validates ticket exists.
    - Removes ticket record.
    - ON DELETE CASCADE cleans up incidents, service_requests, assignments, status_histories, and resolutions.
    - Atomic transaction commit.
    """
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503

    try:
        cursor = conn.cursor(dictionary=True)

        # Check ticket exists
        cursor.execute("SELECT ticket_id, ticket_no, title FROM tickets WHERE ticket_id = %s", (ticket_id,))
        ticket = cursor.fetchone()
        if not ticket:
            cursor.close()
            conn.close()
            return jsonify({"error": f"Ticket ID {ticket_id} does not exist in MySQL."}), 404

        ticket_no = ticket["ticket_no"]

        # Execute DELETE (Cascade handles related records)
        cursor.execute("DELETE FROM tickets WHERE ticket_id = %s", (ticket_id,))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"Ticket {ticket_no} deleted successfully from MySQL.",
            "deleted_ticket_id": ticket_id,
            "deleted_ticket_no": ticket_no
        })

    except IntegrityError as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Unable to delete this ticket because dependent records exist: {e.msg}"}), 409
    except Exception as e:
        if conn and conn.is_connected():
            conn.rollback()
            conn.close()
        return jsonify({"error": f"Database error during deletion: {str(e)}"}), 500


@app.route("/api/tickets/<int:ticket_id>/status", methods=["PUT"])
def update_ticket_status(ticket_id):
    """Update ticket status and record audit log in status_histories."""
    data = request.get_json() or {}
    new_status = str(data.get("status", "")).strip()
    resolution_desc = str(data.get("resolution_description", "")).strip()

    valid_statuses = ("Open", "In Progress", "Pending", "Resolved", "Closed", "Cancelled")
    if new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400

    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT ticket_id, ticket_no, status FROM tickets WHERE ticket_id = %s", (ticket_id,))
        ticket = cursor.fetchone()
        if not ticket:
            cursor.close()
            conn.close()
            return jsonify({"error": f"Ticket ID {ticket_id} not found."}), 404

        old_status = ticket["status"]
        if old_status == new_status and not resolution_desc:
            cursor.close()
            conn.close()
            return jsonify({"message": f"Ticket is already in '{new_status}' status.", "status": new_status})

        # Update tickets table
        cursor.execute("UPDATE tickets SET status = %s WHERE ticket_id = %s", (new_status, ticket_id))

        # Insert audit trail into status_histories
        cursor.execute(
            "INSERT INTO status_histories (ticket_id, old_status, new_status, changed_at) VALUES (%s, %s, %s, NOW())",
            (ticket_id, old_status, new_status)
        )

        # If marking resolved and description provided, record resolution
        if new_status == "Resolved" and resolution_desc:
            cursor.execute("""
                INSERT INTO resolutions (ticket_id, description, resolved_at) 
                VALUES (%s, %s, NOW())
                ON DUPLICATE KEY UPDATE description = VALUES(description), resolved_at = NOW()
            """, (ticket_id, resolution_desc))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"Ticket {ticket['ticket_no']} status updated: '{old_status}' → '{new_status}'",
            "old_status": old_status,
            "new_status": new_status
        })

    except Exception as e:
        if conn and conn.is_connected():
            conn.rollback()
            conn.close()
        return jsonify({"error": f"Failed to update ticket status: {str(e)}"}), 500


@app.route("/api/tickets/<int:ticket_id>/assign", methods=["POST"])
def assign_ticket(ticket_id):
    """Assign ticket to a support staff member and transition status to 'In Progress'."""
    data = request.get_json() or {}
    staff_id = data.get("staff_id")

    try:
        staff_id = int(staff_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Support staff ID must be a valid integer."}), 400

    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT ticket_id, ticket_no, status FROM tickets WHERE ticket_id = %s", (ticket_id,))
        ticket = cursor.fetchone()
        if not ticket:
            cursor.close()
            conn.close()
            return jsonify({"error": f"Ticket ID {ticket_id} not found."}), 404

        cursor.execute("SELECT staff_id, name, specialization FROM support_staff WHERE staff_id = %s", (staff_id,))
        staff = cursor.fetchone()
        if not staff:
            cursor.close()
            conn.close()
            return jsonify({"error": f"Staff ID {staff_id} not found."}), 404

        # Insert into assignments
        cursor.execute(
            "INSERT INTO assignments (ticket_id, staff_id, assigned_at) VALUES (%s, %s, NOW())",
            (ticket_id, staff_id)
        )

        old_status = ticket["status"]
        new_status = "In Progress"
        if old_status != new_status:
            cursor.execute("UPDATE tickets SET status = %s WHERE ticket_id = %s", (new_status, ticket_id))
            cursor.execute(
                "INSERT INTO status_histories (ticket_id, old_status, new_status, changed_at) VALUES (%s, %s, %s, NOW())",
                (ticket_id, old_status, new_status)
            )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"Ticket {ticket['ticket_no']} successfully assigned to {staff['name']}.",
            "staff_name": staff["name"],
            "status": new_status
        })

    except Exception as e:
        if conn and conn.is_connected():
            conn.rollback()
            conn.close()
        return jsonify({"error": f"Failed to assign ticket: {str(e)}"}), 500


# -----------------------------------------------------------------------------
# API: Users (VIEW, INSERT, DELETE)
# -----------------------------------------------------------------------------
@app.route("/api/users", methods=["GET"])
def get_users():
    """Retrieve all users with department names and associated ticket/asset counts."""
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503

    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT 
                u.user_id,
                u.name,
                u.email,
                u.department_id,
                d.name AS department_name,
                d.location AS department_location,
                COUNT(DISTINCT t.ticket_id) AS total_tickets,
                COUNT(DISTINCT a.asset_id) AS total_assets
            FROM users u
            JOIN departments d ON u.department_id = d.department_id
            LEFT JOIN tickets t ON u.user_id = t.user_id
            LEFT JOIN assets a ON u.user_id = a.user_id
            GROUP BY u.user_id, u.name, u.email, u.department_id, d.name, d.location
            ORDER BY u.user_id ASC
        """
        cursor.execute(query)
        rows = serialize_rows(cursor.fetchall())
        cursor.close()
        conn.close()
        return jsonify({"users": rows, "count": len(rows)})
    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return jsonify({"error": str(e)}), 500


@app.route("/api/users", methods=["POST"])
def create_user():
    """INSERT OPERATION: Register a new user in MySQL."""
    data = request.get_json() or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    dept_id = data.get("department_id")

    if not name:
        return jsonify({"error": "User name is required."}), 400
    if not email or "@" not in email or "." not in email:
        return jsonify({"error": "Please provide a valid email address."}), 400

    try:
        dept_id = int(dept_id)
    except (TypeError, ValueError):
        return jsonify({"error": "A valid Department ID is required."}), 400

    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503

    try:
        cursor = conn.cursor(dictionary=True)

        # Check Department Exists
        cursor.execute("SELECT department_id FROM departments WHERE department_id = %s", (dept_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": f"Department ID {dept_id} does not exist."}), 400

        # Check Email Uniqueness
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": f"Email '{email}' is already registered to another user."}), 409

        cursor.execute(
            "INSERT INTO users (name, email, department_id) VALUES (%s, %s, %s)",
            (name, email, dept_id)
        )
        new_id = cursor.lastrowid
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"User '{name}' registered successfully with ID {new_id}.",
            "user_id": new_id,
            "name": name,
            "email": email
        }), 201

    except IntegrityError as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Constraint violation: {e.msg}"}), 400
    except Exception as e:
        if conn and conn.is_connected():
            conn.rollback()
            conn.close()
        return jsonify({"error": f"Failed to create user: {str(e)}"}), 500


@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    """
    DELETE OPERATION: Delete a user from MySQL.
    Catches Foreign Key RESTRICT constraint if user has active tickets.
    """
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT user_id, name FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            cursor.close()
            conn.close()
            return jsonify({"error": f"User ID {user_id} not found."}), 404

        # Attempt DELETE
        cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"User '{user['name']}' (ID: {user_id}) deleted successfully from MySQL.",
            "deleted_user_id": user_id
        })

    except IntegrityError as e:
        conn.rollback()
        conn.close()
        # Friendly foreign key error message as explicitly required in Step 5.C
        return jsonify({
            "error": "Unable to delete this user because related tickets or assets exist. Please delete or reassign those records first."
        }), 409
    except Exception as e:
        if conn and conn.is_connected():
            conn.rollback()
            conn.close()
        return jsonify({"error": f"Failed to delete user: {str(e)}"}), 500


# -----------------------------------------------------------------------------
# API: Assets (VIEW, INSERT, DELETE)
# -----------------------------------------------------------------------------
@app.route("/api/assets", methods=["GET"])
def get_assets():
    """Retrieve all hardware assets joined with users, categories, and warranties."""
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503

    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT 
                a.asset_id,
                a.asset_tag,
                a.name AS asset_name,
                a.serial_no,
                a.user_id,
                COALESCE(u.name, 'Unassigned / In Stock') AS assigned_user,
                u.email AS user_email,
                d.name AS department_name,
                c.category_id,
                c.name AS category_name,
                w.warranty_id,
                w.provider AS warranty_provider,
                DATE_FORMAT(w.end_date, '%Y-%m-%d') AS warranty_end_date,
                CASE 
                    WHEN w.end_date >= CURDATE() THEN 'Active'
                    WHEN w.end_date < CURDATE() THEN 'Expired'
                    ELSE 'No Warranty'
                END AS warranty_status,
                (SELECT COUNT(*) FROM maintenance m WHERE m.asset_id = a.asset_id) AS maintenance_count
            FROM assets a
            LEFT JOIN users u ON a.user_id = u.user_id
            LEFT JOIN departments d ON u.department_id = d.department_id
            JOIN categories c ON a.category_id = c.category_id
            LEFT JOIN warranties w ON a.warranty_id = w.warranty_id
            ORDER BY a.asset_id ASC
        """
        cursor.execute(query)
        rows = serialize_rows(cursor.fetchall())
        cursor.close()
        conn.close()
        return jsonify({"assets": rows, "count": len(rows)})
    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return jsonify({"error": str(e)}), 500


@app.route("/api/assets", methods=["POST"])
def register_asset():
    """INSERT OPERATION: Register a new hardware asset in MySQL."""
    data = request.get_json() or {}
    asset_tag = str(data.get("asset_tag", "")).strip().upper()
    name = str(data.get("name", "")).strip()
    serial_no = str(data.get("serial_no", "")).strip()
    category_id = data.get("category_id")
    user_id = data.get("user_id")
    warranty_id = data.get("warranty_id")

    if not asset_tag:
        return jsonify({"error": "Asset tag is required (e.g. AST-DELL-006)."}), 400
    if not name:
        return jsonify({"error": "Asset name/model is required."}), 400
    if not serial_no:
        return jsonify({"error": "Serial number is required."}), 400

    try:
        category_id = int(category_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Valid Category ID is required."}), 400

    user_id = int(user_id) if user_id and str(user_id).isdigit() and int(user_id) > 0 else None
    warranty_id = int(warranty_id) if warranty_id and str(warranty_id).isdigit() and int(warranty_id) > 0 else None

    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503

    try:
        cursor = conn.cursor(dictionary=True)

        # Check Unique Tag
        cursor.execute("SELECT asset_id FROM assets WHERE asset_tag = %s", (asset_tag,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": f"Asset Tag '{asset_tag}' already exists in MySQL."}), 409

        # Check Unique Serial
        cursor.execute("SELECT asset_id FROM assets WHERE serial_no = %s", (serial_no,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": f"Serial number '{serial_no}' already exists in MySQL."}), 409

        cursor.execute("""
            INSERT INTO assets (asset_tag, name, serial_no, user_id, category_id, warranty_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (asset_tag, name, serial_no, user_id, category_id, warranty_id))

        new_asset_id = cursor.lastrowid
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"Asset '{name}' ({asset_tag}) registered successfully in MySQL.",
            "asset_id": new_asset_id,
            "asset_tag": asset_tag
        }), 201

    except IntegrityError as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Constraint error: {e.msg}"}), 400
    except Exception as e:
        if conn and conn.is_connected():
            conn.rollback()
            conn.close()
        return jsonify({"error": f"Failed to register asset: {str(e)}"}), 500


@app.route("/api/assets/<int:asset_id>", methods=["DELETE"])
def delete_asset(asset_id):
    """
    DELETE OPERATION: Delete an asset from MySQL.
    Cascade deletes linked maintenance logs; foreign keys handle integrity.
    """
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT asset_id, asset_tag, name FROM assets WHERE asset_id = %s", (asset_id,))
        asset = cursor.fetchone()
        if not asset:
            cursor.close()
            conn.close()
            return jsonify({"error": f"Asset ID {asset_id} not found."}), 404

        cursor.execute("DELETE FROM assets WHERE asset_id = %s", (asset_id,))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"Asset {asset['asset_tag']} ('{asset['name']}') deleted successfully from MySQL.",
            "deleted_asset_id": asset_id
        })

    except IntegrityError as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Unable to delete this asset: {e.msg}"}), 409
    except Exception as e:
        if conn and conn.is_connected():
            conn.rollback()
            conn.close()
        return jsonify({"error": f"Failed to delete asset: {str(e)}"}), 500


# -----------------------------------------------------------------------------
# API: Lookups (Categories, Priorities, Support Staff, Departments, Warranties)
# -----------------------------------------------------------------------------
@app.route("/api/categories", methods=["GET"])
def get_categories():
    """Retrieve all categories."""
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT category_id, name, description FROM categories ORDER BY category_id ASC")
        rows = serialize_rows(cursor.fetchall())
        cursor.close()
        conn.close()
        return jsonify({"categories": rows})
    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return jsonify({"error": str(e)}), 500


@app.route("/api/priorities", methods=["GET"])
def get_priorities():
    """Retrieve all priority levels."""
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT priority_id, name, level FROM priorities ORDER BY level ASC")
        rows = serialize_rows(cursor.fetchall())
        cursor.close()
        conn.close()
        return jsonify({"priorities": rows})
    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return jsonify({"error": str(e)}), 500


@app.route("/api/support-staff", methods=["GET"])
def get_support_staff():
    """Retrieve all support staff technicians and their active assigned workloads."""
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                s.staff_id,
                s.name,
                s.email,
                s.specialization,
                COUNT(a.assignment_id) AS total_assignments,
                SUM(CASE WHEN t.status IN ('Open', 'In Progress', 'Pending') THEN 1 ELSE 0 END) AS active_tickets
            FROM support_staff s
            LEFT JOIN assignments a ON s.staff_id = a.staff_id
            LEFT JOIN tickets t ON a.ticket_id = t.ticket_id
            GROUP BY s.staff_id, s.name, s.email, s.specialization
            ORDER BY s.staff_id ASC
        """)
        rows = serialize_rows(cursor.fetchall())
        cursor.close()
        conn.close()
        return jsonify({"support_staff": rows})
    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return jsonify({"error": str(e)}), 500


@app.route("/api/departments", methods=["GET"])
def get_departments():
    """Retrieve all departments with user and asset distributions."""
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                d.department_id,
                d.name,
                d.location,
                COUNT(DISTINCT u.user_id) AS total_users,
                COUNT(DISTINCT a.asset_id) AS total_assets
            FROM departments d
            LEFT JOIN users u ON d.department_id = u.department_id
            LEFT JOIN assets a ON u.user_id = a.user_id
            GROUP BY d.department_id, d.name, d.location
            ORDER BY d.department_id ASC
        """)
        rows = serialize_rows(cursor.fetchall())
        cursor.close()
        conn.close()
        return jsonify({"departments": rows})
    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return jsonify({"error": str(e)}), 500


@app.route("/api/warranties", methods=["GET"])
def get_warranties():
    """Retrieve warranties for hardware asset assignment."""
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                warranty_id,
                provider,
                DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
                DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
                CASE 
                    WHEN end_date >= CURDATE() THEN 'Active'
                    ELSE 'Expired'
                END AS status
            FROM warranties
            ORDER BY warranty_id ASC
        """)
        rows = serialize_rows(cursor.fetchall())
        cursor.close()
        conn.close()
        return jsonify({"warranties": rows})
    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return jsonify({"error": str(e)}), 500


@app.route("/api/maintenance", methods=["GET"])
def get_maintenance():
    """Retrieve all maintenance expense records."""
    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                m.maintenance_id,
                m.asset_id,
                a.asset_tag,
                a.name AS asset_name,
                DATE_FORMAT(m.maintenance_date, '%Y-%m-%d') AS maintenance_date,
                m.description,
                m.cost
            FROM maintenance m
            JOIN assets a ON m.asset_id = a.asset_id
            ORDER BY m.maintenance_date DESC
        """)
        rows = serialize_rows(cursor.fetchall())
        cursor.close()
        conn.close()
        return jsonify({"maintenance": rows})
    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return jsonify({"error": str(e)}), 500


# -----------------------------------------------------------------------------
# API: Live SQL Query Runner (For Faculty Live Demonstration)
# -----------------------------------------------------------------------------
SAMPLE_QUERIES = {
    "audit_trail": {
        "title": "Complete Ticket Status Audit Trail",
        "description": "Chronological state transitions with initial NULL status and timestamps.",
        "sql": """
            SELECT 
                t.ticket_no,
                t.title,
                COALESCE(sh.old_status, 'Initial (None)') AS old_status,
                sh.new_status,
                DATE_FORMAT(sh.changed_at, '%Y-%m-%d %H:%i:%s') AS transition_timestamp
            FROM status_histories sh
            JOIN tickets t ON sh.ticket_id = t.ticket_id
            ORDER BY t.ticket_no ASC, sh.changed_at ASC;
        """
    },
    "staff_workload": {
        "title": "Technician Assignment & Active Workload",
        "description": "Aggregated workload per technician, counting active vs resolved tickets.",
        "sql": """
            SELECT 
                s.name AS technician,
                s.specialization,
                COUNT(a.assignment_id) AS total_assigned_tickets,
                SUM(CASE WHEN t.status IN ('Open', 'In Progress', 'Pending') THEN 1 ELSE 0 END) AS active_tickets,
                SUM(CASE WHEN t.status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS completed_tickets
            FROM support_staff s
            LEFT JOIN assignments a ON s.staff_id = a.staff_id
            LEFT JOIN tickets t ON a.ticket_id = t.ticket_id
            GROUP BY s.staff_id, s.name, s.specialization
            ORDER BY active_tickets DESC;
        """
    },
    "department_maint": {
        "title": "Hardware Maintenance Expenditure by Department",
        "description": "Multi-table JOIN aggregation computing servicing expenditure across company departments.",
        "sql": """
            SELECT 
                d.name AS department_name,
                COUNT(DISTINCT a.asset_id) AS total_assets,
                CONCAT('$', FORMAT(COALESCE(SUM(m.cost), 0.00), 2)) AS total_maintenance_spent
            FROM departments d
            LEFT JOIN users u ON d.department_id = u.department_id
            LEFT JOIN assets a ON u.user_id = a.user_id
            LEFT JOIN maintenance m ON a.asset_id = m.asset_id
            GROUP BY d.department_id, d.name
            ORDER BY SUM(m.cost) DESC;
        """
    },
    "expiring_warranties": {
        "title": "Hardware Assets with Expiring Warranties",
        "description": "Asset identification cross-referenced with manufacturer warranty end dates.",
        "sql": """
            SELECT 
                a.asset_tag,
                a.name AS asset_name,
                w.provider AS warranty_provider,
                DATE_FORMAT(w.end_date, '%Y-%m-%d') AS expiry_date,
                DATEDIFF(w.end_date, CURDATE()) AS days_remaining
            FROM assets a
            JOIN warranties w ON a.warranty_id = w.warranty_id
            ORDER BY days_remaining ASC;
        """
    },
    "ticket_subtypes": {
        "title": "Ticket Subtype Distribution (Incidents vs Service Requests)",
        "description": "Demonstrates relational entity inheritance modeling.",
        "sql": """
            SELECT 
                t.ticket_no,
                t.title,
                t.status,
                CASE 
                    WHEN i.ticket_id IS NOT NULL THEN 'Incident'
                    WHEN sr.ticket_id IS NOT NULL THEN 'Service Request'
                    ELSE 'Standard'
                END AS subtype_class,
                COALESCE(i.incident_type, sr.request_type, '-') AS subtype_specific_attribute
            FROM tickets t
            LEFT JOIN incidents i ON t.ticket_id = i.ticket_id
            LEFT JOIN service_requests sr ON t.ticket_id = sr.ticket_id
            ORDER BY t.ticket_id ASC;
        """
    }
}


@app.route("/api/sql/queries", methods=["GET"])
def get_sample_queries_list():
    """Return list of available pre-configured SQL demonstration queries."""
    summary = []
    for key, val in SAMPLE_QUERIES.items():
        summary.append({
            "key": key,
            "title": val["title"],
            "description": val["description"],
            "sql": val["sql"].strip()
        })
    return jsonify({"queries": summary})


@app.route("/api/sql/run-sample", methods=["POST"])
def run_sample_query():
    """Execute a demonstration query against MySQL and return aligned tabular results."""
    data = request.get_json() or {}
    key = data.get("key")

    if key not in SAMPLE_QUERIES:
        return jsonify({"error": f"Unknown query key: {key}"}), 400

    query_meta = SAMPLE_QUERIES[key]
    sql_text = query_meta["sql"]

    conn, err = get_connection()
    if not conn:
        return jsonify({"error": err}), 503

    try:
        start_time = datetime.now()
        cursor = conn.cursor()
        cursor.execute(sql_text)
        headers = [col[0] for col in cursor.description]
        raw_rows = cursor.fetchall()
        duration_ms = round((datetime.now() - start_time).total_seconds() * 1000, 2)

        # Convert datetimes and decimals for JSON
        formatted_rows = []
        for r in raw_rows:
            formatted_rows.append([
                val.isoformat() if isinstance(val, (datetime, date))
                else float(val) if isinstance(val, Decimal)
                else str(val) if val is not None else "NULL"
                for val in r
            ])

        cursor.close()
        conn.close()

        return jsonify({
            "key": key,
            "title": query_meta["title"],
            "description": query_meta["description"],
            "sql": sql_text.strip(),
            "headers": headers,
            "rows": formatted_rows,
            "row_count": len(formatted_rows),
            "execution_time_ms": duration_ms
        })

    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return jsonify({"error": f"SQL execution failed: {str(e)}"}), 500


# -----------------------------------------------------------------------------
# Main Application Launcher
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", 5050))

    debug = os.environ.get("FLASK_DEBUG", "False").lower() in ("true", "1")
    print("\n" + "=" * 65)
    print("   IT HELPDESK & ASSET SUPPORT MANAGEMENT SYSTEM")
    print("   Course: DBMS | Presentation-III UI Demo")
    print("   Student: Md Aali Rahman (25WU0102156)")
    print("=" * 65)
    status = check_db_status()
    if status.get("connected"):
        print(f"   [DATABASE] Connected to MySQL '{status['database']}' on {status['host']}:{status['port']}")
        print(f"   [TABLES]   {status['tables_count']} relational tables verified")
    else:
        print(f"   [WARNING]  Database offline: {status.get('error')}")
    print(f"   [WEB UI]   Running on http://127.0.0.1:{port}")
    print("=" * 65 + "\n")
    app.run(host="0.0.0.0", port=port, debug=debug)
