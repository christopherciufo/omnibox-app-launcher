// ---------------------------------------------
// [Author] Christopher Ciufo
// [Description] Omnibox App Launcher controller
// [Created] 2015/06/18
// ---------------------------------------------
(function () {
  'use strict';

  var fuse;
  var searchList;
  var currentContent = "";
  var previousText = "";

  chrome.omnibox.onInputStarted.addListener(function () {
    chrome.management.getAll(function (results) {
      searchList = results;
      fuse = new Fuse(searchList, {
        keys:['name', 'description']
      });
    });
  });

  chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    if (text) {
      var results = fuse.search(text);
      if (results) {
        var topSuggestion = {
          description: "<dim>Launch</dim> " + results[0].name + " - <dim>" + results[0].description + "</dim>"
        };
        currentContent = results[0].name;
        previousText = text;

        chrome.omnibox.setDefaultSuggestion(topSuggestion);
        
        // var suggestions = [];
        // var numItems = Math.min(results.length, 5);

        // for (var i = 1; i < numItems; i++) {
        //   suggestions.push({
        //     content: results[i].name,
        //     description: results[i].name + (results[i].description ? " - <dim>" + results[i].description + "</dim>" : "")
        //   });
        // }

        // console.log(numItems);
        // console.log(suggestions);
        // suggest(suggestions);
      }
    }
  });

  chrome.omnibox.onInputEntered.addListener(function (text, disposition) {
    var searchKey;
    if (text == previousText) {
      searchKey = currentContent;
    } else {
      searchKey = text;
    }
    alert(searchKey);
  }); 

})();
