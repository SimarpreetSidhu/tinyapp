const { assert } = require('chai');
const urlsForUser = require('../helpers/urlsForUsers.js');

describe('urlsForUser', function() {
  it('should return urls that belong to the specified user', function() {
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    const result = urlsForUser('user1', urlDatabase);
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the user has no urls', function() {
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" }
    };

    const result = urlsForUser('nonexistentUser', urlDatabase);
    assert.deepEqual(result, {});
  });

  it('should return an empty object if urlDatabase is empty', function() {
    const urlDatabase = {};

    const result = urlsForUser('user1', urlDatabase);
    assert.deepEqual(result, {});
  });

  it('should not return urls that do not belong to the user', function() {
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" }
    };

    const result = urlsForUser('user1', urlDatabase);
    const unexpectedURL = result["9sm5xK"];
    assert.isUndefined(unexpectedURL);
  });
});
