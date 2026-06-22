const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 5173);
const host = "127.0.0.1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${host}:${port}`);

  if (request.method === "PUT" && requestUrl.pathname.startsWith("/api/plans/")) {
    handleStatusUpdate(request, response, requestUrl);
    return;
  }

  let filePath = path.join(rootDir, decodeURIComponent(requestUrl.pathname));

  if (!filePath.startsWith(rootDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  if (requestUrl.pathname === "/") {
    filePath = path.join(rootDir, "dashboard", "index.html");
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, {
      "content-type": mimeTypes[extension] || "application/octet-stream"
    });
    response.end(data);
  });
});

function handleStatusUpdate(request, response, requestUrl) {
  const planId = decodeURIComponent(requestUrl.pathname.replace("/api/plans/", "").replace("/status", ""));

  if (!requestUrl.pathname.endsWith("/status") || !planId) {
    sendJson(response, 404, { error: "Unknown API route." });
    return;
  }

  readRequestBody(request, (error, body) => {
    if (error) {
      sendJson(response, 400, { error: "Invalid request body." });
      return;
    }

    const allowedStatuses = new Set(["planned", "active", "blocked", "review", "done", "archived"]);
    const nextStatus = body.status;

    if (!allowedStatuses.has(nextStatus)) {
      sendJson(response, 400, { error: "Invalid status." });
      return;
    }

    try {
      const indexPath = path.join(rootDir, "data", "plans-index.json");
      const planPaths = JSON.parse(fs.readFileSync(indexPath, "utf8"));
      const relativePlanPath = planPaths.find((item) => path.basename(item, ".json") === planId);

      if (!relativePlanPath) {
        sendJson(response, 404, { error: "Plan not found." });
        return;
      }

      const planPath = path.join(rootDir, relativePlanPath);

      if (!planPath.startsWith(rootDir)) {
        sendJson(response, 403, { error: "Invalid plan path." });
        return;
      }

      const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
      const previousStatus = plan.status;
      const now = new Date().toISOString();

      plan.status = nextStatus;
      plan.updatedAt = now;
      plan.updates = Array.isArray(plan.updates) ? plan.updates : [];
      plan.updates.unshift({
        at: now,
        by: "dashboard",
        message: `Status changed from ${previousStatus} to ${nextStatus}.`
      });

      fs.writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
      sendJson(response, 200, { plan });
    } catch (writeError) {
      sendJson(response, 500, { error: writeError.message });
    }
  });
}

function readRequestBody(request, callback) {
  let data = "";

  request.on("data", (chunk) => {
    data += chunk;
  });

  request.on("end", () => {
    try {
      callback(null, JSON.parse(data || "{}"));
    } catch (error) {
      callback(error);
    }
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

server.listen(port, host, () => {
  console.log(`AI Plan Dashboard: http://${host}:${port}/dashboard/`);
});
