const FORBIDDEN = "<h1>Error</h1><p>Does not have access to the requested resource</p>";
const FORBIDDEN_STATUS_CODE = 403;

const NOT_FOUND = "<h1>Error</h1><p>NOT FOUND</p>";
const NOT_FOUND_STATUS_CODE = 404;

const PORT = 8080;

const UNAUTHORIZED_USER = "<h1>Error</h1><p>Please either log in or register to perform the requested action.</p>";
const UNAUTHORIZED_USER_STATUS_CODE = 401;

module.exports = {
  FORBIDDEN,
  FORBIDDEN_STATUS_CODE,
  NOT_FOUND,
  NOT_FOUND_STATUS_CODE,
  PORT,
  UNAUTHORIZED_USER,
  UNAUTHORIZED_USER_STATUS_CODE
};
