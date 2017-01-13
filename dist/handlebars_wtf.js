(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['infobox'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return ((stack1 = helpers["if"].call(alias1,(data && data.first),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "<tr><td class=\"marker\" data-lat=\""
    + alias4(((helper = (helper = helpers.lat || (depth0 != null ? depth0.lat : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lat","hash":{},"data":data}) : helper)))
    + "\" data-lon=\""
    + alias4(((helper = (helper = helpers.lon || (depth0 != null ? depth0.lon : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lon","hash":{},"data":data}) : helper)))
    + "\" data-zoom=\""
    + alias4(((helper = (helper = helpers.zoom || (depth0 != null ? depth0.zoom : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"zoom","hash":{},"data":data}) : helper)))
    + "\">\n"
    + alias4((helpers.t || (depth0 && depth0.t) || alias2).call(alias1,(depth0 != null ? depth0.title : depth0),{"name":"t","hash":{},"data":data}))
    + " <i class=\"fa fa-map-marker\"></i>\n</td>\n</tr>\n"
    + ((stack1 = helpers["if"].call(alias1,(data && data.last),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    return "<table>\n  <th>"
    + container.escapeExpression((helpers.t || (depth0 && depth0.t) || helpers.helperMissing).call(depth0 != null ? depth0 : {},"home.panels.locations.pane",{"name":"t","hash":{},"data":data}))
    + "</th>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "</table>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.helpers : depth0)) != null ? stack1.debug : stack1), depth0))
    + "\n\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.locationsList : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
})();