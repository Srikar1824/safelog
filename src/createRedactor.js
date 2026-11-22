/**
 * @file createRedactor.js
 * Factory function for creating pre-configured redactor instances.
 */

"use strict";

const { redact } = require("./redact");

/**
 * Creates a redactor function pre-configured with the given options.
 *
 * This is useful when the same redaction options (custom sensitive keys,
 * custom replacement string) are reused across many call sites — configure
 * once, call everywhere.
 *
 * @param {object}   [options={}]
 * @param {string[]} [options.sensitiveKeys=[]]  Extra key names to redact.
 * @param {string}   [options.replacement="******"] Replacement string.
 * @returns {function(data: *): *} A bound `redact` function.
 *
 * @throws {TypeError} If `options` is not a plain object (same rules as `redact`).
 *
 * @example
 * const { createRedactor } = require("safelog-js");
 *
 * const safeLog = createRedactor({
 *   sensitiveKeys: ["pin", "dob"],
 *   replacement: "[HIDDEN]"
 * });
 *
 * console.log(safeLog({ name: "Alice", pin: "1234", dob: "1990-01-01" }));
 * // { name: "Alice", pin: "[HIDDEN]", dob: "[HIDDEN]" }
 */
function createRedactor(options = {}) {
  // Validate eagerly so the user gets an error at setup time, not call time
  redact({}, options);

  /**
   * Redacts `data` using the options captured at factory-creation time.
   *
   * @param {*} data - The value to redact.
   * @returns {*} A deep-cloned, redacted copy of `data`.
   */
  return function boundRedact(data) {
    return redact(data, options);
  };
}

module.exports = { createRedactor };
