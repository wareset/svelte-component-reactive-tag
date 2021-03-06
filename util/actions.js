const { bubble, listen } = require('svelte/internal');
const deep_equal = require('@wareset-utilites/deep-equal');
const unique = require('@wareset-utilites/unique');
// const typed = require('@wareset-utilites/typed');

// EVENTS
function events_factory(component) {
  return (element, obj) => {
    const defaults_listeners = [];
    const reactive_listeners = [];
    let __cached__reactive_listeners;

    Object.keys(component.$$.callbacks).forEach(event => {
      defaults_listeners.push(
        listen(element, event, e => bubble(component, e))
      );
    });

    function update(obj) {
      // if (!typed(obj, Object)) throw new Error('not Object');

      if (deep_equal(__cached__reactive_listeners, obj)) return;
      __cached__reactive_listeners = obj;

      reactive_listeners.forEach(listener => listener());
      reactive_listeners.length = 0;

      Object.keys(obj).forEach(event => {
        if (typeof obj[event] === 'object' && obj[event].$$) {
          const cmp = obj[event];
          Object.keys(cmp.$$.callbacks).forEach(ev => {
            reactive_listeners.push(listen(element, ev, e => bubble(cmp, e)));
          });
          return;
        }
        let fns = obj[event];
        if (!Array.isArray(fns)) fns = [fns];
        fns = fns.filter(v => typeof v === 'function');
        fns.forEach(fn => reactive_listeners.push(listen(element, event, fn)));
      });
    }

    update(obj);
    return {
      update,
      destroy: () => {
        defaults_listeners.forEach(listener => listener());
        reactive_listeners.forEach(listener => listener());
      }
    };
  };
}

// ACTIONS
function _get_actions(...a) {
  if (typeof a[0] === 'function') return [{ fn: a[0], props: a[1] }];
  const res = [];
  a = unique(a.filter(v => Array.isArray(v) || typeof v === 'function'));
  a.forEach(v => res.push(..._get_actions(...(Array.isArray(v) ? v : [v]))));
  return res;
}

function actions(element, use) {
  let current_use = [];
  let dirty_use;

  function update(use) {
    if (deep_equal(dirty_use, use)) return;
    dirty_use = use;

    const new_use = _get_actions(use);
    current_use.forEach(v => {
      if (new_use.some(v2 => v.fn === v2.fn)) return;
      if (v.use && v.use.destroy) v.use.destroy.call(null);
    });
    new_use.forEach(v => {
      let cur;
      current_use.some(v2 => v.fn === v2.fn && (cur = v2));
      if (!cur || !('use' in cur)) v.use = v.fn(element, v.props);
      else {
        v.use = cur.use;
        if (v.use.update && !deep_equal(v.props, cur.props)) {
          v.use.update(v.props);
        }
      }
    });
    current_use = new_use;
  }

  function destroy() {
    current_use.forEach(v => v.use && v.use.destroy && v.use.destroy());
  }

  update(use);
  return { update, destroy };
}

module.exports = {
  actions,
  events_factory
};
