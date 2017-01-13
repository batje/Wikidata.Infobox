"use strict"

var instance;


/**
 * Class TemplateFetcherClass
 */
class TemplateFetcherClass {
  constructor() {
    // empty
  }

  getTemplate(name, handlebar, loadcss) {
    var me = this;
    if (typeof handlebar.templates[name] === 'undefined') {
      var result = new Promise(function(resolve, reject) {
        $.ajax('./templates2/' + name + '.hbs')
          .done(function(data) {
            handlebar.templates[name] = handlebar.compile(data);
            console.log("Compiled template " + name);
            resolve(handlebar.templates[name]);
          })
          .catch(function(e) {
            resolve(handlebar.templates['defaultText']);
          });
      });
      console.log("Return Promise to fetch template " + name);
      if (loadcss) {
        console.log("Loading css for ", name);
        $('<link>')
          .appendTo('head')
          .attr({
            type: 'text/css',
            rel: 'stylesheet'
          })
          .attr('href', 'templates/' + name + '.css');
      }


      handlebar.templates[name] = result;
      return result;
    } else {
      return Promise.resolve(handlebar.templates[name]);
    }
    //};
  };
}

function TemplateFetcher(HandleBar) {
  if (typeof instance === 'undefined') {
    instance = new TemplateFetcherClass(HandleBar);
  }
  return instance;
}

export default {
  TemplateFetcher
};
