"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const { sanitizeString } = require("../src");

// 1. Returns a string
test("sanitizeString: should return a string", () => {
  assert.equal(typeof sanitizeString("hello world"), "string");
});

// 2. Leaves safe strings untouched
test("sanitizeString: should leave non-sensitive strings unchanged", () => {
  const input = "User alice logged in from 192.168.1.1";
  assert.equal(sanitizeString(input), input);
});

// 3. Redacts JWT tokens
test("sanitizeString: should redact JWT tokens", () => {
  const jwt =
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
  const input = `Authorization: Bearer ${jwt}`;
  const result = sanitizeString(input);
  assert.ok(!result.includes(jwt), "JWT should be removed");
  assert.ok(result.includes("[REDACTED]"), "Should contain replacement");
});

// 4. Redacts SSN patterns
test("sanitizeString: should redact SSN patterns", () => {
  const result = sanitizeString("User SSN: 123-45-6789");
  assert.ok(!result.includes("123-45-6789"));
  assert.ok(result.includes("[REDACTED]"));
});

// 5. Redacts AWS access key IDs
test("sanitizeString: should redact AWS access key IDs", () => {
  const result = sanitizeString("AWS key: AKIAIOSFODNN7EXAMPLE");
  assert.ok(!result.includes("AKIAIOSFODNN7EXAMPLE"));
  assert.ok(result.includes("[REDACTED]"));
});

// 6. Custom replacement text
test("sanitizeString: should use custom replacement text", () => {
  const jwt =
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
  const result = sanitizeString(`Bearer ${jwt}`, { replacement: "***" });
  assert.ok(result.includes("***"));
  assert.ok(!result.includes(jwt));
});

// 7. Custom extra patterns
test("sanitizeString: should support additional patterns via options.patterns", () => {
  const result = sanitizeString("Employee ID: EMP-9999", {
    patterns: [{ name: "empId", pattern: /EMP-\d+/g }]
  });
  assert.ok(!result.includes("EMP-9999"));
  assert.ok(result.includes("[REDACTED]"));
});

// 8. Empty string returns empty string
test("sanitizeString: should handle empty string input", () => {
  assert.equal(sanitizeString(""), "");
});

// 9. Multiple sensitive values in one string
test("sanitizeString: should redact multiple occurrences in one string", () => {
  const jwt =
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
  const input = `First: ${jwt} Second: 123-45-6789`;
  const result = sanitizeString(input);
  assert.ok(!result.includes(jwt));
  assert.ok(!result.includes("123-45-6789"));
});

// 10. Type checks
test("sanitizeString: should throw if first argument is not a string", () => {
  assert.throws(() => sanitizeString(123), TypeError);
  assert.throws(() => sanitizeString(null), TypeError);
  assert.throws(() => sanitizeString({}), TypeError);
});

test("sanitizeString: should throw if options is not a plain object", () => {
  assert.throws(() => sanitizeString("hello", null), TypeError);
  assert.throws(() => sanitizeString("hello", []), TypeError);
});

test("sanitizeString: should throw if replacement is not a string", () => {
  assert.throws(
    () => sanitizeString("hello", { replacement: 42 }),
    TypeError
  );
});
