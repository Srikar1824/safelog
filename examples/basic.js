
const { redact } = require("../src");

const user = {
  name: "Srikar",
  email: "srikar@example.com",
  password: "mypassword123",
  apiKey: "sk_test_12345",
  profile: {
    accessToken: "access_abc123",
    city: "Pune"
  },
  accounts: [
    {
      username: "srikar",
      password: "account123"
    },
    {
      username: "guest",
      password: "guest123"
    }
  ]
};

// Generate a sanitized copy
const safeUser = redact(user);

console.log("Original Data:");
console.dir(user, { depth: null });

console.log("\nRedacted Data:");
console.dir(safeUser, { depth: null });

// Custom replacement example
const customSafeUser = redact(user, {
  replacement: "[REDACTED]"
});

console.log("\nCustom Replacement:");
console.dir(customSafeUser, { depth: null });
