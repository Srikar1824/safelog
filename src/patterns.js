/**
 * @file patterns.js
 * Default lists of sensitive key names and value-level patterns
 * used by safelog-js for automatic redaction.
 */

/**
 * List of key names considered sensitive by default.
 * Matching is case-insensitive and ignores hyphens/underscores.
 *
 * @type {string[]}
 */
const DEFAULT_SENSITIVE_KEYS = [
  // Authentication & credentials
  "password",
  "passwd",
  "pwd",
  "pass",
  "secret",
  "clientSecret",
  "privateKey",
  "encryptionKey",

  // Tokens
  "token",
  "accessToken",
  "refreshToken",
  "idToken",
  "bearerToken",
  "authToken",
  "sessionToken",
  "csrfToken",

  // API / keys
  "apiKey",
  "apiSecret",
  "appSecret",

  // Auth headers
  "authorization",
  "auth",
  "bearer",

  // Session & cookies
  "cookie",
  "sessionId",
  "session",

  // Payment card data
  "creditCard",
  "cardNumber",
  "cvv",
  "cvc",
  "pan",

  // Personal identifiers
  "ssn",
  "sin",
  "taxId",
  "driverLicense",
  "passport",
  "nationalId",

  // MFA / OTP
  "otp",
  "mfaCode",
  "totpSecret",
  "pin"
];

/**
 * Regex patterns for detecting sensitive values in raw strings.
 * Each entry has a `name` (for reference) and a `pattern` (RegExp).
 *
 * @type {Array<{ name: string, pattern: RegExp }>}
 */
const VALUE_PATTERNS = [
  {
    name: "jwt",
    // Three base64url segments separated by dots
    pattern: /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g
  },
  {
    name: "creditCard",
    // 13–19 digit card numbers, optionally space/dash separated
    pattern: /\b(?:\d[ -]?){13,19}\b/g
  },
  {
    name: "ssn",
    // US Social Security Number: XXX-XX-XXXX
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g
  },
  {
    name: "awsKey",
    // AWS access key IDs
    pattern: /\b(?:AKIA|AIPA|ASIA|AROA)[A-Z0-9]{16}\b/g
  },
  {
    name: "privateKeyBlock",
    // PEM private key blocks
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g
  }
];

module.exports = {
  DEFAULT_SENSITIVE_KEYS,
  VALUE_PATTERNS
};
