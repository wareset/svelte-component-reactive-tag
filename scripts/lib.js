const fs = require('fs');
const path = require('path');
const svelte = require('svelte/compiler');

const { version: version_svelte } = require(path.resolve(
  path.dirname(require.resolve('svelte')),
  'package.json'
));

const { version: version_plugin } = require(path.resolve(
  __dirname,
  '../package.json'
));

const version = '-s' + version_svelte + '-p' + version_plugin;

const DIR_CACHE = path.resolve(__dirname, '../cache');
if (!fs.existsSync(DIR_CACHE)) fs.mkdirSync(DIR_CACHE);

const FILE_SRC_NODE = path.resolve(__dirname, '../src/Node.svelte');

function build_tag(opts = {}) {
  if (opts.generate !== 'ssr') opts.generate = 'dom';

  const content_tag = fs.readFileSync(FILE_SRC_NODE, { encoding: 'utf8' });
  let code = svelte.compile(content_tag, opts).js.code;

  if (opts.generate === 'ssr') {
    code = code.replace(/reactivenode/g, `\$\{tag\}`);
  } else {
    const ctx = `ctx[${code.match(/\/\*\s*tag\s*\*\/\s*ctx\[(\d)\]/)[1]}]`;
    code = code.replace(/(\"|\'|\`)reactivenode(\"|\'|\`)/g, ctx);
  }

  fs.writeFileSync(
    path.resolve(DIR_CACHE, opts.generate + version + '.js'),
    code
  );
}
// build_tag();

function check_tag(opts = {}) {
  if (opts.generate !== 'ssr') opts.generate = 'dom';
  const file = path.resolve(DIR_CACHE, opts.generate + version + '.js');
  return fs.existsSync(file) || build_tag(opts);
}

module.exports = { build_tag, check_tag, version };
