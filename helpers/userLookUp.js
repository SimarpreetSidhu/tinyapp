const userLookUp = function(obj,email) {
  for(let key in obj){
    if(obj[key].hasOwnProperty('email')){
      if(obj[key].email === email){
        return obj[key];
        }
    }
  }
  return null ;

}

module.exports = userLookUp;