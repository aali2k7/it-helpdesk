#!/usr/bin/env python3
"""
IT Helpdesk & Asset Support Management System
Terminal-Based MySQL Application for College DBMS Project Demonstration
"""

import os
import sys
import mysql.connector
from mysql.connector import Error

# ==========================================================
# DATABASE CONFIGURATION
# ==========================================================
# Connects to local MySQL database 'it_helpdesk'
# Can be overridden via environment variables if needed
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", 3306)),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "database": os.environ.get("DB_NAME", "it_helpdesk"),
}


def get_connection():
    """Establish and return a MySQL database connection with autocommit disabled."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        conn.autocommit = False  # Explicit transaction management
        return conn
    except Error as e:
        print(f"\n[ERROR] Database connection failed: {e}")
        print("[HINT] Ensure MySQL is running on localhost:3306 and database 'it_helpdesk' exists.")
        return None


# ==========================================================
# FORMATTING & DISPLAY HELPERS
# ==========================================================
def print_header(title):
    """Print a clean section banner."""
    print("\n" + "=" * 65)
    print(f"   {title.upper()}")
    print("=" * 65)


def print_table(headers, rows):
    """Render data rows in an aligned, readable ASCII table format."""
    if not rows:
        print("\n(No records found)")
        return

    # Calculate optimal column widths
    col_widths = [len(str(h)) for h in headers]
    for row in rows:
        for i, val in enumerate(row):
            val_str = str(val) if val is not None else "NULL"
            if len(val_str) > col_widths[i]:
                col_widths[i] = len(val_str)

    header_fmt = " | ".join(f"{{:<{w}}}" for w in col_widths)
    separator = "-+-".join("-" * w for w in col_widths)

    print("\n" + header_fmt.format(*headers))
    print(separator)
    for row in rows:
        row_display = [str(v) if v is not None else "-" for v in row]
        print(header_fmt.format(*row_display))
    print(f"\nTotal Records: {len(rows)}")


def get_ticket_by_number_or_id(cursor, ticket_input):
    """Lookup a ticket record by either its ticket_no (e.g. 'TKT-001') or numeric ID."""
    ticket_input = str(ticket_input).strip()
    if not ticket_input:
        return None

    # Check by ticket_no or ticket_id
    query = """
        SELECT ticket_id, ticket_no, user_id, category_id, priority_id, title, description, status, created_at
        FROM tickets
        WHERE ticket_no = %s OR ticket_id = %s
        LIMIT 1
    """
    numeric_id = int(ticket_input) if ticket_input.isdigit() else -1
    cursor.execute(query, (ticket_input, numeric_id))
    return cursor.fetchone()


# ==========================================================
# 1. CREATE TICKET
# ==========================================================
def create_ticket(conn):
    """
    Create a new helpdesk ticket with:
    - User, Category, and Priority validations
    - Automatic ticket number generation (e.g. TKT-006)
    - Subtype insertion (Incident or Service Request)
    - Initial status_history logging (old_status: NULL -> new_status: 'Open')
    - Atomic transaction commit / rollback
    """
    print_header("1. Create New Ticket")
    cursor = conn.cursor(dictionary=True)

    try:
        # Display Available Users
        cursor.execute("SELECT user_id, name, email FROM users ORDER BY user_id")
        users = cursor.fetchall()
        print("\nAvailable Users:")
        for u in users:
            print(f"  [{u['user_id']}] {u['name']} ({u['email']})")

        user_input = input("\nEnter User ID: ").strip()
        if not user_input.isdigit():
            print("[ERROR] User ID must be a valid number.")
            return
        user_id = int(user_input)

        # Validate User Exists
        cursor.execute("SELECT user_id, name FROM users WHERE user_id = %s", (user_id,))
        if not cursor.fetchone():
            print(f"[ERROR] User ID {user_id} does not exist.")
            return

        # Display Available Categories
        cursor.execute("SELECT category_id, name FROM categories ORDER BY category_id")
        categories = cursor.fetchall()
        print("\nAvailable Categories:")
        for c in categories:
            print(f"  [{c['category_id']}] {c['name']}")

        cat_input = input("\nEnter Category ID: ").strip()
        if not cat_input.isdigit():
            print("[ERROR] Category ID must be a valid number.")
            return
        category_id = int(cat_input)

        # Validate Category Exists
        cursor.execute("SELECT category_id FROM categories WHERE category_id = %s", (category_id,))
        if not cursor.fetchone():
            print(f"[ERROR] Category ID {category_id} does not exist.")
            return

        # Display Available Priorities
        cursor.execute("SELECT priority_id, name, level FROM priorities ORDER BY level ASC")
        priorities = cursor.fetchall()
        print("\nAvailable Priorities:")
        for p in priorities:
            print(f"  [{p['priority_id']}] {p['name']} (Level {p['level']})")

        pri_input = input("\nEnter Priority ID: ").strip()
        if not pri_input.isdigit():
            print("[ERROR] Priority ID must be a valid number.")
            return
        priority_id = int(pri_input)

        # Validate Priority Exists
        cursor.execute("SELECT priority_id FROM priorities WHERE priority_id = %s", (priority_id,))
        if not cursor.fetchone():
            print(f"[ERROR] Priority ID {priority_id} does not exist.")
            return

        # Prompt for Title and Description
        title = input("\nEnter Ticket Title: ").strip()
        if not title:
            print("[ERROR] Title cannot be empty.")
            return

        description = input("Enter Detailed Description: ").strip()
        if not description:
            print("[ERROR] Description cannot be empty.")
            return

        # Prompt for Subtype
        print("\nSelect Ticket Type:")
        print("  [1] Incident (Hardware failure, system crash, network outage)")
        print("  [2] Service Request (Access request, software installation, hardware allocation)")
        type_choice = input("Enter choice (1 or 2): ").strip()

        if type_choice not in ("1", "2"):
            print("[ERROR] Invalid ticket type selected. Must be 1 (Incident) or 2 (Service Request).")
            return

        subtype_detail = ""
        if type_choice == "1":
            subtype_detail = input("Enter Incident Type (e.g. Hardware Malfunction, Software Crash): ").strip()
            if not subtype_detail:
                subtype_detail = "General Incident"
        else:
            subtype_detail = input("Enter Request Type (e.g. Access Provisioning, Hardware Allocation): ").strip()
            if not subtype_detail:
                subtype_detail = "General Service Request"

        # Generate Next Ticket Number (e.g. TKT-006)
        cursor.execute("SELECT MAX(ticket_id) AS max_id FROM tickets")
        row = cursor.fetchone()
        next_id = (row["max_id"] or 0) + 1
        ticket_no = f"TKT-{next_id:03d}"

        # 1. Insert into tickets
        insert_ticket_sql = """
            INSERT INTO tickets (ticket_no, user_id, category_id, priority_id, title, description, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, 'Open', NOW())
        """
        cursor.execute(insert_ticket_sql, (ticket_no, user_id, category_id, priority_id, title, description))
        new_ticket_id = cursor.lastrowid

        # 2. Insert into appropriate subtype table
        if type_choice == "1":
            cursor.execute(
                "INSERT INTO incidents (ticket_id, incident_type) VALUES (%s, %s)",
                (new_ticket_id, subtype_detail)
            )
        else:
            cursor.execute(
                "INSERT INTO service_requests (ticket_id, request_type) VALUES (%s, %s)",
                (new_ticket_id, subtype_detail)
            )

        # 3. Insert initial status history record (old_status NULL, new_status 'Open')
        cursor.execute(
            "INSERT INTO status_histories (ticket_id, old_status, new_status, changed_at) VALUES (%s, %s, %s, NOW())",
            (new_ticket_id, None, "Open")
        )

        # Commit Transaction
        conn.commit()
        print(f"\n[SUCCESS] Ticket created successfully!")
        print(f"  Ticket Number : {ticket_no}")
        print(f"  Ticket ID     : {new_ticket_id}")
        print(f"  Status        : Open")
        print(f"  Type          : {'Incident' if type_choice == '1' else 'Service Request'} ({subtype_detail})")

    except Error as e:
        conn.rollback()
        print(f"\n[DATABASE ERROR] Failed to create ticket: {e}")
    finally:
        cursor.close()


# ==========================================================
# 2. VIEW ALL TICKETS
# ==========================================================
def view_all_tickets(conn):
    """
    Display all tickets using JOIN queries:
    Ticket No | User | Category | Priority | Status | Created At
    """
    print_header("2. All Helpdesk Tickets")
    cursor = conn.cursor()

    try:
        query = """
            SELECT 
                t.ticket_no,
                u.name AS user_name,
                c.name AS category_name,
                p.name AS priority_name,
                t.status,
                DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i') AS created_at
            FROM tickets t
            JOIN users u ON t.user_id = u.user_id
            JOIN categories c ON t.category_id = c.category_id
            JOIN priorities p ON t.priority_id = p.priority_id
            ORDER BY t.ticket_id ASC;
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        headers = ["Ticket No", "User", "Category", "Priority", "Status", "Created At"]
        print_table(headers, rows)

    except Error as e:
        print(f"\n[DATABASE ERROR] Failed to retrieve tickets: {e}")
    finally:
        cursor.close()


# ==========================================================
# 3. VIEW TICKET DETAILS
# ==========================================================
def view_ticket_details(conn):
    """
    Display comprehensive ticket information:
    - Ticket metadata, User, Category, Priority, Title, Description, Type, Status, Created Date
    - Assigned support staff
    - Status history audit log
    - Resolution summary (if resolved)
    """
    print_header("3. View Ticket Details")
    cursor = conn.cursor(dictionary=True)

    try:
        ticket_input = input("Enter Ticket Number (e.g. TKT-001) or Ticket ID: ").strip()
        ticket = get_ticket_by_number_or_id(cursor, ticket_input)

        if not ticket:
            print(f"[ERROR] Ticket '{ticket_input}' not found.")
            return

        ticket_id = ticket["ticket_id"]

        # Fetch joined details
        query = """
            SELECT 
                t.ticket_id,
                t.ticket_no,
                u.name AS user_name,
                u.email AS user_email,
                c.name AS category_name,
                p.name AS priority_name,
                p.level AS priority_level,
                t.title,
                t.description,
                t.status,
                DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') AS formatted_created_at
            FROM tickets t
            JOIN users u ON t.user_id = u.user_id
            JOIN categories c ON t.category_id = c.category_id
            JOIN priorities p ON t.priority_id = p.priority_id
            WHERE t.ticket_id = %s
        """
        cursor.execute(query, (ticket_id,))
        details = cursor.fetchone()

        # Determine Ticket Subtype
        cursor.execute("SELECT incident_type FROM incidents WHERE ticket_id = %s", (ticket_id,))
        inc = cursor.fetchone()

        cursor.execute("SELECT request_type FROM service_requests WHERE ticket_id = %s", (ticket_id,))
        srv = cursor.fetchone()

        if inc:
            type_str = f"Incident ({inc['incident_type']})"
        elif srv:
            type_str = f"Service Request ({srv['request_type']})"
        else:
            type_str = "Standard Ticket"

        print("\n" + "-" * 55)
        print(f" Ticket Information: {details['ticket_no']}")
        print("-" * 55)
        print(f"  Ticket Number : {details['ticket_no']} (ID: {details['ticket_id']})")
        print(f"  User          : {details['user_name']} <{details['user_email']}>")
        print(f"  Category      : {details['category_name']}")
        print(f"  Priority      : {details['priority_name']} (Level {details['priority_level']})")
        print(f"  Title         : {details['title']}")
        print(f"  Description   : {details['description']}")
        print(f"  Type          : {type_str}")
        print(f"  Status        : {details['status']}")
        print(f"  Created Date  : {details['formatted_created_at']}")

        # Fetch Assigned Staff
        cursor.execute("""
            SELECT s.name, s.email, s.specialization, DATE_FORMAT(a.assigned_at, '%Y-%m-%d %H:%i:%s') AS assigned_at
            FROM assignments a
            JOIN support_staff s ON a.staff_id = s.staff_id
            WHERE a.ticket_id = %s
            ORDER BY a.assignment_id ASC
        """, (ticket_id,))
        assignments = cursor.fetchall()

        print("\n  [Assigned Support Staff]")
        if assignments:
            for a in assignments:
                print(f"   • {a['name']} ({a['specialization']}) - Assigned at {a['assigned_at']}")
        else:
            print("   • (Unassigned)")

        # Fetch Status History
        cursor.execute("""
            SELECT 
                COALESCE(old_status, 'NULL (Initial)') AS old_st,
                new_status AS new_st,
                DATE_FORMAT(changed_at, '%Y-%m-%d %H:%i:%s') AS changed_time
            FROM status_histories
            WHERE ticket_id = %s
            ORDER BY history_id ASC
        """, (ticket_id,))
        histories = cursor.fetchall()

        print("\n  [Status History Audit Trail]")
        if histories:
            for h in histories:
                print(f"   • [{h['changed_time']}] {h['old_st']} -> {h['new_st']}")
        else:
            print("   • (No history records logged)")

        # Fetch Resolution if available
        cursor.execute("""
            SELECT description, DATE_FORMAT(resolved_at, '%Y-%m-%d %H:%i:%s') AS resolved_time
            FROM resolutions
            WHERE ticket_id = %s
        """, (ticket_id,))
        res = cursor.fetchone()

        if res:
            print("\n  [Resolution Details]")
            print(f"   • Resolved At : {res['resolved_time']}")
            print(f"   • Solution    : {res['description']}")

        print("-" * 55)

    except Error as e:
        print(f"\n[DATABASE ERROR] Failed to fetch ticket details: {e}")
    finally:
        cursor.close()


# ==========================================================
# 4. ASSIGN TICKET
# ==========================================================
def assign_ticket(conn):
    """
    Assign a ticket to a support staff member:
    - Validates ticket and staff exist
    - Inserts record into assignments table
    - Updates ticket status to 'In Progress'
    - Creates a status_history record
    """
    print_header("4. Assign Ticket")
    cursor = conn.cursor(dictionary=True)

    try:
        ticket_input = input("Enter Ticket Number (e.g. TKT-001) or Ticket ID: ").strip()
        ticket = get_ticket_by_number_or_id(cursor, ticket_input)

        if not ticket:
            print(f"[ERROR] Ticket '{ticket_input}' does not exist.")
            return

        ticket_id = ticket["ticket_id"]
        current_status = ticket["status"]

        # Display Available Support Staff
        cursor.execute("SELECT staff_id, name, specialization FROM support_staff ORDER BY staff_id")
        staff_list = cursor.fetchall()
        print("\nAvailable Support Staff:")
        for s in staff_list:
            print(f"  [{s['staff_id']}] {s['name']} - {s['specialization']}")

        staff_input = input("\nEnter Support Staff ID: ").strip()
        if not staff_input.isdigit():
            print("[ERROR] Staff ID must be a valid number.")
            return
        staff_id = int(staff_input)

        # Validate Staff Exists
        cursor.execute("SELECT staff_id, name FROM support_staff WHERE staff_id = %s", (staff_id,))
        staff = cursor.fetchone()
        if not staff:
            print(f"[ERROR] Support Staff ID {staff_id} does not exist.")
            return

        # 1. Insert into assignments
        cursor.execute(
            "INSERT INTO assignments (ticket_id, staff_id, assigned_at) VALUES (%s, %s, NOW())",
            (ticket_id, staff_id)
        )

        # 2. Update Ticket Status to 'In Progress'
        new_status = "In Progress"
        cursor.execute("UPDATE tickets SET status = %s WHERE ticket_id = %s", (new_status, ticket_id))

        # 3. Create Status History record
        cursor.execute(
            "INSERT INTO status_histories (ticket_id, old_status, new_status, changed_at) VALUES (%s, %s, %s, NOW())",
            (ticket_id, current_status, new_status)
        )

        # Commit Transaction
        conn.commit()
        print(f"\n[SUCCESS] Ticket {ticket['ticket_no']} assigned to {staff['name']}.")
        print(f"  Status updated: '{current_status}' -> '{new_status}'")

    except Error as e:
        conn.rollback()
        print(f"\n[DATABASE ERROR] Failed to assign ticket: {e}")
    finally:
        cursor.close()


# ==========================================================
# 5. UPDATE TICKET STATUS
# ==========================================================
def update_ticket_status(conn):
    """
    Update ticket status:
    - Validates ticket exists
    - Validates new status against allowed enum values
    - Updates tickets table
    - Records old_status and new_status in status_histories
    """
    print_header("5. Update Ticket Status")
    cursor = conn.cursor(dictionary=True)

    allowed_statuses = ["Open", "In Progress", "Pending", "Resolved", "Closed", "Cancelled"]

    try:
        ticket_input = input("Enter Ticket Number (e.g. TKT-001) or Ticket ID: ").strip()
        ticket = get_ticket_by_number_or_id(cursor, ticket_input)

        if not ticket:
            print(f"[ERROR] Ticket '{ticket_input}' does not exist.")
            return

        ticket_id = ticket["ticket_id"]
        old_status = ticket["status"]

        print(f"\nTicket Found: {ticket['ticket_no']} - '{ticket['title']}'")
        print(f"Current Status: {old_status}")

        print("\nAllowed Statuses:")
        for i, s in enumerate(allowed_statuses, 1):
            print(f"  [{i}] {s}")

        choice = input("\nEnter choice (1-6) or type status name: ").strip()
        new_status = None

        if choice.isdigit() and 1 <= int(choice) <= len(allowed_statuses):
            new_status = allowed_statuses[int(choice) - 1]
        else:
            # Check if typed exact match
            for s in allowed_statuses:
                if s.lower() == choice.lower():
                    new_status = s
                    break

        if not new_status:
            print("[ERROR] Invalid status selection.")
            return

        if new_status == old_status:
            print(f"[INFO] Ticket is already in '{old_status}' status. No update needed.")
            return

        # 1. Update ticket status
        cursor.execute("UPDATE tickets SET status = %s WHERE ticket_id = %s", (new_status, ticket_id))

        # 2. Insert into status_histories
        cursor.execute(
            "INSERT INTO status_histories (ticket_id, old_status, new_status, changed_at) VALUES (%s, %s, %s, NOW())",
            (ticket_id, old_status, new_status)
        )

        # Commit Transaction
        conn.commit()
        print(f"\n[SUCCESS] Ticket {ticket['ticket_no']} status updated successfully: '{old_status}' -> '{new_status}'")

    except Error as e:
        conn.rollback()
        print(f"\n[DATABASE ERROR] Failed to update ticket status: {e}")
    finally:
        cursor.close()


# ==========================================================
# 6. RESOLVE TICKET
# ==========================================================
def resolve_ticket(conn):
    """
    Resolve a ticket:
    - Validates ticket exists
    - Prevents duplicate resolution entries
    - Inserts record into resolutions table
    - Updates ticket status to 'Resolved'
    - Creates a status_history record
    """
    print_header("6. Resolve Ticket")
    cursor = conn.cursor(dictionary=True)

    try:
        ticket_input = input("Enter Ticket Number (e.g. TKT-001) or Ticket ID: ").strip()
        ticket = get_ticket_by_number_or_id(cursor, ticket_input)

        if not ticket:
            print(f"[ERROR] Ticket '{ticket_input}' does not exist.")
            return

        ticket_id = ticket["ticket_id"]
        old_status = ticket["status"]

        # Check if already resolved
        cursor.execute("SELECT resolution_id, description FROM resolutions WHERE ticket_id = %s", (ticket_id,))
        existing_res = cursor.fetchone()
        if existing_res:
            print(f"[WARNING] Ticket {ticket['ticket_no']} already has a recorded resolution:")
            print(f"  Existing Solution: {existing_res['description']}")
            print("Duplicate resolutions for the same ticket are not allowed.")
            return

        print(f"\nResolving Ticket: {ticket['ticket_no']} - {ticket['title']}")
        resolution_desc = input("Enter Resolution Description / Fix Summary: ").strip()
        if not resolution_desc:
            print("[ERROR] Resolution description cannot be empty.")
            return

        # 1. Insert into resolutions
        cursor.execute(
            "INSERT INTO resolutions (ticket_id, description, resolved_at) VALUES (%s, %s, NOW())",
            (ticket_id, resolution_desc)
        )

        # 2. Update ticket status to 'Resolved'
        cursor.execute("UPDATE tickets SET status = 'Resolved' WHERE ticket_id = %s", (ticket_id,))

        # 3. Insert status history
        cursor.execute(
            "INSERT INTO status_histories (ticket_id, old_status, new_status, changed_at) VALUES (%s, %s, %s, NOW())",
            (ticket_id, old_status, "Resolved")
        )

        # Commit Transaction
        conn.commit()
        print(f"\n[SUCCESS] Ticket {ticket['ticket_no']} marked as 'Resolved' and resolution logged.")

    except Error as e:
        conn.rollback()
        print(f"\n[DATABASE ERROR] Failed to resolve ticket: {e}")
    finally:
        cursor.close()


# ==========================================================
# 7. VIEW ASSETS
# ==========================================================
def view_assets(conn):
    """
    Display assets with JOIN queries:
    Asset Tag | Name | Serial No | Assigned User | Category
    """
    print_header("7. View Assets")
    cursor = conn.cursor()

    try:
        query = """
            SELECT 
                a.asset_tag,
                a.name AS asset_name,
                a.serial_no,
                COALESCE(u.name, 'Unassigned / In Stock') AS assigned_user,
                c.name AS category_name
            FROM assets a
            LEFT JOIN users u ON a.user_id = u.user_id
            JOIN categories c ON a.category_id = c.category_id
            ORDER BY a.asset_id ASC;
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        headers = ["Asset Tag", "Name", "Serial No", "Assigned User", "Category"]
        print_table(headers, rows)

    except Error as e:
        print(f"\n[DATABASE ERROR] Failed to fetch assets: {e}")
    finally:
        cursor.close()


# ==========================================================
# 8. REGISTER ASSET
# ==========================================================
def register_asset(conn):
    """
    Register a new hardware asset:
    - Prompts for asset tag, name, serial number, user ID (optional), category ID, warranty ID (optional)
    - Validates all foreign keys
    - Inserts into assets table
    """
    print_header("8. Register New Asset")
    cursor = conn.cursor(dictionary=True)

    try:
        asset_tag = input("Enter Asset Tag (e.g. AST-DELL-006): ").strip()
        if not asset_tag:
            print("[ERROR] Asset tag cannot be empty.")
            return

        # Check unique asset_tag
        cursor.execute("SELECT asset_id FROM assets WHERE asset_tag = %s", (asset_tag,))
        if cursor.fetchone():
            print(f"[ERROR] Asset Tag '{asset_tag}' already exists. Must be unique.")
            return

        name = input("Enter Asset Name / Model (e.g. ThinkPad X1 Carbon): ").strip()
        if not name:
            print("[ERROR] Asset name cannot be empty.")
            return

        serial_no = input("Enter Serial Number: ").strip()
        if not serial_no:
            print("[ERROR] Serial number cannot be empty.")
            return

        # Check unique serial_no
        cursor.execute("SELECT asset_id FROM assets WHERE serial_no = %s", (serial_no,))
        if cursor.fetchone():
            print(f"[ERROR] Serial Number '{serial_no}' already exists. Must be unique.")
            return

        # Show Available Categories
        cursor.execute("SELECT category_id, name FROM categories ORDER BY category_id")
        categories = cursor.fetchall()
        print("\nAvailable Categories:")
        for c in categories:
            print(f"  [{c['category_id']}] {c['name']}")

        cat_input = input("\nEnter Category ID: ").strip()
        if not cat_input.isdigit():
            print("[ERROR] Category ID must be a valid number.")
            return
        category_id = int(cat_input)

        cursor.execute("SELECT category_id FROM categories WHERE category_id = %s", (category_id,))
        if not cursor.fetchone():
            print(f"[ERROR] Category ID {category_id} does not exist.")
            return

        # Show Available Users (Optional)
        cursor.execute("SELECT user_id, name, email FROM users ORDER BY user_id")
        users = cursor.fetchall()
        print("\nRegistered Users (Optional - Leave blank or 0 for unassigned):")
        for u in users:
            print(f"  [{u['user_id']}] {u['name']} ({u['email']})")

        user_input = input("\nEnter User ID (or press Enter for unassigned): ").strip()
        user_id = None
        if user_input and user_input != "0":
            if not user_input.isdigit():
                print("[ERROR] User ID must be a valid number.")
                return
            user_id = int(user_input)
            cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
            if not cursor.fetchone():
                print(f"[ERROR] User ID {user_id} does not exist.")
                return

        # Show Available Warranties (Optional)
        cursor.execute("SELECT warranty_id, provider, end_date FROM warranties ORDER BY warranty_id")
        warranties = cursor.fetchall()
        print("\nAvailable Warranties (Optional - Leave blank or 0 for none):")
        for w in warranties:
            print(f"  [{w['warranty_id']}] {w['provider']} (Expires: {w['end_date']})")

        war_input = input("\nEnter Warranty ID (or press Enter for none): ").strip()
        warranty_id = None
        if war_input and war_input != "0":
            if not war_input.isdigit():
                print("[ERROR] Warranty ID must be a valid number.")
                return
            warranty_id = int(war_input)
            cursor.execute("SELECT warranty_id FROM warranties WHERE warranty_id = %s", (warranty_id,))
            if not cursor.fetchone():
                print(f"[ERROR] Warranty ID {warranty_id} does not exist.")
                return

        # Insert into assets
        insert_asset_sql = """
            INSERT INTO assets (asset_tag, name, serial_no, user_id, category_id, warranty_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_asset_sql, (asset_tag, name, serial_no, user_id, category_id, warranty_id))
        new_asset_id = cursor.lastrowid

        conn.commit()
        print(f"\n[SUCCESS] Asset registered successfully with ID {new_asset_id} (Tag: {asset_tag}).")

    except Error as e:
        conn.rollback()
        print(f"\n[DATABASE ERROR] Failed to register asset: {e}")
    finally:
        cursor.close()


# ==========================================================
# 9. VIEW MAINTENANCE RECORDS
# ==========================================================
def view_maintenance_records(conn):
    """
    Display maintenance records joined with assets:
    Asset | Maintenance Date | Description | Cost
    """
    print_header("9. View Maintenance Records")
    cursor = conn.cursor()

    try:
        query = """
            SELECT 
                CONCAT(a.asset_tag, ' - ', a.name) AS asset_info,
                DATE_FORMAT(m.maintenance_date, '%Y-%m-%d') AS maint_date,
                m.description,
                CONCAT('$', FORMAT(m.cost, 2)) AS formatted_cost
            FROM maintenance m
            JOIN assets a ON m.asset_id = a.asset_id
            ORDER BY m.maintenance_date DESC;
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        headers = ["Asset", "Maintenance Date", "Description", "Cost"]
        print_table(headers, rows)

    except Error as e:
        print(f"\n[DATABASE ERROR] Failed to fetch maintenance records: {e}")
    finally:
        cursor.close()


# ==========================================================
# MAIN APPLICATION LOOP
# ==========================================================
def main():
    """Main terminal loop and interactive numbered menu."""
    conn = get_connection()
    if not conn:
        print("\nCould not establish database connection. Exiting.\n")
        sys.exit(1)

    while True:
        print("\n========================================")
        print("   IT HELPDESK & ASSET SUPPORT SYSTEM   ")
        print("========================================")
        print()
        print("1. Create Ticket")
        print("2. View All Tickets")
        print("3. View Ticket Details")
        print("4. Assign Ticket")
        print("5. Update Ticket Status")
        print("6. Resolve Ticket")
        print("7. View Assets")
        print("8. Register Asset")
        print("9. View Maintenance Records")
        print("10. Exit")
        print()

        choice = input("Enter choice: ").strip()

        if choice == "1":
            create_ticket(conn)
        elif choice == "2":
            view_all_tickets(conn)
        elif choice == "3":
            view_ticket_details(conn)
        elif choice == "4":
            assign_ticket(conn)
        elif choice == "5":
            update_ticket_status(conn)
        elif choice == "6":
            resolve_ticket(conn)
        elif choice == "7":
            view_assets(conn)
        elif choice == "8":
            register_asset(conn)
        elif choice == "9":
            view_maintenance_records(conn)
        elif choice == "10":
            print("\nClosing database connection...")
            if conn and conn.is_connected():
                conn.close()
            print("Goodbye!\n")
            break
        else:
            print("\n[INVALID INPUT] Please choose a number from 1 to 10.")


if __name__ == "__main__":
    main()
