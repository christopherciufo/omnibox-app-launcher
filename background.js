// ---------------------------------------------
// [Author] Christopher Ciufo
// [Description] Omnibox App Launcher controller
// [Created] 2015/06/18
// ---------------------------------------------
(function () {
  "use strict";

  var appTypes = ["hosted_app", "packaged_app", "legacy_packaged_app"];
  var chromeUrls = [
    { type: "built_in", name: "Apps", description: "chrome://apps" },
    { type: "built_in", name: "Bookmarks", description: "chrome://bookmarks" },
    { type: "built_in", name: "Downloads", description: "chrome://downloads" },
    { type: "built_in", name: "Extensions", description: "chrome://extensions" },
    { type: "built_in", name: "History", description: "chrome://history" },
    { type: "built_in", name: "Settings", description: "chrome://settings" }
  ];

  var fuse;
  var appList = {};
  var previousContent = "";
  var previousText = "";

  chrome.omnibox.onInputStarted.addListener(function () {
    chrome.management.getAll(function (apps) {
      apps = _.filter(apps, function(app) {
        return app.enabled && _.includes(appTypes, app.type);
      });
      fuse = new Fuse(chromeUrls.concat(apps), { keys: ["name", "description"] });
    });
  });

  chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    if (text.length == 0) return;

    var results = fuse.search(text);
    if (results.length > 0) {
      var topSuggestion = results[0];

      previousText = text;
      previousContent = topSuggestion.name;
      appList[previousContent] = topSuggestion;

      chrome.omnibox.setDefaultSuggestion({
        description: "<dim>Launch</dim> " + generateDescription(topSuggestion)
      });

      var suggestions = [];
      for (var i = 1; i < _.min([results.length, 5]); i++) {
        suggestions.push({
          content: results[i].name,
          description: generateDescription(results[i])
        });
        appList[results[i].name] = results[i];
      }
      suggest(suggestions);
    } else {
      chrome.omnibox.setDefaultSuggestion({ description: "No matches" });
    }
  });

  chrome.omnibox.onInputEntered.addListener(function (text, disposition) {
    var searchKey = (text == previousText) ? previousContent : text;

    var app = appList[searchKey];
    if (app.type === "built_in") {
      chrome.tabs.create({ url: app.description });
    } else {
      chrome.management.launchApp(appList[searchKey].id);
    }
  });

  function generateDescription (app) {
    var description = _.escape(app.name);
    if (app.description.length > 0) {
      description += " - <dim>" + _.escape(app.description) + "</dim>";
    }
    return description;
  }

})();
