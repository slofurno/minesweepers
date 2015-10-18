
"use strict";
module.exports = function(getKey){
  var store = {};

  var getEnumerator = function(){
    var keys = Object.keys(store);
    return keys.map(function(key){
      return store[key];
    });
  };

  var add = function(key, element){
    //var key = getKey(element);
    store[key]=element;
  };

  var remove = function(key){
    delete store[key];
  };

  var get = function(key){
    return store[key];
  };


  return {getEnumerator:getEnumerator, add:add, remove:remove, get:get};

};
