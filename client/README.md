# Client — Celery Feature Tester

The client executes a simple `curl` request to the Hono backend endpoints with a JSON payload containing `{ "message": string, "amount": number }`.

## Endpoints

1. **`POST /message/publish-one`** (or `/message/publish`): Dispatches tasks to `process_message_one`.
2. **`POST /message/publish-two`**: Dispatches tasks to `process_message_two`.

---

## Direct `curl` Examples

### Task One (`process_message_one`)
```bash
curl -X POST http://localhost:3000/message/publish-one \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello to Task One",
    "amount": 3
  }'
```

### Task Two (`process_message_two`)
```bash
curl -X POST http://localhost:3000/message/publish-two \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello to Task Two",
    "amount": 3
  }'
```

---

## Helper Scripts

### Linux / macOS / Git Bash
```bash
chmod +x ./client/*.sh

# Run Task One
./client/publish-one.sh "Custom message" 3

# Run Task Two
./client/publish-two.sh "Custom message for Task Two" 3
```

### Windows CMD
```cmd
:: Run Task One
client\publish-one.bat "Custom message" 3

:: Run Task Two
client\publish-two.bat "Custom message for Task Two" 3
```
