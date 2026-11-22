
const { test } = require("node:test");
const assert = require("node:assert/strict");

const { redact } = require("../src");

// 1. Default sensitive fields
test("should mask default sensitive fields", () => {
  const result = redact({
    name: "Srikar",
    password: "secret123",
    apiKey: "key123"
  });

  assert.equal(result.name, "Srikar");
  assert.equal(result.password, "******");
  assert.equal(result.apiKey, "******");
});

// 2. Preserve normal fields
test("should preserve non-sensitive fields", () => {
  const input = {
    username: "srikar",
    city: "Pune",
    age: 18
  };

  assert.deepStrictEqual(redact(input), input);
});

// 3. Nested objects
test("should mask nested sensitive fields", () => {
  const result = redact({
    user: {
      credentials: {
        password: "abc123"
      }
    }
  });

  assert.equal(result.user.credentials.password, "******");
});

// 4. Arrays
test("should mask sensitive fields inside arrays", () => {
  const result = redact({
    users: [
      { password: "pass1" },
      { password: "pass2" }
    ]
  });

  assert.equal(result.users[0].password, "******");
  assert.equal(result.users[1].password, "******");
});

// 5. Custom sensitive keys
test("should support custom sensitive keys", () => {
  const result = redact(
    { username: "srikar", pin: "1234" },
    { sensitiveKeys: ["pin"] }
  );

  assert.equal(result.pin, "******");
});

// 6. Custom replacement
test("should support custom replacement values", () => {
  const result = redact(
    { password: "secret123" },
    { replacement: "[HIDDEN]" }
  );

  assert.equal(result.password, "[HIDDEN]");
});

// 7. Case-insensitive matching
test("should match sensitive keys regardless of casing", () => {
  const result = redact({
    PASSWORD: "secret",
    ApiKey: "key123"
  });

  assert.equal(result.PASSWORD, "******");
  assert.equal(result.ApiKey, "******");
});

// 8. Different naming conventions
test("should recognize underscores and hyphens in keys", () => {
  const result = redact({
    api_key: "key123",
    apiKey: "key456",
    api_key: "key789",
    access_token: "token123"
  });

  assert.equal(result.api_key, "******");
  assert.equal(result.apiKey, "******");
  assert.equal(result.access_token, "******");
});

// 9. Original object preservation
test("should not modify the original object", () => {
  const input = {
    name: "Srikar",
    password: "secret123"
  };

  const result = redact(input);

  assert.equal(input.password, "secret123");
  assert.equal(result.password, "******");
  assert.notStrictEqual(result, input);
});

// 10. Null values
test("should handle null values", () => {
  const result = redact({
    name: null,
    password: null
  });

  assert.equal(result.name, null);
  assert.equal(result.password, "******");
});

// 11. Invalid sensitive keys
test("should reject invalid sensitiveKeys options", () => {
  assert.throws(
    () => redact({}, { sensitiveKeys: "password" }),
    TypeError
  );

  assert.throws(
    () => redact({}, { sensitiveKeys: [""] }),
    TypeError
  );
});

// 12. Invalid replacement
test("should reject non-string replacement values", () => {
  assert.throws(
    () => redact({}, { replacement: 123 }),
    TypeError
  );
});

// 13. Invalid options
test("should reject invalid options", () => {
  assert.throws(() => redact({}, null), TypeError);
  assert.throws(() => redact({}, []), TypeError);
});

// 14. Circular references
test("should handle circular references", () => {
  const input = {
    name: "Srikar",
    password: "secret"
  };

  input.self = input;

  const result = redact(input);

  assert.equal(result.password, "******");
  assert.equal(result.self, result);
});

// 15. Date objects
test("should preserve Date values without modifying the original", () => {
  const date = new Date("2026-01-01T00:00:00.000Z");

  const result = redact({ createdAt: date });

  assert.deepStrictEqual(result.createdAt, date);
  assert.notStrictEqual(result.createdAt, date);
});

// 16. Buffer objects
test("should create a separate copy of Buffer values", () => {
  const buffer = Buffer.from("hello");

  const result = redact({ data: buffer });

  assert.deepStrictEqual(result.data, buffer);
  assert.notStrictEqual(result.data, buffer);
});

// 17. Regular expressions
test("should preserve RegExp values", () => {
  const regex = /hello/gi;
  regex.lastIndex = 2;

  const result = redact({ pattern: regex });

  assert.deepStrictEqual(result.pattern, regex);
  assert.notStrictEqual(result.pattern, regex);
});

// 18. Shared object references
test("should preserve shared object references", () => {
  const shared = { password: "secret" };

  const input = {
    first: shared,
    second: shared
  };

  const result = redact(input);

  assert.strictEqual(result.first, result.second);
  assert.equal(result.first.password, "******");
  assert.notStrictEqual(result.first, shared);
});

// 19. Getter safety
test("should not execute getters while processing objects", () => {
  let getterCalled = false;

  const input = {};

  Object.defineProperty(input, "value", {
    enumerable: true,
    get() {
      getterCalled = true;
      return "secret";
    }
  });

  const result = redact(input);

  assert.equal(getterCalled, false);
  assert.equal(
    Object.getOwnPropertyDescriptor(result, "value").get,
    Object.getOwnPropertyDescriptor(input, "value").get
  );
});

// 20. Prototype safety
test("should safely preserve an own __proto__ property", () => {
  const input = JSON.parse(
    '{"__proto__":{"password":"secret"},"name":"Srikar"}'
  );

  const result = redact(input);

  assert.equal(
    Object.prototype.hasOwnProperty.call(result, "__proto__"),
    true
  );

  assert.equal(result.__proto__.password, "******");
  assert.equal(Object.getPrototypeOf(result), Object.prototype);
});

// 21. Sparse arrays
test("should preserve empty slots in arrays", () => {
  const input = [];
  input[1] = { password: "secret" };

  const result = redact(input);

  assert.equal(0 in result, false);
  assert.equal(result[1].password, "******");
});
