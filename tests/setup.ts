process.env["NODE_ENV"] = "test";
process.env["JWT_SECRET"] = "test-secret-do-not-use-in-prod";
process.env["JWT_EXPIRES_IN"] = "1h";
process.env["LOTTERY_API_URL"] = "https://fake-api.test";
process.env["ADMIN_PASSWORD_HASH"] = "";
process.env["JOHN_PASSWORD_HASH"] = "";
