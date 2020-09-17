const opts_normalize = require('./opts_normalize');
const svelte = require('svelte/compiler');

const { name, version } = require('../../package.json');

function hash(str) {
  let hash = 5381;
  let i = str.length;
  while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
  return hash >>> 0;
}

module.exports = function get_filename(opts = {}) {
  opts = opts_normalize(opts);

  return [
    name,
    opts.generate,
    `s${svelte.VERSION}`,
    `p${version}`,
    `${hash(JSON.stringify(opts))}.js`
  ].join('-');
};
