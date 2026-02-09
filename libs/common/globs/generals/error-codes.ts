export enum ErrorCode {
  OK = 200,
  CREATED = 201,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  // No existe error, la operación se efectuó correctamente
  NONE = 0,
  UNIQUE = 100,
  ERROR_SERVER = 500,
  ERROR_VALIDATION = 400,

}
