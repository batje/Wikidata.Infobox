//import Infobox from "./Infobox";

var debug = {};

var element = $("#infobox");
$('#getentities').on("click", {
  element: element,
  Q: "Q50719",
  langs: ['en', 'fr', 'nl']
}, showInfobox);

var box = new Wikidata.InfoBox();
//InfoBox();

function showInfobox(event) {
  html = box.getentities(event.data.Q, event.data.langs);
  event.data.element.html(html);
}

var Q = window.location.search.substr(1);
html = box.getentities(Q, ['en', 'fr', 'nl']);
element.html(html);
