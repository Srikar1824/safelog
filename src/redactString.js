/**
 * @file redactString.js
 * Utility to redact sensitive patterns from raw strings (e.g. log lines).
 */

"use strict";

const { VALUE_PATTERNS } = require("./patterns");

/**
 * Scans a string for sensitive value patterns (JWTs, credit card numbers,
 * SSNs, AWS keys, PEM blocks) and replaces them with a redaction marker.
 *
 * @param {string} str - The string to scan and sanitize.
 * @param {object}  [options={}]
 * @param {string}  [options.replacement="[REDACTED]"] - Replacement text.
 * @param {Array<{ name: string, pattern: RegExp }>} [options.patterns]
 *   Additional patterns to redact. Each must have a `name` string and a
 *   global `pattern` RegExp. Merged with the built-in VALUE_PATTERNS.
 * @returns {string} A new string with sensitive values replaced.
 *
 * @throws {TypeError} If `str` is not a string.
 * @throws {TypeError} If `options` is not a plain object.
 *
 * @example
 * const { sanitizeString } = require("safelog-js");
 *
 * const raw = "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig";
 * console.log(sanitizeString(raw));
 * // "Authorization: Bearer [REDACTED]"
 */
function sanitizeString(str, options = {}) {
  if (typeof str !== "string") {
    throw new TypeError("sanitizeString: first argument must be a string");
  }

  if (
    options === null ||
    typeof options !== "object" ||
    Array.isArray(options)
  ) {
    throw new TypeError("sanitizeString: options must be a plain object");
  }

  const {
    replacement = "[REDACTED]",
    patterns: extraPatterns = []
  } = options;

  if (typeof replacement !== "string") {
    throw new TypeError("sanitizeString: replacement must be a string");
  }

  if (!Array.isArray(extraPatterns)) {
    throw new TypeError(
      "sanitizeString: options.patterns must be an array"
    );
  }

  const allPatterns = [...VALUE_PATTERNS, ...extraPatterns];

  let result = str;

  for (const { pattern } of allPatterns) {
    // Reset lastIndex in case the RegExp is reused
    if (pattern.global) {
      pattern.lastIndex = 0;
    }
    result = result.replace(pattern, replacement);
  }

  return result;
}

module.exports = { sanitizeString };
