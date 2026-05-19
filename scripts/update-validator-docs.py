#!/usr/bin/env python3
"""
Scans all validator files and updates the Validation Types table
in docs/creating-a-module.md with the current list.

Called by a Claude Code PostToolUse hook whenever a validator file
is written or edited.
"""

import json
import os
import re
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VALIDATORS_DIR = os.path.join(REPO_ROOT, "src", "lib", "validators")
DOC_FILE = os.path.join(REPO_ROOT, "docs", "creating-a-module.md")


def should_run() -> bool:
    """Check stdin for hook JSON — skip if the edited file isn't a validator."""
    if sys.stdin.isatty():
        return True
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return True
    tool_input = data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")
    return "/validators/" in file_path and file_path.endswith(".ts")


def scan_validators() -> dict[str, bool]:
    """Walk validator .ts files and detect which check patterns are used."""
    patterns = {
        "workspace-exists": re.compile(r"listWorkspaces|resolveWorkspace"),
        "workspace-visibility": re.compile(r"\.type\s*!==|\.type\s*===|visibility"),
        "collection-exists": re.compile(r"getCollection|collections\.find"),
        "collection-requests": re.compile(r"findRequest|collectRequestNames|EXPECTED_REQUESTS"),
        "environment-exists": re.compile(r"wsEnvironments\.find|environments\.find"),
        "environment-values": re.compile(r"resolveEnvVar|envDetail\.values"),
        "env-var-secret": re.compile(r'\.type\s*!==\s*["\']secret|\.type\s*===\s*["\']secret'),
        "request-urls": re.compile(r"countUrlUsage|\{\{baseUrl\}\}"),
        "post-response-script": re.compile(r"hasPostResponseScript|listen.*test.*script"),
        "test-scripts": re.compile(r"pm\\.test|countTests|requestsWithTests"),
        "api-response": re.compile(r"fetch\(.*https?://|\.ok\b"),
        "collection-run": re.compile(r"collection.*runner|run.*collection", re.I),
        "manual": re.compile(r"Self-verified|MANUAL"),
    }

    found: dict[str, bool] = {k: False for k in patterns}

    for root, _dirs, files in os.walk(VALIDATORS_DIR):
        for fname in files:
            if not fname.endswith(".ts"):
                continue
            path = os.path.join(root, fname)
            with open(path, "r") as f:
                content = f.read()
            for key, pat in patterns.items():
                if pat.search(content):
                    found[key] = True

    return found


# Descriptions keyed by check type
DESCRIPTIONS = {
    "workspace-exists": (
        "Check a workspace with a specific name pattern",
        '"Workspace named \'Artemis II - [name]\' exists"',
    ),
    "workspace-visibility": (
        "Verify workspace visibility/type settings",
        '"Workspace visibility is Internal (team)"',
    ),
    "collection-exists": (
        "Check a collection exists in a workspace",
        '"Collection containing \'Mission Control\' in name"',
    ),
    "collection-requests": (
        "Verify a collection contains expected requests by name",
        '"Collection has fromAccount, toAccount, and Create new transaction requests"',
    ),
    "environment-exists": (
        "Check an environment with specific name exists",
        '"Environment \'Banking.local\' exists in workspace"',
    ),
    "environment-values": (
        "Check specific variable values or presence",
        '"baseUrl = \'https://example.com\', apiKey is non-empty"',
    ),
    "env-var-secret": (
        "Verify an environment variable is marked as sensitive/secret",
        '"apiKey variable type is \'secret\'"',
    ),
    "request-urls": (
        "Verify request URLs use a variable instead of hardcoded values",
        '"All requests use {{baseUrl}} in their URL"',
    ),
    "post-response-script": (
        "Check a request has a post-response script setting a variable",
        '"fromAccount request has script saving accountId to env var"',
    ),
    "test-scripts": (
        "Verify requests have test scripts (pm.test)",
        '"All requests have status code and response time tests"',
    ),
    "api-response": (
        "Call an API and check the response",
        '"GET /health returns 200 OK"',
    ),
    "collection-run": (
        "Check that a collection run passed",
        '"All tests in the collection pass"',
    ),
    "manual": (
        "Self-verified step that cannot be validated via API",
        '"Learner confirmed MCP server is configured"',
    ),
}


def build_table(found: dict[str, bool]) -> str:
    rows = [
        "| Check Type | Description | Example |",
        "|------------|-------------|---------|",
    ]
    for key in sorted(found.keys()):
        if not found[key]:
            continue
        if key not in DESCRIPTIONS:
            continue
        desc, example = DESCRIPTIONS[key]
        label = key.replace("-", " ").title()
        rows.append(f"| {label} | {desc} | {example} |")
    return "\n".join(rows)


def update_doc(table: str) -> bool:
    if not os.path.isfile(DOC_FILE):
        print(f"Doc file not found: {DOC_FILE}", file=sys.stderr)
        return False

    with open(DOC_FILE, "r") as f:
        content = f.read()

    pattern = (
        r"(## Validation Types\n\n"
        r"Your `\*\*Validation:\*\*` blocks should describe one of these check types:\n\n)"
        r"\|[^\n]*\n\|[-| ]*\n(?:\|[^\n]*\n)*"
    )
    replacement = r"\1" + table + "\n"

    new_content = re.sub(pattern, replacement, content)

    if new_content == content:
        print("No changes needed in docs/creating-a-module.md")
        return False

    with open(DOC_FILE, "w") as f:
        f.write(new_content)
    print("Updated validator types in docs/creating-a-module.md")
    return True


def main() -> None:
    if not should_run():
        sys.exit(0)

    found = scan_validators()
    table = build_table(found)
    update_doc(table)


if __name__ == "__main__":
    main()
