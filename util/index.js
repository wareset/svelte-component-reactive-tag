const {
  classes: parse_classes,
  styles: parse_styles,
  attributes: parse_attributes
} = require('./parsers');
const { actions, events_factory } = require('./actions');
const deep_equal = require('@wareset/deep-equal');
const parse_css = require('./lib/parse_css');

// CLASSES
function classes_normalize(...args) {
  const [node, cache = {}] = this;
  if (deep_equal(cache.dirty_classes, args)) return cache.saved_classes;
  cache.dirty_classes = args;

  let external = [];
  const classes = parse_classes(...args);
  if (!node) cache.classes = classes;
  else {
    const old = cache.classes || (cache.classes = []);
    external = [...node.classList].filter(v => !old.some(v2 => v === v2));
    cache.classes = classes;
  }

  const res = [...classes, ...external].join(' ');
  cache.saved_classes = res;
  // console.log('classes_normalize', !!node, res, external);
  return res;
}

// STYLES
function styles_normalize(...args) {
  const [node, cache = {}] = this;
  if (deep_equal(cache.dirty_styles, args)) return cache.saved_styles;
  cache.dirty_styles = args;

  let external = [];
  const styles = parse_styles(...args);
  if (!node) cache.styles = styles;
  else {
    const old = cache.styles || (cache.styles = []);
    external = parse_css(node.style.cssText).filter(
      v => !old.some(v2 => v[0] === v2[0] && v[1] === v2[1])
    );
    cache.styles = styles;
  }

  const res = [...styles, ...external].map(v => v.join(':')).join(';');
  cache.saved_styles = res;
  // console.log('styles_normalize', !!node, external);
  return res;
}

// ATTRS
function attributes_normalize(attrs) {
  const [, cache = {}] = this;
  if (deep_equal(cache.dirty_attributes, attrs)) return cache.saved_attributes;
  cache.dirty_attributes = attrs;

  const attributes = parse_attributes(attrs);
  cache.saved_attributes = attributes;
  // console.log('attributes_normalize', attributes);
  return attributes;
}

// OTHERS
const is_void = v => v === null || v === undefined;

const set_if_isset = (obj, k, v) => {
  try {
    if (obj && k in obj) is_void(v) ? (obj[k] = '') : (obj[k] = v);
  } catch (err) {}
};

const data_option = v => {
  return v.value; // || v.label || v.text || v.textContent;
};

module.exports = {
  classes_normalize,
  styles_normalize,
  attributes_normalize,
  events_factory,
  actions,
  is_void,
  set_if_isset,
  data_option
};
