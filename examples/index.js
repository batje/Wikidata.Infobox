//import Infobox from "./Infobox";

var debug = {};

var box = new Wikidata.InfoBox();
box.Monitor();


$(".searchbox").autocomplete({
  source: function(request, response) {
    console.log(request.term);
    $.ajax({
      url: "https://www.wikidata.org/w/api.php",
      dataType: "jsonp",
      data: {
        'action': "wbsearchentities",
        'format': "json",
        'search': request.term,
        'language': 'en-gb',
        'uselang': 'en-gb',
        'type': 'item'
      },
      error: function(data) {
        $("#infobox")[0].innerHTML = "Woops, error";
      },
      success: function(data) {
        console.log(data);
        var result = {};
        data.search.forEach(function(element, index, array) {
          result[index] = {};
          result[index].label = element.label;
          result[index].value = element.id;
        });
        response(result);
      }
    });
  },
  select: function(event, ui) {
    console.log(ui);
    $("#search input[name=s]")[0].value = ui.item.value;
    //    $("#infobox")[0].dataset.wikidata = ui.item.value;
    console.log(ui);
    render();
  }

});

function render() {

  $("#popupbox")[0].dataset.wikidata = $("#search input[name=s]")[0].value;

  $("#infobox")[0].dataset.wikidata = $("#search input[name=s]")[0].value;
  $("#infobox")[0].dataset.wikidatatemplate = $("#search select[name=template]")[0].value;

  box.Populate("infobox");

}

var t = getParameterByName("template");
if (t.length > 0) {
  $("#search select[name=template] option[value='" + t + "']").prop('selected', true);
}


var Q = getParameterByName("s");
if (Q.length > 0) {
  $("#search input[name=s]")[0].value = Q;
  render();
}



function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  var match2 = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  if (!match2) {
    match2 = ""
  }
  return match2;
}

/*var element = $("#infobox");
$('#getentities').on("click", {
  element: element,
  Q: "Q50719",
  template: 'Q3305213',
  langs: ['en', 'fr', 'nl']
}, showInfobox);
*/



/*function showInfobox(event) {
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
*/
