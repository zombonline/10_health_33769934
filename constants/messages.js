module.exports = {
  AUTH: {
    LOGIN: {
      SUCCESS: "Login successful",
      FAILED: "Login failed",
      INVALID_PASSWORD: "Invalid password",
      USER_NOT_FOUND: "User not found",
    },
    LOGOUT: {
      SUCCESS: "Logout successful",
      FAILED: "Error logging out",
    },
    REGISTRATION: {
      SUCCESS: "Registration successful",
      FAILED: "Registration failed",
      USER_EXISTS: "Username already exists",
      PASSWORD_TOO_SHORT: (min) =>
        `Password must be at least ${min} characters long`,
      USERNAME_TOO_SHORT: (min) =>
        `Username must be at least ${min} characters long`,
      INVALID_EMAIL: "Invalid email address",
    },
    MISSING_FIELDS: "Please fill in all required fields",
    USERNAME_TOO_SHORT: (min) =>
      `Username must be at least ${min} characters long`,
    INVALID_EMAIL: "Invalid email address",

    UNKNOWN: "An unknown error occurred",
    PERMISSION_DENIED: "You do not have permission to perform this action",
  },
};
