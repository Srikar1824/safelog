# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-11-22

### Added
- `redact(data, options)` — deep-clone and redact sensitive object fields.
- `createRedactor(options)` — factory for pre-configured redactor functions.
- `sanitizeString(str, options)` — redact sensitive patterns from raw strings (JWTs, credit card numbers, SSNs, AWS keys, PEM blocks).
- `createExpressMiddleware(options)` — Express middleware that attaches `req.safeBody`.
- 40+ built-in sensitive key names (passwords, tokens, API keys, PII identifiers).
- 5 built-in value-level regex patterns.
- Full support for nested objects, arrays, circular references, Dates, Buffers, RegExps, and sparse arrays.
- Case-insensitive and naming-convention-agnostic key matching (camelCase, snake_case, kebab-case).
- 50+ unit tests.
- Full README with API documentation, usage examples, and contribution guide.
