"""Valida a migração de identidade em schemas descartáveis."""

import os
from pathlib import Path
from uuid import uuid4

import psycopg
import pytest
from psycopg import sql

MIGRATIONS = Path(__file__).resolve().parents[1] / "migrations"


@pytest.mark.parametrize("with_existing_ticket", [False, True])
def test_unit_identity_migration(with_existing_ticket):
    url = os.getenv("TEST_DATABASE_URL")
    if not url:
        pytest.skip("Configure TEST_DATABASE_URL para testar PostgreSQL.")

    schema = sql.Identifier(f"test_identity_{uuid4().hex}")
    with psycopg.connect(url, autocommit=True) as conn:
        conn.execute(sql.SQL("CREATE SCHEMA {}").format(schema))
        try:
            conn.execute(sql.SQL("SET search_path TO {}").format(schema))

            def apply(name):
                conn.execute((MIGRATIONS / name).read_text(encoding="utf-8-sig"))

            apply("001_create_queues.sql")
            apply("002_create_tickets.sql")
            if with_existing_ticket:
                apply("seed_demo.sql")
                conn.execute("""
                    INSERT INTO tickets (queue_id, customer_name, service_name, is_priority, status)
                    VALUES ('clinica-vida', 'Pessoa fictícia', 'Teste', true, 'active')
                """)
            before = conn.execute("SELECT * FROM tickets").fetchall()

            apply("003_create_unit_identity.sql")
            if with_existing_ticket:
                assert conn.execute("SELECT * FROM queue_units").fetchall() == [
                    ("clinica-vida", "legacy:clinica-vida")
                ]
            apply("seed_unit_identity_demo.sql")
            apply("003_create_unit_identity.sql")
            apply("seed_unit_identity_demo.sql")

            assert conn.execute("SELECT * FROM tickets").fetchall() == before
            assert conn.execute("SELECT count(*) FROM units").fetchone() == (2,)
            assert conn.execute("SELECT count(*) FROM queue_units").fetchone() == (2,)
            assert conn.execute("SELECT count(*) FROM accounts WHERE is_active").fetchone() == (0,)
            assert conn.execute("""
                SELECT unit_id, role FROM unit_memberships
                WHERE account_id = 'demo-multi' ORDER BY unit_id
            """).fetchall() == [("demo:norte", "professional"), ("legacy:clinica-vida", "admin")]
        finally:
            conn.rollback()
            conn.execute(sql.SQL("DROP SCHEMA {} CASCADE").format(schema))
