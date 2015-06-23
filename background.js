// ---------------------------------------------
// [Author] Christopher Ciufo
// [Description] Omnibox App Launcher controller
// [Created] 2015/06/18
// ---------------------------------------------
(function () {
  'use strict';

  function escapeText(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
  }

  function generateDescription (result) {
    return escapeText(result.name) + (escapeText(result.description) ? " - <dim>" + escapeText(result.description) + "</dim>" : "");
  }

  var fuse;
  var idStore = {};
  var currentContent = "";
  var previousText = "";

  chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    if (text.length) {
      if (typeof fuse === 'undefined') {
        chrome.management.getAll(function (searchList) {
          fuse = new Fuse(searchList, {
            keys:['name', 'description']
          });
          displaySuggestions(text, suggest);
        });
      } else {
        displaySuggestions(text, suggest);
      }
    }
  });

  function displaySuggestions(text, suggest) {
    var results = fuse.search(text);
    if (results.length) {
      var topSuggestion = {
        description: "<dim>Launch</dim> " + generateDescription(results[0])
      };
      currentContent = results[0].name;
      idStore[currentContent] = results[0].id;
      previousText = text;

      chrome.omnibox.setDefaultSuggestion(topSuggestion);
      
      var suggestions = [];
      for (var i = 1; i < Math.min(results.length, 5); i++) {
        suggestions.push({
          content: results[i].name,
          description: generateDescription(results[i])
        });
        idStore[results[i].name] = results[i].id;
      }
      suggest(suggestions);
    }
  }

  chrome.omnibox.onInputEntered.addListener(function (text, disposition) {
    var searchKey;
    if (text == previousText) {
      searchKey = currentContent;
    } else {
      searchKey = text;
    }
    chrome.management.launchApp(idStore[searchKey]);
  }); 

})();
