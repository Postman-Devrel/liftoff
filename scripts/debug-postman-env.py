#!/usr/bin/env python3
"""
Debug script to inspect what the Postman API returns for an environment's variables.
Usage: python3 scripts/debug-postman-env.py <postman-api-key> <environment-name>
"""

import sys
import json
import urllib.request

BASE = "https://api.getpostman.com"

def api_get(path, api_key):
    req = urllib.request.Request(f"{BASE}{path}", headers={"x-api-key": api_key})
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  HTTP {e.code}: {body}")
        raise

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 scripts/debug-postman-env.py <postman-api-key> <environment-name>")
        sys.exit(1)

    api_key = sys.argv[1]
    target_name = sys.argv[2].strip().lower()

    # 1. List all environments and find the match
    print("=== All Environments ===")
    envs = api_get("/environments", api_key)["environments"]
    match = None
    for env in envs:
        marker = " <-- MATCH" if env["name"].strip().lower() == target_name else ""
        print(f"  {env['name']} (uid: {env['uid']}){marker}")
        if env["name"].strip().lower() == target_name:
            match = env

    if not match:
        print(f"\nNo environment named \"{sys.argv[2]}\" found.")
        sys.exit(1)

    # 2. Get full environment details
    print(f"\n=== {match['name']} (uid: {match['uid']}) ===")
    detail = api_get(f"/environments/{match['uid']}", api_key)["environment"]

    print(f"  Response keys: {list(detail.keys())}")
    values = detail.get("values", [])
    print(f"  Variables: {len(values)}\n")

    for v in values:
        print(f"  [{v.get('key')}]")
        for k, val in v.items():
            if k == "key":
                continue
            display = repr(val) if isinstance(val, str) and len(val) > 50 else val
            print(f"    {k}: {display}")
        print()

if __name__ == "__main__":
    main()
