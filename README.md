# Phase 0 — Raw Node API (No frameworks)

A small HTTP API built using Node’s built-in `http` module (no Express).  
Goal: learn what frameworks automate by implementing routing, validation, JSON parsing, and error handling manually.

## Run

```bash
npm install
npm run dev
```

Server: http://localhost:3000

## Implemented so far (current)

- GET / → 200 OK (text/plain)
- GET /health → 200 OK (application/json)
- GET /hello?name=... → 200 OK (application/json)
- GET /hello (missing name) → 400 Bad Request (application/json)
- GET /search?q=... → 200 OK (application/json, partial match + multi-results)
- GET /search (missing q) → 400 Bad Request (application/json)
- GET /search (q too short) → 400 Bad Request (application/json)
- POST /echo (valid JSON body) → 200 OK (application/json)
- POST /echo (missing body) → 400 Bad Request (application/json)
- POST /echo (invalid JSON) → 400 Bad Request (application/json)
- POST /echo (non-JSON Content-Type) → 415 Unsupported Media Type (application/json)
- POST /echo (payload too large) → 413 Payload Too Large (application/json)
- Wrong method on existing route → 405 Method Not Allowed + Allow header (application/json)
- Unknown routes → 404 Not Found (application/json)

### 0.13 Added (current)

- Graceful shutdown:
  - On SIGINT (Ctrl+C) or SIGTERM, server stops accepting new connections and finishes in-flight requests.
  - During shutdown, new requests receive: 503 Service Unavailable (application/json).
  - Forced exit after timeout to avoid hanging forever.

## Curl tests (current)

```bash
curl -i http://localhost:3000/
curl -i http://localhost:3000/health

curl -i "http://localhost:3000/hello?name=ZulkerNyne"
curl -i "http://localhost:3000/hello"

curl -i "http://localhost:3000/search?q=capital"
curl -i "http://localhost:3000/search?q=bangladesh"
curl -i "http://localhost:3000/search"
curl -i "http://localhost:3000/search?q=ca"
curl -i "http://localhost:3000/search?q=zzzzzz"

curl -i -X POST http://localhost:3000/echo -H "Content-Type: application/json" -d '{"a":1,"msg":"hello"}'
curl -i -X POST http://localhost:3000/echo -H "Content-Type: application/json" -d '{"a":1,'
curl -i -X POST http://localhost:3000/echo -H "Content-Type: application/json"
curl -i -X POST http://localhost:3000/echo -H "Content-Type: text/plain" -d 'hi'

python -c "print('{\"x\":\"' + 'a'*1100000 + '\"}')" | curl -i -X POST http://localhost:3000/echo -H "Content-Type: application/json" --data-binary @-

curl -i http://localhost:3000/nope

curl -i -X POST http://localhost:3000/health -d '{}'
curl -i http://localhost:3000/echo
curl -i -X POST http://localhost:3000/ -d '{}'

```

## Planned endpoints (spec)

- GET /health
- GET /time
- GET /hello?name=zulkernyne
- GET /search?q=term
- POST /echo (JSON)

## Planned error behavior (spec)

- 404 Not Found (unknown route)
- 405 Method Not Allowed + `Allow` header (wrong method)
- 400 Bad Request (missing params, invalid JSON)
- 415 Unsupported Media Type (non-JSON body for JSON endpoints)
- 413 Payload Too Large (body exceeds size limit)

## Progress (Phase 0)


- [x] 0.1 Terminal + filesystem basics
- [x] 0.2 Node basics (npm init, scripts)
- [x] 0.3 Git basics (init/add/commit, gitignore)
- [x] 0.4 Raw HTTP server
- [x] 0.5 0.5 Routing by path + 404(URL string routing) 
- [x] 0.6 Status codes + headers correctness(response helper + JSON 404)
- [x] 0.7 Query params: `/hello?name=...`
- [x] 0.8 Search: `/search?q=...`
- [x] 0.9 Validation + normalization + limits(partial match + multi results)
- [x] 0.10 POST body reading + JSON.parse try/catch (`/echo`)
- [x] 0.11 Method-aware routing (405 + Allow)
- [x] 0.12 Production JSON safety (415, 413 abort handling)
- [x] 0.13 Graceful shutdown
