# Migrations

Keep every teammate's database in sync without manual changes.

## How it works

- `database.sql` is the **base schema** (run once for a fresh install).
- Every schema change after that is a small, numbered `.sql` file here:
  `NNNN_short_description.sql` (start from `0002_`, since `0001` = database.sql baseline).
- `python run_migrations.py` applies any files not yet applied, in order,
  and records each in the `schema_migrations` table. Reruns are safe.

## To add a schema change

```sql
-- migrations/0002_add_example.sql
ALTER TABLE students ADD COLUMN phone VARCHAR(15) DEFAULT NULL;
```

1. Name the file `0002_add_example.sql` (next free number).
2. Commit it to git.
3. Teammates run `git pull` then `python run_migrations.py`.

## Common commands

```bash
python run_migrations.py          # apply pending migrations
python run_migrations.py --dry-run  # preview without applying
```
