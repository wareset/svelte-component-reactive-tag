const unique = require('@wareset-utilites/unique');
const typed = require('@wareset-utilites/typed');
const parse_css = require('./lib/parse_css');

// CLASSES
function _get_classes(...args) {
  const res = [];
  if (args.length) {
    const a = args.length === 1 ? args[0] : args;

    switch (typed(a)) {
      case Array:
        a.forEach(v => res.push(..._get_classes(v)));
        break;
      case Object:
        Object.keys(a).forEach(v => a[v] && res.push(v));
        break;
      default:
        res.push('' + (a || ''));
        break;
    }
  }
  return res;
}

function classes(...args) {
  return _get_classes(...args)
    .join(' ')
    .split(/\s+/g)
    .filter(unique.bind(['']));
}

// STYLES
function _get_styles(...args) {
  const res = [];
  if (args.length) {
    const a = args.length === 1 ? args[0] : args;

    switch (typed(a)) {
      case Array:
        a.forEach(v => res.push(..._get_styles(v)));
        break;
      case Object:
        Object.keys(a).forEach(v => {
          if (a[v]) res.push(`${v}:${a[v]}`);
        });
        break;
      default:
        res.push('' + (a || ''));
        break;
    }
  }
  return res;
}

function styles(...args) {
  return parse_css(_get_styles(...args).join(';'));
}

const isBrowser = (() => typeof window !== 'undefined')();
// ATTRS
function _get_attributes(attrs = {}, component) {
  const res = {};
  if (!typed(attrs, Object)) return res;

  Object.keys(attrs).forEach(k => {
    if (k === 'class' || k === 'style' || k === 'use' || k === 'on') {
      return;
    }

    if (
      isBrowser &&
      (k === 'id' ||
        k === 'type' ||
        k === 'value' ||
        k === 'group' ||
        k === 'checked' ||
        k === 'indeterminate')
    ) {
      if (component && component.$set) component.$set({ [k]: attrs[k] });
      return;
    }

    const v = attrs[k];
    if (!(v === null || v === undefined)) {
      res[k] = v === '' || typeof v === 'object' ? true : v;
    }
  });
  return res;
}

function attributes(attrs, component) {
  return _get_attributes(attrs, component);
}

module.exports = {
  classes,
  styles,
  attributes
};
