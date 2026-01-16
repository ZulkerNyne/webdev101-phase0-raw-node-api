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
- Unknown routes → 404 Not Found (application/json)

## Curl tests (current)

```bash
# routes that exist
curl -i http://localhost:3000/
curl -i http://localhost:3000/health
```
# not found
curl -i http://localhost:3000/nope

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
- [ ] 0.7 Query params: `/hello?name=...`
- [ ] 0.8 Search: `/search?q=...`
- [ ] 0.9 Validation + normalization + limits
- [ ] 0.10 POST body reading + JSON.parse try/catch (`/echo`)
- [ ] 0.11 Method-aware routing (405 + Allow)
- [ ] 0.12 Production JSON safety (415, 413 abort handling)
- [ ] 0.13 Graceful shutdown
