#!/bin/bash

cd "$(dirname "$0")" || exit 1
.venv/bin/python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
