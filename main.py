#!/usr/bin/env python3
"""
IT Helpdesk & Asset Support Management System
Terminal-Based MySQL Application
"""

import os
import sys
from datetime import datetime
import mysql.connector
from mysql.connector import Error

# Default Database Configuration
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", 3306)),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "database": os.environ.get("DB_NAME", "it_helpdesk"),
}


def get_connection():
    """Establish and return a MySQL database connection."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"\n[ERROR] Could not connect to MySQL database '{DB_CONFIG['database']}': {e}")
        print("[INFO] Please verify your MySQL server is running and credentials in environment variables or main.py are correct.")
        return None


def print_header(title):
    """Print a clean section header."""
    print("\n" + "=" * 65)
    print(f" {title.upper()}")
    print("=" * 65)


def print_table(headers, rows):
    """Render rows in a neat, aligned ASCII table."""
    if not rows:
        print("\n(No records found)")
        return

    # Calculate column widths
    col_widths = [len(h) for h in headers]
    for row in rows:
        for i, val in enumerate(row):
            val_str = str(val) if val is not None else "NULL"
            if len(val_str) > col_widths[i]:
                col_widths[i] = len(val_str)

    # Format strings
    header_fmt = " | ".join(f"{{:<{w}}}" for w in col_widths)
    separator = "-+-".join("-" * w for w in col_widths)

    print("\n" + header_fmt.format(*headers))
    print(separator)
    for row in rows:
        row_display = [str(v) if v is not None else "-" for v in row]
        print(header_fmt.format(*row_display))
    print(f"Total Records: {len(rows)}\n")


# ==========================================================
# 1. REGISTER ASSET
# ==========================================================
def register_asset(conn):
    print_header("Register New Asset")
    cursor = conn.cursor(dictionary=True)
    try:
        # Show Categories
        cursor.execute("SELECT category_id, name FROM categories ORDER BY category_id")
        categories = cursor.fetchall()
        print("\nAvailable Categories:")
        for c in categories:
            print(f"  [{c['category_id']}] {c['name']}")

        # Show Users
        cursor.execute("SELECT user_id, name, email FROM users ORDER BY user_id")
        users = cursor.fetchall()
        print("\nRegistered Users (Assignee):")
        print("  [0] Leave Unassigned / In Stock")
        for u in users:
            print(f"  [{u['user_id']}] {u['name']} ({u['email']})")

        # Show Warranties
        cursor.execute("SELECT warranty_id, provider, end_date FROM warranties ORDER BY warranty_id")
        warranties = cursor.fetchall()
        print("\nAvailable Warranties:")
        print("  [0] No Warranty")
        for w in warranties:
            print(f"  [{w['warranty_id']}] {w['provider']} (Expires: {w['end_date']})")

        print("\n--- Enter Asset Details ---")
        asset_tag = input("Asset Tag (e.g. AST-DELL-007): ").strip()
        if not asset_tag:
            print("[ERROR] Asset tag cannot be empty.")
            return

        name = input("Asset Name / Model (e.g. Dell Latitude 5430): ").strip()
        if not name:
            print("[ERROR] Asset name cannot be empty.")
            return

        serial_no = input("Serial Number: ").strip()
        if not serial_no:
            print("[ERROR] Serial number cannot be empty.")
            return

        cat_id_raw = input("Category ID: ").strip()
        cat_id = int(cat_id_raw) if cat_id_raw.isdigit() else None
        if not cat_id:
            print("[ERROR] Invalid category selection.")
            return

        user_id_raw = input("Assigned User ID (0 for Unassigned): ").strip()
        user_id = int(user_id_raw) if user_id_raw.isdigit() and int(user_id_raw) > 0 else None

        war_id_raw = input("Warranty ID (0 for None): ").strip()
        war_id = int(war_id_raw) if war_id_raw.isdigit() and int(war_id_raw) > 0 else None

        # Insert Query
        insert_query = """
            INSERT INTO assets (asset_tag, name, serial_no, user_id, category_id, warranty_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (asset_tag, name, serial_no, user_id, cat_id, war_id))
        conn.commit()
        print(f"\n[SUCCESS] Asset '{asset_tag}' registered successfully with ID: {cursor.lastrowid}")

    except Error as e:
        conn.rollback()
        print(f"\n[DATABASE ERROR] Failed to register asset: {e}")
    except ValueError:
        print("\n[INPUT ERROR] Invalid numeric input entered.")
    finally:
        cursor.close()


# ==========================================================
# 2. CREATE TICKET
# ==========================================================
def create_ticket(conn):
    print_header("Create New Helpdesk Ticket")
    cursor = conn.cursor(dictionary=True)
    try:
        # Show Users
        cursor.execute("SELECT user_id, name, email FROM users ORDER BY user_id")
        users = cursor.fetchall()
        print("\nSelect Reporting User:")
        for u in users:
            print(f"  [{u['user_id']}] {u['name']} ({u['email']})")

        user_id = int(input("\nUser ID: ").strip())

        # Show Categories
        cursor.execute("SELECT category_id, name FROM categories ORDER BY category_id")
        categories = cursor.fetchall()
        print("\nSelect Category:")
        for c in categories:
            print(f"  [{c['category_id']}] {c['name']}")

        category_id = int(input("Category ID: ").strip())

        # Show Priorities
        cursor.execute("SELECT priority_id, name, level FROM priorities ORDER BY level ASC")
        priorities = cursor.fetchall()
        print("\nSelect Priority:")
        for p in priorities:
            print(f"  [{p['priority_id']}] {p['name']} (Level {p['level']})")

        priority_id = int(input("Priority ID: ").strip())

        title = input("\nTicket Title / Summary: ").strip()
        if not title:
            print("[ERROR] Title cannot be empty.")
            return

        description = input("Detailed Description: ").strip()
        if not description:
            print("[ERROR] Description cannot be empty.")
            return

        print("\nTicket Type:")
        print("  [1] Incident (Outage, Breakage, Failure)")
        print("  [2] Service Request (New Access, Software, Equipment)")
        print("  [3] Standard Ticket")
        ticket_type = input("Choice (1-3): ").strip()

        # Generate unique ticket number
        now = datetime.now()
        ticket_no = f"TCK-{now.strftime('%Y%m%d')}-{now.strftime('%H%M%S')}"

        insert_ticket = """
            INSERT INTO tickets (ticket_no, user_id, category_id, priority_id, title, description, status)
            VALUES (%s, %s, %s, %s, %s, %s, 'Open')
        """
        cursor.execute(insert_ticket, (ticket_no, user_id, category_id, priority_id, title, description))
        new_ticket_id = cursor.lastrowid

        # Handle Subtype
        if ticket_type == "1":
            inc_type = input("Incident Type (e.g. Hardware Failure, Crash, Network Outage): ").strip()
            if inc_type:
                cursor.execute(
                    "INSERT INTO incidents (ticket_id, incident_type) VALUES (%s, %s)",
                    (new_ticket_id, inc_type)
                )
        elif ticket_type == "2":
            req_type = input("Request Type (e.g. Software Provisioning, Account Access): ").strip()
            if req_type:
                cursor.execute(
                    "INSERT INTO service_requests (ticket_id, request_type) VALUES (%s, %s)",
                    (new_ticket_id, req_type)
                )

        # Log initial status history
        cursor.execute(
            "INSERT INTO status_histories (ticket_id, old_status, new_status) VALUES (%s, %s, %s)",
            (new_ticket_id, "None", "Open")
        )

        conn.commit()
        print(f"\n[SUCCESS] Ticket '{ticket_no}' (ID: {new_ticket_id}) created successfully with status 'Open'.")

    except Error as e:
        conn.rollback()
        print(f"\n[DATABASE ERROR] Failed to create ticket: {e}")
    except ValueError:
        print("\n[INPUT ERROR] Invalid numerical value.")
    finally:
        cursor.close()


# ==========================================================
# 3. VIEW TICKETS
# ==========================================================
def view_tickets(conn):
    print_header("View Tickets")
    cursor = conn.cursor()
    try:
        query = """
            SELECT 
                t.ticket_id,
                t.ticket_no,
                u.name AS user_name,
                c.name AS category,
                p.name AS priority,
                t.title,
                t.status,
                COALESCE(s.name, 'Unassigned') AS assigned_to,
                DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i') AS created
            FROM tickets t
            JOIN users u ON t.user_id = u.user_id
            JOIN categories c ON t.category_id = c.category_id
            JOIN priorities p ON t.priority_id = p.priority_id
            LEFT JOIN (
                SELECT a.ticket_id, a.staff_id 
                FROM assignments a 
                INNER JOIN (
                    SELECT ticket_id, MAX(assignment_id) AS max_id 
                    FROM assignments GROUP BY ticket_id
                ) latest ON a.assignment_id = latest.max_id
            ) cur_assign ON t.ticket_id = cur_assign.ticket_id
            LEFT JOIN support_staff s ON cur_assign.staff_id = s.staff_id
            ORDER BY t.ticket_id ASC;
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        headers = ["ID", "Ticket No", "User", "Category", "Priority", "Title", "Status", "Assigned To", "Created"]
        print_table(headers, rows)

        # Detailed ticket view option
        sub_choice = input("Enter Ticket ID to view full timeline/details (or press Enter to return): ").strip()
        if sub_choice.isdigit():
            view_ticket_details(conn, int(sub_choice))

    except Error as e:
        print(f"\n[DATABASE ERROR] Failed to fetch tickets: {e}")
    finally:
        cursor.close()


def view_ticket_details(conn, ticket_id):
    """View complete history, subtype info, and resolution for a specific ticket."""
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT t.*, u.name as user_name, u.email as user_email, 
                   c.name as category_name, p.name as priority_name
            FROM tickets t
            JOIN users u ON t.user_id = u.user_id
            JOIN categories c ON t.category_id = c.category_id
            JOIN priorities p ON t.priority_id = p.priority_id
            WHERE t.ticket_id = %s
        """, (ticket_id,))
        ticket = cursor.fetchone()
        if not ticket:
            print(f"[ERROR] Ticket ID {ticket_id} not found.")
            return

        print_header(f"Ticket Details: {ticket['ticket_no']}")
        print(f"ID:          {ticket['ticket_id']}")
        print(f"User:        {ticket['user_name']} ({ticket['user_email']})")
        print(f"Category:    {ticket['category_name']}")
        print(f"Priority:    {ticket['priority_name']}")
        print(f"Status:      {ticket['status']}")
        print(f"Title:       {ticket['title']}")
        print(f"Description: {ticket['description']}")
        print(f"Created At:  {ticket['created_at']}")

        # Subtype details
        cursor.execute("SELECT incident_type FROM incidents WHERE ticket_id = %s", (ticket_id,))
        inc = cursor.fetchone()
        if inc:
            print(f"Type:        Incident ({inc['incident_type']})")

        cursor.execute("SELECT request_type FROM service_requests WHERE ticket_id = %s", (ticket_id,))
        srv = cursor.fetchone()
        if srv:
            print(f"Type:        Service Request ({srv['request_type']})")

        # Resolution details
        cursor.execute("SELECT description, resolved_at FROM resolutions WHERE ticket_id = %s", (ticket_id,))
        res = cursor.fetchone()
        if res:
            print(f"\n--- Resolution ---")
            print(f"Resolved At: {res['resolved_at']}")
            print(f"Solution:    {res['description']}")

        # Status History
        cursor.execute("""
            SELECT old_status, new_status, changed_at 
            FROM status_histories 
            WHERE ticket_id = %s 
            ORDER BY changed_at ASC
        """, (ticket_id,))
        history = cursor.fetchall()
        if history:
            print(f"\n--- Status History ---")
            for h in history:
                print(f"  [{h['changed_at']}] {h['old_status']} -> {h['new_status']}")

        # Assignments
        cursor.execute("""
            SELECT s.name, s.specialization, a.assigned_at 
            FROM assignments a 
            JOIN support_staff s ON a.staff_id = s.staff_id
            WHERE a.ticket_id = %s
            ORDER BY a.assigned_at ASC
        """, (ticket_id,))
        assignments = cursor.fetchall()
        if assignments:
            print(f"\n--- Assigned Support Engineers ---")
            for a in assignments:
                print(f"  [{a['assigned_at']}] {a['name']} ({a['specialization']})")

    except Error as e:
        print(f"\n[DATABASE ERROR] Failed to fetch ticket details: {e}")
    finally:
        cursor.close()


# ==========================================================
# 4. ASSIGN TICKET
# ==========================================================
def assign_ticket(conn):
    print_header("Assign Ticket to Support Staff")
    cursor = conn.cursor(dictionary=True)
    try:
        # Show Open or In Progress Tickets
        cursor.execute("""
            SELECT t.ticket_id, t.ticket_no, t.title, t.status, p.name AS priority
            FROM tickets t
            JOIN priorities p ON t.priority_id = p.priority_id
            WHERE t.status IN ('Open', 'In Progress', 'Pending')
            ORDER BY t.ticket_id ASC
        """)
        open_tickets = cursor.fetchall()
        if not open_tickets:
            print("\nNo open/in-progress tickets to assign.")
            return

        print("\nActive Tickets:")
        for t in open_tickets:
            print(f"  [{t['ticket_id']}] {t['ticket_no']} - {t['title']} (Status: {t['status']}, Priority: {t['priority']})")

        ticket_id = int(input("\nEnter Ticket ID to assign: ").strip())

        # Check ticket exists
        cursor.execute("SELECT ticket_id, status FROM tickets WHERE ticket_id = %s", (ticket_id,))
        ticket = cursor.fetchone()
        if not ticket:
            print("[ERROR] Ticket not found.")
            return

        # Show Support Staff
        cursor.execute("SELECT staff_id, name, specialization FROM support_staff ORDER BY staff_id")
        staff_members = cursor.fetchall()
        print("\nAvailable Support Staff:")
        for s in staff_members:
            print(f"  [{s['staff_id']}] {s['name']} - Specialization: {s['specialization']}")

        staff_id = int(input("\nSelect Staff ID: ").strip())

        # Insert Assignment
        cursor.execute(
            "INSERT INTO assignments (ticket_id, staff_id) VALUES (%s, %s)",
            (ticket_id, staff_id)
        )

        # If current status is 'Open', transition to 'In Progress'
        if ticket['status'] == 'Open':
            cursor.execute("UPDATE tickets SET status = 'In Progress' WHERE ticket_id = %s", (ticket_id,))
            cursor.execute(
                "INSERT INTO status_histories (ticket_id, old_status, new_status) VALUES (%s, %s, %s)",
                (ticket_id, "Open", "In Progress")
            )
            print(f"[STATUS] Ticket status automatically transitioned from 'Open' to 'In Progress'.")

        conn.commit()
        print(f"\n[SUCCESS] Ticket ID {ticket_id} successfully assigned to Staff ID {staff_id}.")

    except Error as e:
        conn.rollback()
        print(f"\n[DATABASE ERROR] Assignment failed: {e}")
    except ValueError:
        print("\n[INPUT ERROR] Please enter valid numeric IDs.")
    finally:
        cursor.close()


# ==========================================================
# 5. UPDATE TICKET STATUS
# ==========================================================
def update_ticket_status(conn):
    print_header("Update Ticket Status")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT ticket_id, ticket_no, title, status FROM tickets ORDER BY ticket_id ASC")
        tickets = cursor.fetchall()
        print("\nAll Tickets:")
        for t in tickets:
            print(f"  [{t['ticket_id']}] {t['ticket_no']} - {t['title']} (Current: {t['status']})")

        ticket_id = int(input("\nEnter Ticket ID: ").strip())

        cursor.execute("SELECT ticket_id, status FROM tickets WHERE ticket_id = %s", (ticket_id,))
        ticket = cursor.fetchone()
        if not ticket:
            print("[ERROR] Ticket not found.")
            return

        old_status = ticket["status"]
        valid_statuses = ["Open", "In Progress", "Pending", "Resolved", "Closed", "Cancelled"]

        print(f"\nCurrent Status: {old_status}")
        print("Select New Status:")
        for i, s in enumerate(valid_statuses, start=1):
            print(f"  [{i}] {s}")

        choice = input("Choice (1-6): ").strip()
        if not (choice.isdigit() and 1 <= int(choice) <= len(valid_statuses)):
            print("[ERROR] Invalid status selection.")
            return

        new_status = valid_statuses[int(choice) - 1]

        if old_status == new_status:
            print(f"[INFO] Ticket is already in '{new_status}' status.")
            return

        # Update tickets table
        cursor.execute("UPDATE tickets SET status = %s WHERE ticket_id = %s", (new_status, ticket_id))

        # Insert status history record
        cursor.execute(
            "INSERT INTO status_histories (ticket_id, old_status, new_status) VALUES (%s, %s, %s)",
            (ticket_id, old_status, new_status)
        )

        conn.commit()
        print(f"\n[SUCCESS] Ticket {ticket_id} updated: {old_status} -> {new_status}")

    except Error as e:
        conn.rollback()
        print(f"\n[DATABASE ERROR] Failed to update ticket status: {e}")
    except ValueError:
        print("\n[INPUT ERROR] Invalid numeric input.")
    finally:
        cursor.close()


# ==========================================================
# 6. RESOLVE TICKET
# ==========================================================
def resolve_ticket(conn):
    print_header("Resolve Ticket")
    cursor = conn.cursor(dictionary=True)
    try:
        # Show unresolved tickets
        cursor.execute("""
            SELECT ticket_id, ticket_no, title, status 
            FROM tickets 
            WHERE status NOT IN ('Resolved', 'Closed', 'Cancelled')
            ORDER BY ticket_id ASC
        """)
        tickets = cursor.fetchall()
        if not tickets:
            print("\nNo pending tickets available for resolution.")
            return

        print("\nPending Tickets:")
        for t in tickets:
            print(f"  [{t['ticket_id']}] {t['ticket_no']} - {t['title']} ({t['status']})")

        ticket_id = int(input("\nEnter Ticket ID to resolve: ").strip())

        cursor.execute("SELECT ticket_id, status FROM tickets WHERE ticket_id = %s", (ticket_id,))
        ticket = cursor.fetchone()
        if not ticket:
            print("[ERROR] Ticket not found.")
            return

        old_status = ticket["status"]

        resolution_text = input("\nEnter Resolution Summary / Fix Description: ").strip()
        if not resolution_text:
            print("[ERROR] Resolution description cannot be empty.")
            return

        # Upsert Resolution
        cursor.execute("""
            INSERT INTO resolutions (ticket_id, description, resolved_at)
            VALUES (%s, %s, NOW())
            ON DUPLICATE KEY UPDATE description = VALUES(description), resolved_at = NOW()
        """, (ticket_id, resolution_text))

        # Update Ticket Status
        cursor.execute("UPDATE tickets SET status = 'Resolved' WHERE ticket_id = %s", (ticket_id,))

        # Add Status History
        cursor.execute(
            "INSERT INTO status_histories (ticket_id, old_status, new_status) VALUES (%s, %s, %s)",
            (ticket_id, old_status, "Resolved")
        )

        conn.commit()
        print(f"\n[SUCCESS] Ticket ID {ticket_id} marked as 'Resolved' and resolution logged.")

    except Error as e:
        conn.rollback()
        print(f"\n[DATABASE ERROR] Failed to resolve ticket: {e}")
    except ValueError:
        print("\n[INPUT ERROR] Invalid numeric input.")
    finally:
        cursor.close()


# ==========================================================
# 7. VIEW ASSETS
# ==========================================================
def view_assets(conn):
    print_header("View Assets")
    cursor = conn.cursor()
    try:
        query = """
            SELECT 
                a.asset_id,
                a.asset_tag,
                a.name AS asset_name,
                a.serial_no,
                COALESCE(u.name, 'In Stock / Unassigned') AS assigned_user,
                c.name AS category,
                COALESCE(w.provider, 'No Warranty') AS warranty_provider,
                COALESCE(DATE_FORMAT(w.end_date, '%Y-%m-%d'), 'N/A') AS warranty_expires
            FROM assets a
            LEFT JOIN users u ON a.user_id = u.user_id
            JOIN categories c ON a.category_id = c.category_id
            LEFT JOIN warranties w ON a.warranty_id = w.warranty_id
            ORDER BY a.asset_id ASC;
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        headers = ["ID", "Asset Tag", "Asset Name", "Serial No", "Assigned User", "Category", "Warranty Provider", "Warranty Expiry"]
        print_table(headers, rows)

        # Option to view maintenance log for an asset
        sub_choice = input("Enter Asset ID to view maintenance history (or press Enter to return): ").strip()
        if sub_choice.isdigit():
            view_asset_maintenance(conn, int(sub_choice))

    except Error as e:
        print(f"\n[DATABASE ERROR] Failed to fetch assets: {e}")
    finally:
        cursor.close()


def view_asset_maintenance(conn, asset_id):
    """View maintenance records for an asset."""
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT asset_tag, name FROM assets WHERE asset_id = %s", (asset_id,))
        asset = cursor.fetchone()
        if not asset:
            print(f"[ERROR] Asset ID {asset_id} not found.")
            return

        cursor.execute("""
            SELECT maintenance_id, maintenance_date, description, cost
            FROM maintenance
            WHERE asset_id = %s
            ORDER BY maintenance_date DESC
        """, (asset_id,))
        records = cursor.fetchall()

        print_header(f"Maintenance Log: {asset['asset_tag']} ({asset['name']})")
        if not records:
            print("\nNo maintenance records found for this asset.")
            return

        rows = [[r['maintenance_id'], str(r['maintenance_date']), r['description'], f"${r['cost']:.2f}"] for r in records]
        headers = ["Maint ID", "Date", "Description", "Cost"]
        print_table(headers, rows)

    except Error as e:
        print(f"\n[DATABASE ERROR] Failed to fetch maintenance logs: {e}")
    finally:
        cursor.close()


# ==========================================================
# MAIN MENU LOOP
# ==========================================================
def main():
    print("\n" + "=" * 65)
    print(" IT HELPDESK & ASSET SUPPORT MANAGEMENT SYSTEM")
    print(" Database Management System Project")
    print("=" * 65)

    conn = get_connection()
    if not conn:
        print("\nExiting application. Please configure your MySQL connection.")
        sys.exit(1)

    while True:
        print("\n" + "-" * 40)
        print("           MAIN MENU")
        print("-" * 40)
        print(" 1. Register Asset")
        print(" 2. Create Ticket")
        print(" 3. View Tickets")
        print(" 4. Assign Ticket")
        print(" 5. Update Ticket Status")
        print(" 6. Resolve Ticket")
        print(" 7. View Assets")
        print(" 8. Exit")
        print("-" * 40)

        choice = input("Enter choice (1-8): ").strip()

        if choice == "1":
            register_asset(conn)
        elif choice == "2":
            create_ticket(conn)
        elif choice == "3":
            view_tickets(conn)
        elif choice == "4":
            assign_ticket(conn)
        elif choice == "5":
            update_ticket_status(conn)
        elif choice == "6":
            resolve_ticket(conn)
        elif choice == "7":
            view_assets(conn)
        elif choice == "8":
            print("\nClosing database connection...")
            if conn and conn.is_connected():
                conn.close()
            print("Thank you for using IT Helpdesk & Asset Support Management System!")
            print("Exiting.\n")
            break
        else:
            print("\n[INVALID INPUT] Please select a number from 1 to 8.")


if __name__ == "__main__":
    main()
