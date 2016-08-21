//import Infobox from "./Infobox";

var debug = {};

var element = $("#infobox");
$('#getentities').on("click", {
  element: element,
  Q: "Q50719",
  langs: ['en', 'fr', 'nl']
}, showInfobox);

var fetcher = new Wikidata.LabelFetcher(['en', 'fr', 'nl']);
fetcher.Monitor("infobox");


var box = new Wikidata.InfoBox();
//InfoBox();

function showInfobox(event) {
  var languages = event.data.langs;
  html = box.Populate("infobox", event.data.Q, ['en', 'fr', 'nl'])
    .then(function(html) {
      //event.data.element.html(html);

      //      var fetcher = new Wikidata.LabelFetcher();
      //      fetcher.Populate("infobox", languages);
    })
    .catch(function(err) {
      console.error("Error coming back from Populate method", err);
      alert("We failed ");
    });
}

var Q = window.location.search.substr(1);
if (Q.length > 0) {
  box.Populate("infobox", Q, ['en', 'fr', 'nl']).then(function(html) {
    //  element.html(html);
    //  var fetcher = new Wikidata.LabelFetcher();
    //  fetcher.Populate("infobox", ['en', 'fr', 'nl']);
  })
}
