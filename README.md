# safelog-js

> **A lightweight Node.js utility that deep-clones JavaScript objects and redacts sensitive fields — so passwords, tokens, and PII never appear in your logs.**

[![npm version](https://img.shields.io/npm/v/safelog-js.svg)](https://www.npmjs.com/package/safelog-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js >= 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

---

## Why safelog-js?

Application logs are a goldmine for debugging — but they are also one of the most common places where sensitive user data accidentally leaks. Passwords entered into login forms, API keys passed in request bodies, and JWT tokens stored in session objects all end up in log files far more often than developers realise.

**safelog-js** solves this by providing a simple `redact()` function that:

- Deep-clones your data (never mutates the original)
- Replaces sensitive field values with a configurable placeholder
- Handles nested objects, arrays, circular references, and special types (Dates, Buffers, RegExps)
- Optionally scans raw log strings for JWT tokens, credit card numbers, SSNs, and AWS keys

---

## Installation

```bash
npm install safelog-js
```

Requires **Node.js ≥ 18**.

---

## Quick Start

```js
const { redact } = require("safelog-js");

const user = {
  name: "Alice",
  password: "s3cr3t",
  apiKey: "sk_live_abc123",
  profile: {
    city: "Pune",
    accessToken: "eyJhbGci..."
  }
};

console.log(redact(user));
// {
//   name: "Alice",
//   password: "******",
//   apiKey: "******",
//   profile: { city: "Pune", accessToken: "******" }
// }
```

The original `user` object is **never modified**.

---

## API Reference

### `redact(data, [options])` → `*`

Deep-clones `data` and replaces the values of any sensitive keys with the replacement string.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `data` | `any` | — | The value to sanitize. Can be an object, array, or any primitive. |
| `options.sensitiveKeys` | `string[]` | `[]` | Additional key names to redact (merged with the built-in list). |
| `options.replacement` | `string` | `"******"` | The string used to replace redacted values. |

**Returns:** A deep-cloned, redacted copy of `data`.

**Throws:** `TypeError` if `options` is not a plain object, `sensitiveKeys` is not a string array, or `replacement` is not a string.

#### Examples

```js
const { redact } = require("safelog-js");

// Basic usage
redact({ username: "alice", password: "secret" });
// => { username: "alice", password: "******" }

// Custom sensitive keys
redact({ name: "Alice", pin: "1234" }, { sensitiveKeys: ["pin"] });
// => { name: "Alice", pin: "******" }

// Custom replacement text
redact({ token: "abc123" }, { replacement: "[REDACTED]" });
// => { token: "[REDACTED]" }

// Nested objects — works at any depth
redact({ user: { session: { refreshToken: "tok_xyz" } } });
// => { user: { session: { refreshToken: "******" } } }

// Arrays of objects
redact({ accounts: [{ password: "a" }, { password: "b" }] });
// => { accounts: [{ password: "******" }, { password: "******" }] }
```

---

### `createRedactor([options])` → `function`

Creates a **pre-configured** redactor function. Configure once, call everywhere.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `options.sensitiveKeys` | `string[]` | `[]` | Extra key names to redact. |
| `options.replacement` | `string` | `"******"` | Replacement string. |

**Returns:** `function(data) → *` — a bound `redact` that always uses the specified options.

**Throws:** `TypeError` on invalid options (at creation time, not call time).

#### Example

```js
const { createRedactor } = require("safelog-js");

// Create a project-wide safe logger once
const safeLog = createRedactor({
  sensitiveKeys: ["pin", "dob"],
  replacement: "[HIDDEN]"
});

// Use everywhere
console.log(safeLog({ name: "Alice", pin: "1234", dob: "1990-01-01" }));
// => { name: "Alice", pin: "[HIDDEN]", dob: "[HIDDEN]" }

console.log(safeLog({ name: "Bob", password: "pass", pin: "9999" }));
// => { name: "Bob", password: "[HIDDEN]", pin: "[HIDDEN]" }
```

---

### `sanitizeString(str, [options])` → `string`

Scans a **raw string** (e.g. a log line) for built-in sensitive patterns and replaces them.

Built-in patterns detected:

| Pattern | Example |
|---|---|
| JWT tokens | `eyJhbGci...` |
| Credit card numbers | `4111 1111 1111 1111` |
| US Social Security Numbers | `123-45-6789` |
| AWS Access Key IDs | `AKIAIOSFODNN7EXAMPLE` |
| PEM private key blocks | `-----BEGIN RSA PRIVATE KEY-----` |

| Parameter | Type | Default | Description |
|---|---|---|---|
| `str` | `string` | — | The string to sanitize. |
| `options.replacement` | `string` | `"[REDACTED]"` | Replacement text. |
| `options.patterns` | `Array<{ name: string, pattern: RegExp }>` | `[]` | Additional patterns to detect. Each `pattern` must be a global RegExp. |

**Returns:** A new string with sensitive patterns replaced.

**Throws:** `TypeError` if `str` is not a string, `options` is not a plain object, `replacement` is not a string, or `patterns` is not an array.

#### Example

```js
const { sanitizeString } = require("safelog-js");

const rawLog = "Login attempt with Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig";
console.log(sanitizeString(rawLog));
// => "Login attempt with Bearer [REDACTED]"

// Custom pattern
sanitizeString("Employee: EMP-9999 checked in", {
  patterns: [{ name: "empId", pattern: /EMP-\d+/g }]
});
// => "Employee: [REDACTED] checked in"
```

---

### `createExpressMiddleware([options])` → `Express middleware`

Creates an Express middleware that attaches **`req.safeBody`** — a redacted clone of `req.body` — to every incoming request. Use `req.safeBody` in your logger instead of `req.body`.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `options.sensitiveKeys` | `string[]` | `[]` | Extra key names to redact. |
| `options.replacement` | `string` | `"******"` | Replacement string. |

**Returns:** `function(req, res, next)` — standard Express middleware.

**Throws:** `TypeError` on invalid options (at creation time).

#### Example

```js
const express = require("express");
const { createExpressMiddleware } = require("safelog-js");

const app = express();
app.use(express.json());
app.use(createExpressMiddleware()); // attaches req.safeBody on every request

app.post("/login", (req, res) => {
  // Safe to log — passwords are masked
  console.log("Login attempt:", req.safeBody);
  // => { username: "alice", password: "******" }

  // req.body still has the real values for your business logic
  authenticate(req.body.username, req.body.password);
  res.send("ok");
});
```

---

## Default Sensitive Keys

The following key names are redacted automatically (case-insensitive, ignoring hyphens and underscores):

```
password, passwd, pwd, pass, secret, clientSecret, privateKey, encryptionKey,
token, accessToken, refreshToken, idToken, bearerToken, authToken, sessionToken,
csrfToken, apiKey, apiSecret, appSecret, authorization, auth, bearer,
cookie, sessionId, session, creditCard, cardNumber, cvv, cvc, pan,
ssn, sin, taxId, driverLicense, passport, nationalId, otp, mfaCode,
totpSecret, pin
```

You can extend this list per-call using `options.sensitiveKeys`.

---

## Limitations

- `sanitizeString` uses regex patterns which may produce false positives for credit card numbers (any 13–19 digit sequence).
- Non-plain objects (class instances) are passed through without deep-cloning to avoid unintended side effects. Only the properties of plain objects and arrays are inspected.
- Getters are preserved as-is and are **not** executed during redaction to avoid side effects.

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

[MIT](./LICENSE) © Srikar
