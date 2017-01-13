//import Infobox from "./Infobox";

var debug = {};

var fetcher = new Wikidata.LabelFetcher(['en', 'fr', 'nl']);
fetcher.Monitor("#infobox");


var element = $("#infobox");
$('#getentities').on("click", {
  element: element,
  Q: "Q50719",
  template: 'Q3305213',
  langs: ['en', 'fr', 'nl']
}, showInfobox);



var box = new Wikidata.InfoBox();
box.Monitor("infobox");

function showInfobox(event) {
  var languages = event.data.langs;
  html = box.Populate("infobox", event.data.Q, event.data.template, ['en', 'fr', 'nl'])
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
