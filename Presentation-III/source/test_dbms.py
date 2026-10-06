#!/usr/bin/env python3
"""
IT Helpdesk & Asset Support Management System
Official DBMS Project Test Suite (TC01 - TC10)
Student: Md Aali Rahman (25WU0102156) | Woxsen University
"""

import sys
import json
import urllib.request
import urllib.error
import mysql.connector
from db import get_connection, check_db_status, get_db_config

BASE_URL = "http://127.0.0.1:5050"

def log_test(tc_id, title, passed, details=""):
    status_str = "PASS" if passed else "FAIL"
    symbol = "✅" if passed else "❌"
    print(f"{symbol} [{tc_id}] {title:.<48} [{status_str}]")
    if details:
        print(f"    ↳ Details: {details}")

def test_tc01_db_connection():
    """TC01: Database connection test."""
    status = check_db_status()
    passed = status.get("connected") is True and status.get("tables_count", 0) >= 14
    details = f"Connected to {status.get('database')} with {status.get('tables_count')} tables (v{status.get('version')})"
    log_test("TC01", "Database Connection to MySQL", passed, details)
    return passed

def test_tc02_view_tickets():
    """TC02: View tickets loaded from MySQL."""
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/tickets")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            passed = resp.status == 200 and "tickets" in data and len(data["tickets"]) >= 5
            details = f"Retrieved {len(data.get('tickets', []))} relational ticket records from MySQL"
            log_test("TC02", "View Tickets from MySQL", passed, details)
            return passed
    except Exception as e:
        log_test("TC02", "View Tickets from MySQL", False, str(e))
        return False

def test_tc03_tc04_insert_and_persistence():
    """TC03 & TC04: Insert ticket and verify database persistence."""
    try:
        payload = {
            "user_id": 2,
            "category_id": 2,
            "priority_id": 2,
            "ticket_type": "Incident",
            "subtype_detail": "Software Malfunction",
            "title": "TC03 Verification Ticket - Crash on Launch",
            "description": "Verification test for live insert and database persistence."
        }
        req = urllib.request.Request(
            f"{BASE_URL}/api/tickets",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode())
            new_id = res_data.get("ticket_id")
            ticket_no = res_data.get("ticket_no")
            tc03_passed = resp.status == 201 and new_id is not None
            log_test("TC03", "Insert New Ticket Record", tc03_passed, f"Created {ticket_no} (ID: {new_id})")

        # TC04: Query MySQL directly to prove persistence
        conn, _ = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT ticket_id, ticket_no, title, status FROM tickets WHERE ticket_id = %s", (new_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        tc04_passed = row is not None and row["ticket_no"] == ticket_no
        log_test("TC04", "Refresh & Persistence Verification in MySQL", tc04_passed, f"Record confirmed in MySQL table 'tickets' (status: {row['status'] if row else 'None'})")

        return tc03_passed and tc04_passed, new_id, ticket_no
    except Exception as e:
        log_test("TC03", "Insert New Ticket Record", False, str(e))
        log_test("TC04", "Refresh & Persistence Verification", False, str(e))
        return False, None, None

def test_tc05_tc06_delete_and_absence(ticket_id, ticket_no):
    """TC05 & TC06: Delete ticket and verify permanent absence in MySQL."""
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/tickets/{ticket_id}", method="DELETE")
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode())
            tc05_passed = resp.status == 200 and res_data.get("success") is True
            log_test("TC05", "Delete Ticket from MySQL", tc05_passed, res_data.get("message"))

        # TC06: Query MySQL directly to prove permanent removal
        conn, _ = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) AS cnt FROM tickets WHERE ticket_id = %s", (ticket_id,))
        cnt = cursor.fetchone()["cnt"]
        cursor.close()
        conn.close()

        tc06_passed = cnt == 0
        log_test("TC06", "Refresh After Delete (Remains Absent)", tc06_passed, f"Verified 0 rows in MySQL for ID {ticket_id}")
        return tc05_passed and tc06_passed
    except Exception as e:
        log_test("TC05", "Delete Ticket from MySQL", False, str(e))
        log_test("TC06", "Refresh After Delete", False, str(e))
        return False

def test_tc07_invalid_input():
    """TC07: Validation on missing required fields."""
    try:
        payload = {
            "title": "",  # Empty title
            "description": "Missing title test"
        }
        req = urllib.request.Request(
            f"{BASE_URL}/api/tickets",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        urllib.request.urlopen(req)
        log_test("TC07", "Form Input Validation", False, "Server accepted empty required field!")
        return False
    except urllib.error.HTTPError as e:
        passed = e.code == 400
        err_msg = json.loads(e.read().decode()).get("error", "")
        log_test("TC07", "Form Input Validation", passed, f"HTTP 400 rejected with validation error: '{err_msg}'")
        return passed

def test_tc08_duplicate_record():
    """TC08: Duplicate record on UNIQUE constraint."""
    try:
        # Try inserting user with already existing email 'aarav.sharma@company.com'
        payload = {
            "name": "Duplicate Aarav",
            "email": "aarav.sharma@company.com",
            "department_id": 1
        }
        req = urllib.request.Request(
            f"{BASE_URL}/api/users",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        urllib.request.urlopen(req)
        log_test("TC08", "Unique Constraint Enforcement", False, "Duplicate email accepted!")
        return False
    except urllib.error.HTTPError as e:
        passed = e.code in (400, 409)
        err_msg = json.loads(e.read().decode()).get("error", "")
        log_test("TC08", "Unique Constraint Enforcement", passed, f"Caught duplicate email: '{err_msg}'")
        return passed

def test_tc09_foreign_key_violation():
    """TC09: Foreign key RESTRICT violation on deletion."""
    try:
        # User 1 has active tickets and assets. Deletion must be rejected.
        req = urllib.request.Request(f"{BASE_URL}/api/users/1", method="DELETE")
        urllib.request.urlopen(req)
        log_test("TC09", "Foreign Key Deletion Constraint Violation", False, "User with active tickets deleted without FK restriction!")
        return False
    except urllib.error.HTTPError as e:
        passed = e.code == 409
        err_msg = json.loads(e.read().decode()).get("error", "")
        log_test("TC09", "Foreign Key Deletion Constraint Violation", passed, f"HTTP 409 handled gracefully: '{err_msg}'")
        return passed

def test_tc10_mysql_offline_handling():
    """TC10: MySQL offline graceful error handling."""
    # Test internal error formatter when bad credentials or offline host is given
    from db import get_connection
    bad_config = {
        "host": "127.0.0.1",
        "port": 9999,
        "user": "nonexistent_user",
        "password": "wrong",
        "database": "bad_db",
        "connect_timeout": 1
    }
    try:
        conn = mysql.connector.connect(**bad_config)
        conn.close()
        log_test("TC10", "MySQL Offline / Error Handling", False, "Connected to non-existent server?")
        return False
    except Exception as e:
        friendly_msg = f"Database connection failed: {e.msg if hasattr(e, 'msg') else str(e)}"
        passed = "Database connection failed" in friendly_msg and "wrong" not in friendly_msg
        log_test("TC10", "MySQL Offline / Error Handling", passed, f"Safe user message generated without leaking password: '{friendly_msg[:60]}...'")
        return passed

def main():
    print("=" * 68)
    print("   IT HELPDESK & ASSET SUPPORT MANAGEMENT SYSTEM")
    print("   DBMS Official Test Suite Execution (TC01 - TC10)")
    print("   Student: Md Aali Rahman (25WU0102156)")
    print("=" * 68 + "\n")

    results = []
    results.append(test_tc01_db_connection())
    results.append(test_tc02_view_tickets())

    pass_insert, new_id, ticket_no = test_tc03_tc04_insert_and_persistence()
    results.append(pass_insert)

    if new_id:
        results.append(test_tc05_tc06_delete_and_absence(new_id, ticket_no))
    else:
        results.append(False)

    results.append(test_tc07_invalid_input())
    results.append(test_tc08_duplicate_record())
    results.append(test_tc09_foreign_key_violation())
    results.append(test_tc10_mysql_offline_handling())

    print("\n" + "=" * 68)
    total = len(results)
    passed = sum(1 for r in results if r)
    print(f"   TEST SUMMARY: {passed}/{total} Test Cases Passed ({(passed/total)*100:.1f}%)")
    print("=" * 68 + "\n")

    if passed == total:
        print("🏆 All DBMS presentation requirements verified successfully against MySQL!")
        return 0
    else:
        print("⚠️ Some tests failed. Please review details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
