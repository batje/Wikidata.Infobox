(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['infobox'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  <td><ul>"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</ul>\n  </td>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "\n    <li>"
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.mainsnak : depth0)) != null ? stack1.datatype : stack1), depth0))
    + "</li>\n    ";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.first),{"name":"if","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},((stack1 = (depths[1] != null ? depths[1].entity : depths[1])) != null ? stack1.claims : stack1),{"name":"each","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3=container.escapeExpression;

  return ((stack1 = helpers["if"].call(alias1,(data && data.first),{"name":"if","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "")
    + "      <tr>\n        <td class=\"PropertyId\">"
    + alias3(((helper = (helper = helpers.key || (data && data.key)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"key","hash":{},"data":data,"blockParams":blockParams}) : helper)))
    + "</td>\n"
    + ((stack1 = helpers["with"].call(alias1,helpers.lookup.call(alias1,((stack1 = (depths[2] != null ? depths[2].labels : depths[2])) != null ? stack1.entities : stack1),(data && data.key),{"name":"lookup","hash":{},"data":data,"blockParams":blockParams}),{"name":"with","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "")
    + "         "
    + alias3((helpers.dynamictemplate || (depth0 && depth0.dynamictemplate) || alias2).call(alias1,(data && data.key),((stack1 = ((stack1 = (depth0 != null ? depth0["0"] : depth0)) != null ? stack1.mainsnak : stack1)) != null ? stack1.datatype : stack1),depth0,{"name":"dynamictemplate","hash":{},"data":data,"blockParams":blockParams}))
    + "\n\n"
    + ((stack1 = container.invokePartial(partials.myPartial,depth0,{"name":"myPartial","fn":container.program(14, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "      </tr>\n"
    + ((stack1 = helpers["if"].call(alias1,(data && data.last),{"name":"if","hash":{},"fn":container.program(16, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    <table>\n      <th>"
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.label : depth0)) != null ? stack1.labels : stack1)) != null ? stack1["0"] : stack1)) != null ? stack1.value : stack1), depth0))
    + "</th>\n";
},"9":function(container,depth0,helpers,partials,data,blockParams) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["with"].call(alias1,helpers.lookup.call(alias1,(depth0 != null ? depth0.labels : depth0),blockParams[3][0],{"name":"lookup","hash":{},"data":data,"blockParams":blockParams}),{"name":"with","hash":{},"fn":container.program(10, data, 0, blockParams),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "")
    + ((stack1 = helpers["with"].call(alias1,helpers.lookup.call(alias1,(depth0 != null ? depth0.descriptions : depth0),blockParams[3][0],{"name":"lookup","hash":{},"data":data,"blockParams":blockParams}),{"name":"with","hash":{},"fn":container.program(12, data, 0, blockParams),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data) {
    var helper;

  return "            <td class=\"labelvalue\">"
    + container.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"value","hash":{},"data":data}) : helper)))
    + "</td>\n";
},"12":function(container,depth0,helpers,partials,data) {
    var helper;

  return "            <td class=\"labeldescription\">"
    + container.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"value","hash":{},"data":data}) : helper)))
    + "</td>\n";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "          <td class=\"defaultlabel\">default value: "
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0["0"] : depth0)) != null ? stack1.mainsnak : stack1)) != null ? stack1.datavalue : stack1)) != null ? stack1.value : stack1)) != null ? stack1["0"] : stack1), depth0))
    + "</td>\n";
},"16":function(container,depth0,helpers,partials,data) {
    return "    </table>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "\n"
    + container.escapeExpression((helpers.debug || (depth0 && depth0.debug) || helpers.helperMissing).call(alias1,depth0,{"name":"debug","hash":{},"data":data,"blockParams":blockParams}))
    + "\n\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.languages : depth0),{"name":"each","hash":{},"fn":container.program(4, data, 1, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "")
    + " \n";
},"main_d":  function(fn, props, container, depth0, data, blockParams, depths) {

  var decorators = container.decorators;

  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"args":["myPartial"],"data":data,"blockParams":blockParams}) || fn;
  return fn;
  }

,"useDecorators":true,"usePartial":true,"useData":true,"useDepths":true,"useBlockParams":true});
templates['P18'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "<td>Picture "
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.mainsnak : depth0)) != null ? stack1.datavalue : stack1)) != null ? stack1.value : stack1), depth0))
    + " <img src=\"https://commons.wikimedia.org/w/thumb.php?width=100&f="
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.mainsnak : depth0)) != null ? stack1.datavalue : stack1)) != null ? stack1.value : stack1), depth0))
    + "\"></td>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return container.escapeExpression((helpers.debug || (depth0 && depth0.debug) || helpers.helperMissing).call(alias1,depth0,{"name":"debug","hash":{},"data":data}))
    + "\n\n"
    + ((stack1 = helpers.each.call(alias1,depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['commonsMedia'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "<td>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.mainsnak : depth0)) != null ? stack1.datavalue : stack1)) != null ? stack1.datatype : stack1), depth0))
    + " "
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.mainsnak : depth0)) != null ? stack1.datavalue : stack1)) != null ? stack1.value : stack1), depth0))
    + " </td>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return container.escapeExpression((helpers.debug || (depth0 && depth0.debug) || helpers.helperMissing).call(alias1,depth0,{"name":"debug","hash":{},"data":data}))
    + "\n\n"
    + ((stack1 = helpers.each.call(alias1,depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['defaultText'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<td>This is the default</td>\n";
},"useData":true});
templates['external-id'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<td>"
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.mainsnak : depth0)) != null ? stack1.datavalue : stack1)) != null ? stack1.value : stack1), depth0))
    + "</td>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['globe-coordinate'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<td>Geo: "
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.mainsnak : depth0)) != null ? stack1.datavalue : stack1)) != null ? stack1.value : stack1), depth0))
    + "</td>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['string'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<td>"
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.mainsnak : depth0)) != null ? stack1.datavalue : stack1)) != null ? stack1.value : stack1), depth0))
    + "</td>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['wikibase-item'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<td>"
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.mainsnak : depth0)) != null ? stack1.datavalue : stack1)) != null ? stack1.value : stack1), depth0))
    + "</td>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
})();