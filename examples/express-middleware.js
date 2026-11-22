"use strict";

/**
 * Example: Using createExpressMiddleware() to protect req.body in logs.
 *
 * This example creates a minimal Express server to demonstrate how
 * safelog-js middleware automatically sanitizes request bodies.
 *
 * Run with: node examples/express-middleware.js
 * Then POST to http://localhost:3000/login with a JSON body.
 *
 * Note: express must be installed separately — this example is for
 * illustration. Install with: npm install express
 */

let express;
try {
  express = require("express");
} catch {
  console.log(
    "⚠  This example requires Express. Install it with:\n\n" +
    "   npm install express\n\n" +
    "Then re-run: node examples/express-middleware.js\n"
  );
  process.exit(0);
}

const { createExpressMiddleware } = require("../src");

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Attach req.safeBody — a sanitized clone of req.body
app.use(createExpressMiddleware({
  sensitiveKeys: ["pin"],    // extra keys beyond the defaults
  replacement: "******"
}));

app.post("/login", (req, res) => {
  // ✅ Safe to log — sensitive fields are masked
  console.log("[LOG] Login attempt (safe to log):", req.safeBody);
  // e.g. { username: "alice", password: "******" }

  // ✅ req.body is untouched — use it for actual business logic
  const { username, password } = req.body;
  res.json({
    message: `Received login for ${username}`,
    note: "Password was safely masked in the log above"
  });
});

app.post("/transfer", (req, res) => {
  console.log("[LOG] Transfer request (safe to log):", req.safeBody);
  // e.g. { amount: 500, pin: "******", toAccount: "9876543210" }
  res.json({ message: "Transfer recorded", safe: req.safeBody });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\nsafelog-js Express middleware demo running on http://localhost:${PORT}`);
  console.log("\nTry it:");
  console.log(
    `  curl -X POST http://localhost:${PORT}/login ` +
    `-H "Content-Type: application/json" ` +
    `-d '{"username":"alice","password":"s3cr3t","apiKey":"sk_live_123"}'`
  );
  console.log(
    `\n  curl -X POST http://localhost:${PORT}/transfer ` +
    `-H "Content-Type: application/json" ` +
    `-d '{"amount":500,"pin":"1234","toAccount":"9876543210"}'`
  );
});
