#!/usr/bin/env python3
"""
Automated Screenshot Capture Script for Presentation-III
IT Helpdesk & Asset Support Management System
Uses headless Google Chrome to capture pixel-perfect, authentic UI screenshots.
"""

import os
import subprocess
import time
import json
import urllib.request

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE_URL = "http://127.0.0.1:5050"
OUT_DIR = "Presentation-III/screenshots"

os.makedirs(OUT_DIR, exist_ok=True)

def snap(url, output_filename, delay=1.8, window_size="1440,900"):
    dest = os.path.join(OUT_DIR, output_filename)
    cmd = [
        CHROME_BIN,
        "--headless",
        "--disable-gpu",
        f"--window-size={window_size}",
        f"--screenshot={dest}",
        f"--virtual-time-budget={int(delay * 1000)}",
        url
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"[OK] Captured: {output_filename} ({os.path.getsize(dest)} bytes)")

def api_post(endpoint, payload):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def api_delete(endpoint):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method='DELETE')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def run():
    print("Capturing Presentation-III Screenshots from live running MySQL application...\n")

    # 1. Dashboard
    snap(f"{BASE_URL}/", "dashboard.png")

    # 2. Database Connected Header
    snap(f"{BASE_URL}/", "database-connected.png", window_size="1440,500")

    # 3. Tickets View (Before Insert)
    snap(f"{BASE_URL}/?view=tickets", "tickets-view.png")
    snap(f"{BASE_URL}/?view=tickets", "ticket-before-insert.png")

    # 4. Ticket Insert Form Modal
    snap(f"{BASE_URL}/?view=tickets&modal=ticket", "ticket-insert-form.png")

    # 5. Insert Live Record in MySQL for Before/After Demonstration
    print("\nInserting live demonstration ticket (TKT-006)...")
    ticket_data = api_post("/api/tickets", {
        "user_id": 1,
        "category_id": 1,
        "priority_id": 3,
        "ticket_type": "Incident",
        "subtype_detail": "Hardware Malfunction",
        "title": "USB-C Port Not Recognizing External Display",
        "description": "Primary laptop dock loses video output intermittently upon connecting USB-C monitor."
    })
    new_ticket_id = ticket_data.get("ticket_id")
    print(f"Inserted: {ticket_data.get('ticket_no')} with ID: {new_ticket_id}")

    # 6. Ticket After Insert
    time.sleep(1)
    snap(f"{BASE_URL}/?view=tickets", "ticket-after-insert.png")

    # 7. Ticket Before Delete (Delete Confirmation Modal)
    snap(f"{BASE_URL}/?view=tickets&modal=delete&ticket_id={new_ticket_id}", "ticket-before-delete.png")

    # 8. Delete Live Record from MySQL
    print(f"\nDeleting live demonstration ticket (ID: {new_ticket_id})...")
    del_res = api_delete(f"/api/tickets/{new_ticket_id}")
    print(del_res.get("message"))

    # 9. Ticket After Delete
    time.sleep(1)
    snap(f"{BASE_URL}/?view=tickets", "ticket-after-delete.png")

    # 10. Users View
    snap(f"{BASE_URL}/?view=users", "users-view.png")

    # 11. Assets View
    snap(f"{BASE_URL}/?view=assets", "assets-view.png")


    print("\nAll 10 required Presentation-III screenshots successfully captured and saved to Presentation-III/screenshots/!")

if __name__ == "__main__":
    run()
