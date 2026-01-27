// Phase 0 - Lesson 0.13
// Goal: Graceful shutdown (SIGINT/SIGTERM) + production-safe JSON (415/413/abort)

const http = require("http");
const { URL } = require("url");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

function sendText(res, statusCode, text) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(text);
}

function sendJson(res, statusCode, obj) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

function methodNotAllowed(res, allowedMethods) {
  res.statusCode = 405;
  res.setHeader("Allow", allowedMethods.join(", "));
  return sendJson(res, 405, {
    error: "Method Not Allowed",
    allow: allowedMethods,
  });
}

/**
 * readJsonBody(req, res, { maxBytes })
 *
 * - 415 if Content-Type isn't application/json
 * - 413 if payload exceeds maxBytes
 * - handles client abort + stream errors
 *
 * Returns:
 * - { handled:true } if it already responded (415/413/abort/error)
 * - { handled:false, ok:true, data } on success
 * - { handled:false, ok:false, status, obj } on parse/validation errors
 */
function readJsonBody(req, res, { maxBytes }) {
  const contentType = String(req.headers["content-type"] || "").toLowerCase();

  if (!contentType.startsWith("application/json")) {
    sendJson(res, 415, {
      error: "Unsupported Media Type",
      message: "Send Content-Type: application/json",
    });
    return { handled: true };
  }

  let body = "";
  let bytes = 0;
  let aborted = false;

  return new Promise((resolve) => {
    req.on("aborted", () => {
      aborted = true;
      resolve({ handled: true });
    });

    req.on("error", () => {
      aborted = true;
      resolve({ handled: true });
    });

    req.on("data", (chunk) => {
      if (aborted) return;

      bytes += chunk.length;

      if (bytes > maxBytes) {
        sendJson(res, 413, { error: "Payload Too Large", maxBytes });
        aborted = true;
        req.destroy();
        resolve({ handled: true });
        return;
      }

      body += chunk;
    });

    req.on("end", () => {
      if (aborted) return resolve({ handled: true });

      if (!body) {
        return resolve({
          handled: false,
          ok: false,
          status: 400,
          obj: { error: "Missing JSON body" },
        });
      }

      try {
        const data = JSON.parse(body);
        return resolve({ handled: false, ok: true, data });
      } catch {
        return resolve({
          handled: false,
          ok: false,
          status: 400,
          obj: { error: "Invalid JSON" },
        });
      }
    });
  });
}

// ----------- Graceful shutdown state -----------
let isShuttingDown = false;

const server = http.createServer(async (req, res) => {
  // If shutdown has started, reject NEW requests
  if (isShuttingDown) {
    // optional: hint clients to close keep-alive connections
    res.setHeader("Connection", "close");
    return sendJson(res, 503, { error: "Server is shutting down" });
  }

  const fullUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = fullUrl.pathname;

  console.log("METHOD:", req.method, "PATH:", pathname);

  // GET /
  if (pathname === "/") {
    if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
    return sendText(res, 200, "Try: GET /health, GET /time, POST /echo\n");
  }

  // GET /health
  if (pathname === "/health") {
    if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
    return sendJson(res, 200, { status: "ok" });
  }

  // GET /time
  if (pathname === "/time") {
    if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
    return sendJson(res, 200, { now: new Date().toISOString() });
  }

  // POST /echo
  if (pathname === "/echo") {
    if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

    const result = await readJsonBody(req, res, { maxBytes: 1024 * 1024 });
    if (result.handled) return;

    if (!result.ok) return sendJson(res, result.status, result.obj);
    return sendJson(res, 200, { received: result.data });
  }

  // default 404 (JSON)
  return sendJson(res, 404, { error: "Not Found", path: pathname });
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  // Stop accepting NEW connections. Existing in-flight requests can finish.
  server.close(() => {
    console.log("All connections closed. Exiting now.");
    process.exit(0);
  });

  // Force exit if something hangs
  setTimeout(() => {
    console.error("Force exiting (shutdown timeout).");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));   // Ctrl + C
process.on("SIGTERM", () => shutdown("SIGTERM")); // Production stop signal
