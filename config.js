"use strict";
exports.DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost/tempTestDb";
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "mongodb://localhost/test-tempTestDb";
exports.PORT = process.env.PORT || 8090;