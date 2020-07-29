const unique = require('@wareset/unique');
const cssPropertyNormalize = require('css-property-normalize');
const { bubble, listen } = require('svelte/internal');

// CLASSES
function _get_classes(...args) {
  const res = [];
  if (args.length) {
    const a = args.length === 1 ? args[0] : args;
    if (Array.isArray(a)) a.forEach((v) => res.push(..._get_classes(v)));
    else if (typeof a === 'object') {
      Object.keys(a).forEach((v) => a[v] && res.push(v));
    } else res.push(a);
  }
  return res;
}

function classes_normalize(...args) {
  return _get_classes(...args)
    .map((v) => v.trim())
    .filter(unique)
    .join(' ');
}

// STYLES
function _get_styles(...args) {
  const res = [];
  if (args.length) {
    const a = args.length === 1 ? args[0] : args;
    if (Array.isArray(a)) a.forEach((v) => res.push(..._get_styles(v)));
    else if (typeof a === 'object') {
      Object.keys(a).forEach((v) => {
        if (!a[v] && typeof a[v] !== 'number') return;
        const prop = cssPropertyNormalize(v, false, true);
        if (prop) res.push(`${prop}:${a[v]}`);
      });
    } else res.push(a);
  }
  return res;
}

function styles_normalize(...args) {
  return _get_styles(...args)
    .map((v) => v.replace(/\;\s*$/, ''))
    .join(';');
}

// ATTRS
function attributes_normalize(attrs = {}) {
  const res = {};
  Object.keys(attrs).forEach((k) => {
    const v = attrs[k];
    if (!(v === null || v === undefined)) {
      res[k] = v === '' || typeof v === 'object' ? true : v;
    }
  });
  return res;
}

// EVENTS
function events_action_factory(component) {
  return (node) => {
    const listens = [];
    Object.keys(component.$$.callbacks).forEach((event) => {
      listens.push(listen(node, event, (e) => bubble(component, e)));
    });
    return { destroy: () => listens.forEach((listener) => listener()) };
  };
}

// USES
function _get_uses(...args) {
  const new_uses = [];
  args.forEach((v) => {
    if (!v) return;
    if (!Array.isArray(v)) v = [v];
    if (typeof v[0] === 'function') {
      const [fn, props] = v;
      new_uses.push({ fn, props });
    } else new_uses.push(..._get_uses(...v));
  });
  return new_uses;
}

function uses_normalize(node, need_update, use, current_use) {
  if (!node || need_update) return current_use;
  const new_use = _get_uses(use);
  current_use.forEach((v) => {
    if (new_use.some((v2) => v.fn === v2.fn)) return;
    if (v.use && v.use.destroy) v.use.destroy.call(null);
  });
  new_use.forEach((v) => {
    let cur;
    current_use.some((v2) => v.fn === v2.fn && (cur = v2));
    if (!cur || !('use' in cur)) v.use = v.fn.call(null, node, v.props);
    else {
      v.use = cur.use;
      if (v.use.update) v.use.update.call(null, v.props);
    }
  });
  return new_use;
}

// OTHERS
const set_if_isset = (obj, k, v) => obj && k in obj && (obj[k] = v);

module.exports = {
  classes_normalize,
  styles_normalize,
  attributes_normalize,
  events_action_factory,
  uses_normalize,
  set_if_isset,
};
