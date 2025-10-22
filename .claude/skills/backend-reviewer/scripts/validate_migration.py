#!/usr/bin/env python3
"""
Migration Safety Validator

Checks PostgreSQL migration files for common dangerous patterns.

Usage:
    python validate_migration.py <migration_file.sql>

Example:
    python validate_migration.py migrations/20240101_add_category.sql
"""

import sys
import re
from pathlib import Path
from typing import List, Tuple

class MigrationIssue:
    def __init__(self, severity: str, line_num: int, message: str, suggestion: str = ""):
        self.severity = severity  # "ERROR", "WARNING", "INFO"
        self.line_num = line_num
        self.message = message
        self.suggestion = suggestion

def check_dangerous_drops(sql: str, line_num: int) -> List[MigrationIssue]:
    """Check for DROP commands without safeguards."""
    issues = []

    # DROP TABLE without IF EXISTS
    if re.search(r'DROP\s+TABLE\s+(?!IF\s+EXISTS)', sql, re.IGNORECASE):
        issues.append(MigrationIssue(
            "WARNING",
            line_num,
            "DROP TABLE without IF EXISTS can fail if table doesn't exist",
            "Use: DROP TABLE IF EXISTS table_name;"
        ))

    # DROP COLUMN
    if re.search(r'DROP\s+COLUMN\s+', sql, re.IGNORECASE):
        issues.append(MigrationIssue(
            "ERROR",
            line_num,
            "DROP COLUMN is irreversible and can cause data loss",
            "Consider: 1) Rename column first, 2) Monitor for a period, 3) Then drop if safe"
        ))

    return issues

def check_not_null_additions(sql: str, line_num: int) -> List[MigrationIssue]:
    """Check for NOT NULL on existing columns."""
    issues = []

    # Adding NOT NULL constraint without default
    if re.search(r'ADD\s+COLUMN\s+\w+\s+\w+\s+NOT\s+NULL(?!\s+DEFAULT)', sql, re.IGNORECASE):
        issues.append(MigrationIssue(
            "ERROR",
            line_num,
            "Adding NOT NULL column without DEFAULT will fail on existing rows",
            "Use: ADD COLUMN col_name TYPE NOT NULL DEFAULT 'value';"
        ))

    # ALTER COLUMN SET NOT NULL
    if re.search(r'ALTER\s+COLUMN\s+\w+\s+SET\s+NOT\s+NULL', sql, re.IGNORECASE):
        issues.append(MigrationIssue(
            "WARNING",
            line_num,
            "Setting NOT NULL on existing column requires data backfill",
            "1) Backfill NULL values first, 2) Then SET NOT NULL"
        ))

    return issues

def check_index_creation(sql: str, line_num: int) -> List[MigrationIssue]:
    """Check for blocking index creation."""
    issues = []

    # CREATE INDEX without CONCURRENTLY
    if re.search(r'CREATE\s+INDEX\s+(?!CONCURRENTLY)', sql, re.IGNORECASE):
        issues.append(MigrationIssue(
            "WARNING",
            line_num,
            "CREATE INDEX without CONCURRENTLY locks the table",
            "Use: CREATE INDEX CONCURRENTLY idx_name ON table(column);"
        ))

    return issues

def check_type_changes(sql: str, line_num: int) -> List[MigrationIssue]:
    """Check for type changes that require table rewrites."""
    issues = []

    # ALTER COLUMN TYPE
    if re.search(r'ALTER\s+COLUMN\s+\w+\s+TYPE\s+', sql, re.IGNORECASE):
        issues.append(MigrationIssue(
            "WARNING",
            line_num,
            "ALTER COLUMN TYPE may require table rewrite and lock",
            "Some type changes are safe (e.g., VARCHAR to TEXT), others require rewrite"
        ))

    return issues

def check_foreign_keys(sql: str, line_num: int) -> List[MigrationIssue]:
    """Check for foreign key additions without validation."""
    issues = []

    # ADD FOREIGN KEY without NOT VALID
    if re.search(r'ADD\s+(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY', sql, re.IGNORECASE):
        if not re.search(r'NOT\s+VALID', sql, re.IGNORECASE):
            issues.append(MigrationIssue(
                "INFO",
                line_num,
                "Adding FOREIGN KEY locks table during validation",
                "Consider: ADD FOREIGN KEY ... NOT VALID; then VALIDATE CONSTRAINT separately"
            ))

    return issues

def analyze_migration(file_path: Path) -> List[MigrationIssue]:
    """Analyze a migration file for potential issues."""
    if not file_path.exists():
        return [MigrationIssue("ERROR", 0, f"File not found: {file_path}", "")]

    issues = []

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        return [MigrationIssue("ERROR", 0, f"Failed to read file: {e}", "")]

    for line_num, line in enumerate(lines, start=1):
        sql = line.strip()

        if not sql or sql.startswith('--'):
            continue

        # Run all checks
        issues.extend(check_dangerous_drops(sql, line_num))
        issues.extend(check_not_null_additions(sql, line_num))
        issues.extend(check_index_creation(sql, line_num))
        issues.extend(check_type_changes(sql, line_num))
        issues.extend(check_foreign_keys(sql, line_num))

    return issues

def print_report(issues: List[MigrationIssue], file_path: Path):
    """Print a formatted report of issues found."""
    print("\n" + "="*60)
    print(f"🔍 MIGRATION VALIDATION: {file_path.name}")
    print("="*60)

    if not issues:
        print("\n✅ No issues found! Migration looks safe.")
        print("="*60 + "\n")
        return

    # Group by severity
    errors = [i for i in issues if i.severity == "ERROR"]
    warnings = [i for i in issues if i.severity == "WARNING"]
    infos = [i for i in issues if i.severity == "INFO"]

    if errors:
        print(f"\n❌ ERRORS ({len(errors)}):")
        for issue in errors:
            print(f"   Line {issue.line_num}: {issue.message}")
            if issue.suggestion:
                print(f"   💡 {issue.suggestion}")
            print()

    if warnings:
        print(f"\n⚠️  WARNINGS ({len(warnings)}):")
        for issue in warnings:
            print(f"   Line {issue.line_num}: {issue.message}")
            if issue.suggestion:
                print(f"   💡 {issue.suggestion}")
            print()

    if infos:
        print(f"\nℹ️  INFORMATION ({len(infos)}):")
        for issue in infos:
            print(f"   Line {issue.line_num}: {issue.message}")
            if issue.suggestion:
                print(f"   💡 {issue.suggestion}")
            print()

    # Summary
    print("="*60)
    if errors:
        print("❌ Migration has ERRORS - review before applying!")
    elif warnings:
        print("⚠️  Migration has warnings - proceed with caution")
    else:
        print("✅ No critical issues, but review info items")
    print("="*60 + "\n")

def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_migration.py <migration_file.sql>")
        sys.exit(1)

    file_path = Path(sys.argv[1])
    issues = analyze_migration(file_path)
    print_report(issues, file_path)

    # Exit with error code if there are errors
    errors = [i for i in issues if i.severity == "ERROR"]
    sys.exit(1 if errors else 0)

if __name__ == "__main__":
    main()
