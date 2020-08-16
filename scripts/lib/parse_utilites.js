const svelte = require('svelte/compiler');

function findTags(content, name = 'script', mods = 'gi') {
  const REGEXP = new RegExp(`<(${name})[^]*?>[^]*?<\/(${name})>`, mods);
  const matches = content.match(REGEXP);
  // console.log(matches);
  return matches;
}

function parseHtml(content, filename) {
  (findTags(content, 'script|style') || []).forEach(text => {
    content = content.replace(text, text.replace(/[^\s]/g, ' '));
  });
  return svelte.parse(content, { filename }).html;
}

function scriptMatch(content, isModule = false) {
  const regexpModule = /\<script[^>]*?context\=[`'"]module[`'"][^>]*?\>/i;

  // console.log(regexp);
  let res;
  (findTags(content, 'script') || []).filter(v => {
    let matches = v.match(regexpModule);
    if (!isModule === !matches) {
      if (!matches) {
        matches = v.match(/\<script[^]*?\>/i);
        matches.index += content.indexOf(v);
      }

      res = matches;
      return true;
    }
    return false;
  });
  // console.log(res);
  return res || null;
}

function scriptIndexStart(content, isModule = false) {
  const matches = scriptMatch(content, isModule);
  return matches.index + matches[0].length;
}

function addScriptTag(content, isModule = false) {
  if (!scriptMatch(content, isModule)) {
    const inj = `<script${isModule ? ` context="module"` : ``}>\n</script$>\n`;
    content = inj + content;
  }
  return content;
}

function trimQuotes(v) {
  return v.replace(/^[`'"\s]+|[`'"\s]+$/g, '');
}

module.exports = {
  findTags,
  parseHtml,
  addScriptTag,
  scriptMatch,
  scriptIndexStart,
  trimQuotes
};
