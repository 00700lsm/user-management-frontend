#!/usr/bin/env python3
"""Read-only CSS custom-property reference validation using Python standard library.

Checks var(--name) references in src/**/*.css against declarations in
src/shared/ui/styles/tokens.css or the same CSS file. This is a structural
lint only; it cannot prove visual consistency, correct contrast or accessibility.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
TOKENS = ROOT / "src/shared/ui/styles/tokens.css"
DECL = re.compile(r"(?<![\w-])(--[a-zA-Z][\w-]*)\s*:")
USE = re.compile(r"\bvar\(\s*(--[a-zA-Z][\w-]*)\s*(?:[,)]|$)")


def clean_css(source: str) -> str:
    return re.sub(r"/\*.*?\*/", "", source, flags=re.DOTALL)


def main() -> int:
    if not TOKENS.is_file():
        print(f"[FAIL] Missing token source: {TOKENS}")
        return 1
    declared_tokens = set(DECL.findall(clean_css(TOKENS.read_text(encoding="utf-8"))))
    if not declared_tokens:
        print("[FAIL] CSS token definitions are empty")
        return 1
    files = sorted((ROOT / "src").rglob("*.css"))
    if not files:
        print("[FAIL] No src/**/*.css files found")
        return 1
    failures = 0
    references = 0
    for file in files:
        code = clean_css(file.read_text(encoding="utf-8"))
        local = set(DECL.findall(code))
        for line_number, line in enumerate(code.splitlines(), start=1):
            for name in USE.findall(line):
                references += 1
                if name not in declared_tokens and name not in local:
                    print(f"[FAIL] {file.relative_to(ROOT)}:{line_number}: {name} undefined")
                    failures += 1
    print(f"[PASS] Parsed {len(files)} CSS files, {len(declared_tokens)} tokens and {references} references")
    print("[WARN] This check cannot establish rendered design, media behavior, semantics, or WCAG compliance")
    print(f"[{'FAIL' if failures else 'PASS'}] Undefined token references: {failures}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
