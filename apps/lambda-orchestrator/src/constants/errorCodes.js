/**
 * Error codes para Lambda Orchestrator
 * Definidos localmente para evitar dependencias del monorepo
 */
const ErrorCode = {
  // Success codes
  OK: 200,
  CREATED: 201,
  
  // Client errors
  ERROR_VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  
  // Server errors
  ERROR_SERVER: 500,
  
  // Custom
  NONE: 0
};

module.exports = { ErrorCode };
