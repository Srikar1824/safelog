"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const { createExpressMiddleware } = require("../src");

/**
 * Creates a minimal mock Express req/res/next triple.
 */
function mockReqRes(body) {
  const req = { body };
  const res = {};
  let nextCalled = false;
  const next = () => { nextCalled = true; };
  return { req, res, next, wasNextCalled: () => nextCalled };
}

// 1. Returns a function (middleware)
test("createExpressMiddleware: should return a function", () => {
  const mw = createExpressMiddleware();
  assert.equal(typeof mw, "function");
});

// 2. Calls next()
test("createExpressMiddleware: should call next()", () => {
  const mw = createExpressMiddleware();
  const { req, res, next, wasNextCalled } = mockReqRes({ name: "Alice" });
  mw(req, res, next);
  assert.equal(wasNextCalled(), true);
});

// 3. Attaches req.safeBody
test("createExpressMiddleware: should attach req.safeBody", () => {
  const mw = createExpressMiddleware();
  const { req, res, next } = mockReqRes({ name: "Alice", password: "secret" });
  mw(req, res, next);
  assert.ok("safeBody" in req, "req.safeBody should exist");
});

// 4. Sensitive fields are masked in req.safeBody
test("createExpressMiddleware: should mask sensitive fields in safeBody", () => {
  const mw = createExpressMiddleware();
  const { req, res, next } = mockReqRes({
    username: "alice",
    password: "s3cr3t"
  });
  mw(req, res, next);
  assert.equal(req.safeBody.username, "alice");
  assert.equal(req.safeBody.password, "******");
});

// 5. req.body is not modified
test("createExpressMiddleware: should not mutate req.body", () => {
  const mw = createExpressMiddleware();
  const body = { username: "alice", password: "s3cr3t" };
  const { req, res, next } = mockReqRes(body);
  mw(req, res, next);
  assert.equal(req.body.password, "s3cr3t");
});

// 6. Custom sensitiveKeys
test("createExpressMiddleware: should respect custom sensitiveKeys", () => {
  const mw = createExpressMiddleware({ sensitiveKeys: ["pin"] });
  const { req, res, next } = mockReqRes({ name: "Alice", pin: "9999" });
  mw(req, res, next);
  assert.equal(req.safeBody.name, "Alice");
  assert.equal(req.safeBody.pin, "******");
});

// 7. Custom replacement string
test("createExpressMiddleware: should respect custom replacement", () => {
  const mw = createExpressMiddleware({ replacement: "[HIDDEN]" });
  const { req, res, next } = mockReqRes({ password: "secret" });
  mw(req, res, next);
  assert.equal(req.safeBody.password, "[HIDDEN]");
});

// 8. req.body === undefined
test("createExpressMiddleware: should set safeBody to undefined if body is undefined", () => {
  const mw = createExpressMiddleware();
  const { req, res, next } = mockReqRes(undefined);
  mw(req, res, next);
  assert.equal(req.safeBody, undefined);
});

// 9. Array body
test("createExpressMiddleware: should handle array bodies", () => {
  const mw = createExpressMiddleware();
  const { req, res, next } = mockReqRes([
    { username: "alice", password: "pass1" },
    { username: "bob", password: "pass2" }
  ]);
  mw(req, res, next);
  assert.equal(req.safeBody[0].password, "******");
  assert.equal(req.safeBody[1].password, "******");
});

// 10. Invalid options at setup time
test("createExpressMiddleware: should throw on invalid options at creation time", () => {
  assert.throws(() => createExpressMiddleware(null), TypeError);
  assert.throws(() => createExpressMiddleware([]), TypeError);
  assert.throws(
    () => createExpressMiddleware({ replacement: 42 }),
    TypeError
  );
});
