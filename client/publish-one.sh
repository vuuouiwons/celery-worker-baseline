#!/usr/bin/env bash
set -e

# Default parameters
MESSAGE="${1:-"Hello from Celery Feature Tester"}"
AMOUNT="${2:-5}"
SERVER_URL="${SERVER_URL:-"http://localhost:3000/message/publish-one"}"

echo "Sending publish request to $SERVER_URL"
echo "Message: \"$MESSAGE\""
echo "Amount:  $AMOUNT"
echo "----------------------------------------"

curl -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"$MESSAGE\",
    \"amount\": $AMOUNT
  }"

echo ""
