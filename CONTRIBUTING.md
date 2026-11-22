# Contributing to safelog-js

Thank you for your interest in contributing! 🎉

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/Srikar1824/safelog.git
   cd safelog
   ```
3. There are **no runtime dependencies** to install.

## Running Tests

This package uses Node.js's built-in test runner (requires Node.js ≥ 18):

```bash
npm test
```

All tests must pass before submitting a pull request.

## Project Structure

```
safelog-js/
├── src/
│   ├── index.js          # Public exports
│   ├── redact.js         # Core deep-clone + key redaction logic
│   ├── redactString.js   # Raw string pattern redaction
│   ├── createRedactor.js # Factory function
│   ├── middleware.js      # Express middleware
│   └── patterns.js       # Default sensitive keys + value patterns
├── tests/
│   ├── redact.test.js
│   ├── createRedactor.test.js
│   ├── sanitizeString.test.js
│   └── middleware.test.js
├── examples/
│   ├── basic.js
│   ├── createRedactor.js
│   └── express-middleware.js
├── README.md
├── CHANGELOG.md
└── package.json
```

## Submitting a Pull Request

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Write your code and tests.
3. Ensure `npm test` passes.
4. Commit using a clear message: `git commit -m "feat: describe your change"`
5. Push and open a pull request against `main`.

## Reporting Issues

Please use [GitHub Issues](https://github.com/Srikar1824/safelog/issues) to report bugs or request features. Include a minimal reproduction example when possible.

## Code Style

- Use `"use strict"` at the top of every source file.
- Keep functions small and focused.
- Add JSDoc comments to all exported functions.
- Prefer `const` over `let`; never use `var`.
