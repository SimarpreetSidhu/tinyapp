const getUserByEmail  = function(database,email) {
  for (let key in database) {
    let user = database[key];
    if (user.hasOwnProperty('email')) {
      if (user.email === email) {
        return user;
      }
    }
  }
  return null;

};

module.exports = getUserByEmail;