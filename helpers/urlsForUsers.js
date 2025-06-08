const urlsForUser = function(obj,id) {
  for(let key in obj){
    if(obj[key].hasOwnProperty('userID')){
      if(obj[key].userID === id){
        return obj[key].longURL;
        }
    }
  }
  return null ;

}

module.exports = urlsForUser;