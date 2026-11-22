"use strict";

/**
 * Example: Using createRedactor() to create a pre-configured redactor.
 *
 * Run with: node examples/createRedactor.js
 */

const { createRedactor } = require("../src");

// Create once with custom sensitive keys and a custom replacement string.
// All subsequent calls automatically use these settings.
const safeLog = createRedactor({
  sensitiveKeys: ["pin", "dob", "mothersMaidenName"],
  replacement: "[HIDDEN]"
});

const userA = {
  name: "Alice",
  password: "alice_pass",
  pin: "4321",
  dob: "1990-05-14",
  mothersMaidenName: "Smith",
  city: "Pune"
};

const userB = {
  name: "Bob",
  apiKey: "sk_live_abc123",
  pin: "9999",
  age: 30
};

console.log("=== createRedactor Example ===\n");

console.log("User A (original):");
console.dir(userA, { depth: null });

console.log("\nUser A (redacted):");
console.dir(safeLog(userA), { depth: null });

console.log("\nUser B (original):");
console.dir(userB, { depth: null });

console.log("\nUser B (redacted):");
console.dir(safeLog(userB), { depth: null });

console.log("\n✓ Original objects are unmodified:");
console.log("  userA.password:", userA.password);
console.log("  userA.pin:", userA.pin);
