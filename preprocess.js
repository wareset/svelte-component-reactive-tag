const {
  addScriptTag,
  parseHtml,
  trimQuotes
} = require('./scripts/lib/parse_utilites');
const { build_tag, check_tag } = require('./scripts/lib');
const opts_normalize = require('./scripts/lib/opts_normalize');
const get_filename = require('./scripts/lib/get_filename');

const { name } = require('./package.json');

const svelte = require('svelte/compiler');
const MagicString = require('magic-string');

const fix_raw = (v, is = false) => {
  const l = v.length - 1;

  if (
    (is && v[0] === '{' && v[l] === '}') ||
    (!is && v[0] === '[' && v[l] === ']')
  ) {
    v = v.slice(1, -1);
  } else if (is) v = '...' + v;
  return v;
};

function normalize_attrs(v, code, is_attrs = false) {
  let res = [];
  if (!v.value) return res;
  if (!Array.isArray(v.value)) return [v.value];
  v.value.forEach(v => {
    let raw;
    if (v.type === 'MustacheTag') {
      raw = code.slice(v.expression.start, v.expression.end);
    } /*if (v.type === 'Text')*/ else {
      raw = v.data || v.raw;
      raw =
        JSON.stringify(typeof raw === 'string' ? raw.trim() : raw) ||
        v.expression.name;
    }
    if (!trimQuotes(raw)) return;
    // console.log(is_attrs, raw);
    raw = fix_raw(raw, is_attrs);
    res.push(raw);
  });
  res = res.map(v => v.trim()).filter(v => v !== '');
  return res;
}

function wrap(v, is_attrs = false) {
  let res;
  // v = v.map(v => v.trim());
  if (is_attrs) res = JSON.stringify('{{' + v.join(',') + '}}');
  else res = JSON.stringify('{[' + v.join(',') + ']}');
  return res.replace(/\\"/g, '"');
}

function walker(content, filename, cmp_name) {
  const code = content;
  const magic = new MagicString(code);
  let need_inject = false;
  svelte.walk(parseHtml(content), {
    enter(node /*, parent, prop, index*/) {
      if (node.name === cmp_name) {
        if (!need_inject) need_inject = true;
        // console.log(node);
        const start = node.start;
        let end = start + cmp_name.length + 1;
        const classes = [];
        const styles = [];
        const attributes = [];
        const events = [];
        const actions = [];
        const others = [];
        node.attributes.forEach(v => {
          if (v.end > end) end = v.end;

          // console.log(v);

          if (v.type === 'Class') {
            const _class_ = [JSON.stringify(v.name)];
            _class_.push(code.slice(v.expression.start, v.expression.end));
            classes.push('{' + _class_.join(':') + '}');

            return;
          }

          if (v.type === 'Action') {
            const _use_ = [v.name];
            if (v.expression) {
              _use_.push(code.slice(v.expression.start, v.expression.end));
            }
            actions.push(
              '[' +
                _use_
                  .map(v => v.trim())
                  .filter(v => v)
                  .join(',') +
                ']'
            );

            return;
          }

          if (v.type === 'Attribute') {
            if (
              v.name === 'tag' ||
              v.name === 'id' ||
              v.name === 'type' ||
              v.name === 'value' ||
              v.name === 'group' ||
              v.name === 'checked' ||
              v.name === 'indeterminate'
            ) {
              others.push(code.slice(v.start, v.end));
              return;
            }

            if (v.name === 'class') {
              classes.push(...normalize_attrs(v, code));
              return;
            }

            if (v.name === 'style') {
              styles.push(...normalize_attrs(v, code));
              return;
            }

            if (v.name === 'use') {
              actions.push(...normalize_attrs(v, code));
              return;
            }

            if (v.name === 'attributes') {
              attributes.push(...normalize_attrs(v, code, true));
              return;
            }

            if (v.name === 'on') {
              events.push(...normalize_attrs(v, code, true));
              return;
            }

            attributes.push(
              JSON.stringify(v.name) +
                ':' +
                (normalize_attrs(v, code).join() || v.name)
            );

            return;
          }

          others.push(code.slice(v.start, v.end));
        });

        // console.log([code.slice(start, end)]);
        // console.log({ tag, classes, styles, actions, attributes });

        const newTag = `<${cmp_name} ${others.join(' ')} class=${wrap(
          classes
        )} style=${wrap(styles)} use=${wrap(actions)} attributes=${wrap(
          attributes,
          true
        )} on=${wrap(events, true)}`;
        // console.log(newTag);
        magic.overwrite(start, end, newTag);
      }
    }
  });

  // console.log(magic.toString());

  return { magic, need_inject };
}

const create_inject = (opts, cmp_name) => {
  return `import ${cmp_name} from "${name}/cache/${get_filename(opts)}";`;
};

const reg_cmp = new RegExp(
  `import[\\s\\n]+([\\w]*?)[\\s\\n]+from[\\s\\n]+[\`'"]${name}[^]*?[\`'"]\\;*`,
  'im'
);

function get_cmp_name(content, opts, _cmp_name) {
  const match = content.match(reg_cmp) || [];
  const cmp_name = match[1] || _cmp_name;
  const is = content.indexOf('<' + cmp_name) >= 0;
  const inject = create_inject(opts, cmp_name);
  if (match[0]) content = content.replace(match[0], is ? inject : '');

  match.input = null;
  // console.log(match);
  return is ? { content, cmp_name, inject } : {};
}

module.exports = function PREPROCESS(
  opts = {},
  _cmp_name = 'SveltePluginElement'
) {
  opts = opts_normalize(opts);
  // check_tag(opts);
  build_tag(opts);

  // let is_started = false;
  return {
    markup: ({ content, filename }) => {
      let cmp_name, inject;
      ({ content, cmp_name, inject } = get_cmp_name(content, opts, _cmp_name));
      if (!cmp_name) return null;

      const { magic, need_inject } = walker(content, filename, cmp_name);

      if (!need_inject) return null;

      // if (!is_started) (is_started = true), build_tag(opts);
      // else check_tag(opts);

      let code = magic.toString();
      if (code.indexOf(inject) < 0) {
        code = addScriptTag(code);
        code = code.replace('</script>', inject + '\n</script>');
      }

      return { code };
    }
  };
};
