#!/usr/bin/env python3
"""
Exposed Secrets Scanner

Scans codebase for potentially exposed API keys, tokens, and secrets.

Usage:
    python check_exposed_secrets.py [directory]

Example:
    python check_exposed_secrets.py .
    python check_exposed_secrets.py src/
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Tuple

class SecretMatch:
    def __init__(self, file_path: str, line_num: int, secret_type: str, match: str):
        self.file_path = file_path
        self.line_num = line_num
        self.secret_type = secret_type
        self.match = match

# Patterns for different secret types
PATTERNS = {
    "Supabase Service Role Key": r'SUPABASE_SERVICE_ROLE_KEY["\']?\s*[:=]\s*["\']([a-zA-Z0-9_\-\.]{100,})["\']',
    "Supabase URL with embedded key": r'https://[a-z0-9\-]+\.supabase\.co.*?apikey=([a-zA-Z0-9_\-\.]+)',
    "Google API Key": r'AIza[0-9A-Za-z\-_]{35}',
    "Generic API Key": r'api[_\-]?key["\']?\s*[:=]\s*["\']([a-zA-Z0-9_\-]{20,})["\']',
    "Bearer Token": r'Bearer\s+([a-zA-Z0-9_\-\.]{20,})',
    "JWT Token": r'eyJ[a-zA-Z0-9_\-]+\.eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+',
    "Private Key": r'-----BEGIN (RSA |EC |)PRIVATE KEY-----',
}

# Files/dirs to skip
SKIP_PATTERNS = [
    r'\.git/',
    r'node_modules/',
    r'\.next/',
    r'dist/',
    r'build/',
    r'\.env\.example$',
    r'\.md$',  # Documentation often shows example keys
    r'check_exposed_secrets\.py$',  # This file!
]

def should_skip(file_path: str) -> bool:
    """Check if file should be skipped."""
    for pattern in SKIP_PATTERNS:
        if re.search(pattern, str(file_path)):
            return True
    return False

def is_likely_placeholder(match: str) -> bool:
    """Check if a match is likely a placeholder, not a real secret."""
    placeholders = [
        'your_', 'YOUR_', 'example', 'EXAMPLE', 'test', 'TEST',
        'dummy', 'DUMMY', 'placeholder', 'PLACEHOLDER',
        'xxx', 'XXX', '***', '...',
        'sk_test_', 'pk_test_',  # Stripe test keys
    ]
    return any(ph in match for ph in placeholders)

def scan_file(file_path: Path) -> List[SecretMatch]:
    """Scan a single file for secrets."""
    matches = []

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
    except Exception:
        return matches

    for line_num, line in enumerate(lines, start=1):
        for secret_type, pattern in PATTERNS.items():
            for match in re.finditer(pattern, line, re.IGNORECASE):
                secret_value = match.group(1) if match.lastindex else match.group(0)

                # Skip if looks like a placeholder
                if is_likely_placeholder(secret_value):
                    continue

                # Skip if it's just the env var name (not the value)
                if secret_value.startswith('process.env.'):
                    continue

                matches.append(SecretMatch(
                    str(file_path),
                    line_num,
                    secret_type,
                    secret_value[:50] + '...' if len(secret_value) > 50 else secret_value
                ))

    return matches

def scan_directory(directory: Path) -> List[SecretMatch]:
    """Recursively scan directory for secrets."""
    all_matches = []

    for root, dirs, files in os.walk(directory):
        # Skip hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.')]

        for file in files:
            file_path = Path(root) / file

            if should_skip(str(file_path)):
                continue

            matches = scan_file(file_path)
            all_matches.extend(matches)

    return all_matches

def print_report(matches: List[SecretMatch]):
    """Print scan results."""
    print("\n" + "="*60)
    print("🔐 EXPOSED SECRETS SCAN")
    print("="*60)

    if not matches:
        print("\n✅ No exposed secrets found!")
        print("="*60 + "\n")
        return

    # Group by file
    by_file = {}
    for match in matches:
        if match.file_path not in by_file:
            by_file[match.file_path] = []
        by_file[match.file_path].append(match)

    print(f"\n❌ Found {len(matches)} potential secret(s) in {len(by_file)} file(s):\n")

    for file_path, file_matches in sorted(by_file.items()):
        print(f"📄 {file_path}")
        for match in file_matches:
            print(f"   Line {match.line_num}: {match.secret_type}")
            print(f"   Value: {match.match}")
            print()

    print("="*60)
    print("⚠️  SECURITY RECOMMENDATIONS:")
    print("")
    print("1. Move all secrets to .env.local (NOT committed to git)")
    print("2. Use NEXT_PUBLIC_ prefix ONLY for client-safe values")
    print("3. NEVER commit service_role keys or private keys")
    print("4. Rotate any exposed keys immediately")
    print("5. Add .env.local to .gitignore")
    print("="*60 + "\n")

def main():
    directory = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('.')

    if not directory.exists():
        print(f"Error: Directory '{directory}' does not exist")
        sys.exit(1)

    print(f"🔍 Scanning directory: {directory.absolute()}")

    matches = scan_directory(directory)
    print_report(matches)

    # Exit with error code if secrets found
    sys.exit(1 if matches else 0)

if __name__ == "__main__":
    main()
