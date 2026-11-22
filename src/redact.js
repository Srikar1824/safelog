
const { DEFAULT_SENSITIVE_KEYS } = require("./patterns");

// Normalize keys for consistent matching
function normalizeKey(key) {
  return key.toLowerCase().replace(/[-_\s]/g, "");
}

// Check whether a property name is sensitive
function isSensitiveKey(key, sensitiveKeys) {
  const normalizedKey = normalizeKey(key);

  return sensitiveKeys.some(
    (sensitiveKey) =>
      normalizedKey === normalizeKey(sensitiveKey)
  );
}

// Main redaction function
function redact(data, options = {}) {
  if (
    options === null ||
    typeof options !== "object" ||
    Array.isArray(options)
  ) {
    throw new TypeError("options must be an object");
  }

  const {
    sensitiveKeys = [],
    replacement = "******"
  } = options;

  if (
    !Array.isArray(sensitiveKeys) ||
    !sensitiveKeys.every(
      (key) => typeof key === "string" && key.length > 0
    )
  ) {
    throw new TypeError(
      "sensitiveKeys must be an array of non-empty strings"
    );
  }

  if (typeof replacement !== "string") {
    throw new TypeError("replacement must be a string");
  }

  const allSensitiveKeys = [
    ...DEFAULT_SENSITIVE_KEYS,
    ...sensitiveKeys
  ];

  const seen = new WeakMap();

  function process(value) {
    if (value === null || typeof value !== "object") {
      return value;
    }

    if (value instanceof Date) {
      return new Date(value.getTime());
    }

    if (Buffer.isBuffer(value)) {
      return Buffer.from(value);
    }

    if (value instanceof RegExp) {
      const copy = new RegExp(value.source, value.flags);
      copy.lastIndex = value.lastIndex;
      return copy;
    }

    // Prevent circular references
    // and preserve shared references
    if (seen.has(value)) {
      return seen.get(value);
    }

    // Handle arrays
    if (Array.isArray(value)) {
      const result = new Array(value.length);
      seen.set(value, result);

      for (let i = 0; i < value.length; i++) {
        if (Object.prototype.hasOwnProperty.call(value, i)) {
          result[i] = process(value[i]);
        }
      }

      return result;
    }

    const prototype = Object.getPrototypeOf(value);

    // Process only plain objects
    if (
      prototype !== Object.prototype &&
      prototype !== null
    ) {
      return value;
    }

    const result = Object.create(prototype);
    seen.set(value, result);

    for (const key of Object.keys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(
        value,
        key
      );

      if (isSensitiveKey(key, allSensitiveKeys)) {
        Object.defineProperty(result, key, {
          value: replacement,
          enumerable: descriptor.enumerable,
          configurable: descriptor.configurable,
          writable: "writable" in descriptor
            ? descriptor.writable
            : true
        });
      } else if ("value" in descriptor) {
        Object.defineProperty(result, key, {
          ...descriptor,
          value: process(descriptor.value)
        });
      } else {
        // Preserve getters and setters without executing them
        Object.defineProperty(result, key, descriptor);
      }
    }

    return result;
  }

  return process(data);
}

module.exports = {
  redact
};
