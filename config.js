"use strict";
exports.DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://thinkful:thinkful1@ds043350.mlab.com:43350/blog-api-database";
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "mongodb://localhost/test-tempTestDb";
exports.PORT = process.env.PORT || 8090;

