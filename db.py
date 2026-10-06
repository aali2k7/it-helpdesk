#!/usr/bin/env python3
"""
IT Helpdesk & Asset Support Management System
Database Connection and Query Helpers
"""

import os
import mysql.connector
from mysql.connector import Error

# -----------------------------------------------------------------------------
# Load environment variables from .env if present (without external dependencies)
# -----------------------------------------------------------------------------
def load_env_file(filepath=".env"):
    """Simple .env file loader that sets os.environ if key is not already set."""
    if not os.path.exists(filepath):
        return
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    if key and key not in os.environ:
                        os.environ[key] = val
    except Exception:
        pass

load_env_file()

def get_db_config():
    """Retrieve database connection settings from environment."""
    return {
        "host": os.environ.get("DB_HOST", "localhost"),
        "port": int(os.environ.get("DB_PORT", 3306)),
        "user": os.environ.get("DB_USER", "root"),
        "password": os.environ.get("DB_PASSWORD", ""),
        "database": os.environ.get("DB_NAME", "it_helpdesk"),
        "charset": "utf8mb4",
        "collation": "utf8mb4_unicode_ci",
        "connect_timeout": 5,
    }


def get_connection():
    """
    Establish and return a live MySQL connection with autocommit disabled.
    Returns (conn, None) on success or (None, error_message) on failure.
    """
    config = get_db_config()
    try:
        conn = mysql.connector.connect(**config)
        conn.autocommit = False
        return conn, None
    except Error as e:
        safe_msg = f"Database connection failed: {e.msg if hasattr(e, 'msg') else str(e)}"
        return None, safe_msg
    except Exception as e:
        return None, f"Database connection failed: {str(e)}"


def check_db_status():
    """
    Perform a live health-check on MySQL and return status details.
    Does not expose sensitive credentials in response.
    """
    config = get_db_config()
    conn, err = get_connection()
    if not conn:
        return {
            "connected": False,
            "error": err or "Database connection failed. Please ensure MySQL is running and credentials in .env are configured.",
            "database": config["database"],
            "host": config["host"],
            "port": config["port"],
            "user": config["user"],
        }

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT VERSION() AS db_version, DATABASE() AS current_db")
        info = cursor.fetchone() or {}

        # Fetch table count
        cursor.execute("""
            SELECT COUNT(*) AS table_count 
            FROM information_schema.tables 
            WHERE table_schema = %s
        """, (config["database"],))
        tc = cursor.fetchone()
        table_count = tc["table_count"] if tc else 0

        cursor.close()
        conn.close()

        return {
            "connected": True,
            "database": info.get("current_db", config["database"]),
            "version": info.get("db_version", "MySQL 8.0+"),
            "host": config["host"],
            "port": config["port"],
            "user": config["user"],
            "tables_count": table_count,
            "message": "MySQL Connected"
        }
    except Exception as e:
        if conn and conn.is_connected():
            conn.close()
        return {
            "connected": False,
            "error": f"Error querying database: {str(e)}",
            "database": config["database"],
            "host": config["host"],
            "port": config["port"],
            "user": config["user"],
        }
