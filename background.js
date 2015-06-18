// ---------------------------------------------
// [Author] Christopher Ciufo
// [Description] Omnibox App Launcher controller
// [Created] 2015/06/18
// ---------------------------------------------
(function () {
  'use strict';

  var topSuggestion = {};
  var suggestions = [];

  chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    chrome.management.getAll(function (results) {
      topSuggestion = {
        description: "<dim>Launch</dim> " + results[0].name + " - <dim>" + results[0].description + "</dim>"
      };

      for (var i = 1; i < 5; i++) {
        suggestions.push({
          content: results[i].name,
          description: results[i].name + (results[i].description ? " - <dim>" + results[i].description + "</dim>" : "")
        });
      }

      chrome.omnibox.setDefaultSuggestion(topSuggestion);
      suggest(suggestions);
    });
  });

  chrome.omnibox.onInputEntered.addListener(function (text, disposition) {
    alert(text);
  }); 

})();
