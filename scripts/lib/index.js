const fs = require('fs');
const path = require('path');
const svelte = require('svelte/compiler');
const opts_normalize = require('./opts_normalize');
const get_filename = require('./get_filename');

const DIR_CACHE = path.resolve(__dirname, '../../cache');
if (!fs.existsSync(DIR_CACHE)) fs.mkdirSync(DIR_CACHE);

const FILE_SRC_ELEMENT = path.resolve(__dirname, '../../Element.svelte');

function build_tag(opts = {}) {
  opts = opts_normalize(opts);

  const content_tag = fs.readFileSync(FILE_SRC_ELEMENT, { encoding: 'utf8' });
  let code = svelte.compile(content_tag, opts).js.code;

  if (opts.generate === 'ssr') {
    code = code.replace(/sveltepluginelement/g, `\$\{tag\}`);
  } else if (opts.generate === 'dom') {
    const ctx = `ctx[${code.match(/[\s\n]tag\:\s*(\d+)[\s\n,]/)[1]}]`;
    code = code.replace(/["'`]sveltepluginelement["'`]/g, ctx);
    code = code.replace(
      /["'`]SVELTEPLUGINELEMENT["'`]/g,
      ctx + '.toUpperCase()'
    );
  }

  fs.writeFileSync(path.resolve(DIR_CACHE, get_filename(opts)), code);
}
// build_tag();

function check_tag(opts = {}) {
  opts = opts_normalize(opts);
  const file = path.resolve(DIR_CACHE, get_filename(opts));
  return fs.existsSync(file) || build_tag(opts);
}

module.exports = { build_tag, check_tag };
