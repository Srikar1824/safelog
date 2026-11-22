/**
 * safelog-js — Public API
 *
 * A lightweight utility to deep-clone JavaScript objects and redact
 * sensitive fields before logging. Keeps passwords, tokens, and PII
 * out of your application logs.
 *
 * @module safelog-js
 */

"use strict";

const { redact } = require("./redact");
const { createRedactor } = require("./createRedactor");
const { sanitizeString } = require("./redactString");
const { createExpressMiddleware } = require("./middleware");
const { DEFAULT_SENSITIVE_KEYS, VALUE_PATTERNS } = require("./patterns");

module.exports = {
  /** Deep-clone an object/array and replace sensitive fields. */
  redact,

  /** Create a pre-configured redactor function. */
  createRedactor,

  /** Redact sensitive patterns from a raw string (JWTs, card numbers, etc.) */
  sanitizeString,

  /** Create an Express middleware that attaches req.safeBody. */
  createExpressMiddleware,

  /** The built-in list of sensitive key names. */
  DEFAULT_SENSITIVE_KEYS,

  /** The built-in regex patterns used by sanitizeString. */
  VALUE_PATTERNS
};
