/**
 * @file middleware.js
 * Express middleware that redacts sensitive fields from req.body before logging.
 */

"use strict";

const { redact } = require("./redact");

/**
 * Creates an Express middleware function that deep-clones and redacts
 * `req.body`, attaching the sanitized copy as `req.safeBody`.
 *
 * Use `req.safeBody` (instead of `req.body`) whenever you log request data,
 * so that passwords, tokens and other PII never appear in your logs.
 *
 * @param {object}   [options={}]
 * @param {string[]} [options.sensitiveKeys=[]]     Extra key names to redact.
 * @param {string}   [options.replacement="******"] Replacement string.
 * @returns {function(req, res, next): void} Express middleware.
 *
 * @example
 * const express = require("express");
 * const { createExpressMiddleware } = require("safelog-js");
 *
 * const app = express();
 * app.use(express.json());
 * app.use(createExpressMiddleware());   // attaches req.safeBody
 *
 * app.post("/login", (req, res) => {
 *   console.log("Login attempt:", req.safeBody); // password is masked
 *   res.send("ok");
 * });
 */
function createExpressMiddleware(options = {}) {
  // Validate at setup time
  redact({}, options);

  return function safelogMiddleware(req, res, next) {
    try {
      req.safeBody =
        req.body !== undefined ? redact(req.body, options) : undefined;
    } catch (_err) {
      // Never block the request due to redaction errors
      req.safeBody = req.body;
    }

    next();
  };
}

module.exports = { createExpressMiddleware };
