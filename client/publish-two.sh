#!/usr/bin/env bash
set -e

# Default parameters
MESSAGE="${1:-"Hello from Celery Task Two"}"
AMOUNT="${2:-5000}"
SERVER_URL="${SERVER_URL:-"http://localhost:3000/message/publish-two"}"

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
