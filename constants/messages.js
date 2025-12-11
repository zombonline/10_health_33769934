module.exports = {
  AUTH: {
    LOGIN: {
      SUCCESS: 'Login successful',
      FAILED: 'Login failed',
      INVALID_PASSWORD: 'Incorrect password',
      USER_NOT_FOUND: 'User not found',
    },
    LOGOUT: {
      SUCCESS: 'Logout successful',
      FAILED: 'Error logging out',
    },
    REGISTRATION: {
      SUCCESS: 'Registration successful',
      FAILED: 'Registration failed',
      USER_EXISTS: 'Username already exists',
      PASSWORD_TOO_SHORT: (min) =>
        `Password must be at least ${min} characters long`,
      USERNAME_TOO_SHORT: (min) =>
        `Username must be at least ${min} characters long`,
      INVALID_EMAIL: 'Invalid email address',
    },
    UPDATE: {
      EMAIL_UPDATED_SUCCESSFULLY: 'Email updated successfully',
      PASSWORD_UPDATED_SUCCESSFULLY: 'Password updated successfully',
      NAME_UPDATED_SUCCESSFULLY: 'Name updated successfully',
      USERNAME_UPDATED_SUCCESSFULLY: 'Username updated successfully',
      PROFILE_PICTURE_UPDATED_SUCCESSFULLY:
        'Profile picture updated successfully',
    },
    UNKNOWN: 'An unknown error occurred',
    PERMISSION_DENIED: 'You do not have permission to perform this action',
  },
  SEARCH: {
    NO_USERS_FOUND: 'No users found matching your search criteria',
    NO_GOALS_FOUND: 'No goals found matching your search criteria',
  },
};
