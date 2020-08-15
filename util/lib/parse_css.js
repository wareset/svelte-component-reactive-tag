const cssPropertyNormalize = require('css-property-normalize');

const CSS_VALUE_REGEX = /((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/g;

module.exports = function parse_css(v) {
  let res = [];

  const matches = v.match(CSS_VALUE_REGEX);
  if (!matches || !matches.length) return res;

  const cache = {};
  for (let i = matches.length; i-- > 0; undefined) {
    let [k, v] = matches[i].split(/:/);
    (k = k && cssPropertyNormalize(k, false, true)), (v = v.trim());
    if (!(k in cache) && k && v) (cache[k] = 1), (res = [[k, v], ...res]);
  }

  return res;
};
