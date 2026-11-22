"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const { createRedactor } = require("../src");

// 1. Basic factory usage
test("createRedactor: should return a function", () => {
  const redactor = createRedactor();
  assert.equal(typeof redactor, "function");
});

// 2. Uses default sensitive keys
test("createRedactor: should mask default sensitive keys", () => {
  const redactor = createRedactor();
  const result = redactor({ name: "Alice", password: "secret" });
  assert.equal(result.name, "Alice");
  assert.equal(result.password, "******");
});

// 3. Custom sensitive keys are captured at creation
test("createRedactor: should use custom sensitiveKeys provided at creation", () => {
  const redactor = createRedactor({ sensitiveKeys: ["pin", "dob"] });
  const result = redactor({ name: "Alice", pin: "1234", dob: "1990-01-01" });
  assert.equal(result.name, "Alice");
  assert.equal(result.pin, "******");
  assert.equal(result.dob, "******");
});

// 4. Custom replacement string
test("createRedactor: should use custom replacement string", () => {
  const redactor = createRedactor({ replacement: "[HIDDEN]" });
  const result = redactor({ password: "secret" });
  assert.equal(result.password, "[HIDDEN]");
});

// 5. The same redactor can be called multiple times
test("createRedactor: calling the redactor multiple times should work independently", () => {
  const redactor = createRedactor();
  const a = redactor({ password: "abc" });
  const b = redactor({ password: "xyz" });
  assert.equal(a.password, "******");
  assert.equal(b.password, "******");
  assert.notStrictEqual(a, b);
});

// 6. Does not mutate the original
test("createRedactor: should not mutate the original object", () => {
  const redactor = createRedactor();
  const input = { password: "secret" };
  redactor(input);
  assert.equal(input.password, "secret");
});

// 7. Invalid options at creation time
test("createRedactor: should throw on invalid options", () => {
  assert.throws(() => createRedactor(null), TypeError);
  assert.throws(() => createRedactor([]), TypeError);
  assert.throws(
    () => createRedactor({ sensitiveKeys: "password" }),
    TypeError
  );
  assert.throws(
    () => createRedactor({ replacement: 42 }),
    TypeError
  );
});
