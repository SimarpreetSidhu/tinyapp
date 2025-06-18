const urlsForUser = function(obj,id) {
  const filteredURLs = {};
  for (let key in obj) {
    if (obj[key].hasOwnProperty('userID')) {
      const urlEntry = obj[key];
      if (urlEntry.userID === id) {
        filteredURLs[key] = urlEntry;
      }
    }
  }
  return filteredURLs;

};

module.exports = urlsForUser;