const typed = require('@wareset-utilites/typed');

module.exports = function opts_normalize(opts = {}) {
  if (!typed(opts, Object)) opts = {};
  delete opts.css;
  delete opts.emitCss;
  delete opts.immutable;
  if (opts.generate !== 'ssr') opts.generate = 'dom';
  return opts;
};
