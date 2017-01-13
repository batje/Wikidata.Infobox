/** @module InfoBox **/
export {
  /**
   * @class
   * @param just testing
   */
  InfoBox
}
from './InfoBox';

/* For later
export {
  InfoBoxSPARQL
}
from './InfoBoxSPARQL';
*/

var __modules = new Map();

function define(name, deps, factory) {
  __modules.set(name, {
    n: name,
    d: deps,
    e: null,
    f: factory
  });
}

function require(name) {
  console.log("Going to load module " + name, __modules);
  const module = __modules.get(name);
  if (!module.e) {
    module.e = {};
    module.f.apply(null, module.d.map(req));
  }
  return module.e;

  function req(name) {
    return name === 'exports' ? module.e : require(name);
  }
}
