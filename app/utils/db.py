from app.extensions import mysql


def get_connection():
    return mysql.connection


def query(sql, params=None):
    """Run a SELECT and return a list of dict rows."""
    cur = mysql.connection.cursor()
    try:
        cur.execute(sql, params or ())
        columns = [col[0] for col in cur.description]
        rows = cur.fetchall()
        return [dict(zip(columns, row)) for row in rows]
    finally:
        cur.close()


def query_one(sql, params=None):
    """Run a SELECT and return a single dict row or None."""
    rows = query(sql, params)
    return rows[0] if rows else None


def execute(sql, params=None):
    """Run an INSERT/UPDATE/DELETE and return rowcount."""
    cur = mysql.connection.cursor()
    try:
        cur.execute(sql, params or ())
        return cur.rowcount
    finally:
        cur.close()


def execute_many(sql, params_list):
    """Run executemany and return the cursor (for lastrowid/rowcount)."""
    cur = mysql.connection.cursor()
    try:
        if params_list:
            cur.executemany(sql, params_list)
        return cur
    finally:
        cur.close()


def insert_and_get_id(sql, params=None):
    """Run an INSERT and return the new row id."""
    cur = mysql.connection.cursor()
    try:
        cur.execute(sql, params or ())
        return cur.lastrowid
    finally:
        cur.close()


def commit():
    mysql.connection.commit()


def rollback():
    mysql.connection.rollback()
