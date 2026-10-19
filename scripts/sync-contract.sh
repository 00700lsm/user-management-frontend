#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SHA="$(tr -d '[:space:]' < "$ROOT/contract.sha")"
[[ "$SHA" =~ ^[a-f0-9]{40}$ ]] || { echo "Invalid contract.sha"; exit 1; }
mkdir -p "$ROOT/.contract-cache"
curl --fail --location --retry 3 "https://raw.githubusercontent.com/00700lsm/user-management-contract/$SHA/openapi.yaml" -o "$ROOT/.contract-cache/openapi.yaml"
echo "Using Contract: $SHA"
