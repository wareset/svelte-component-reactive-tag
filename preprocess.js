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
  const res = [];
  if (!v.value) return res;
  if (!Array.isArray(v.value)) return [v.value];
  v.value.forEach(v => {
    let raw;
    if (v.type === 'MustacheTag') {
      raw = code.slice(v.expression.start, v.expression.end);
    } /*if (v.type === 'Text')*/ else {
      raw = JSON.stringify(v.data || v.raw) || v.expression.name;
    }
    // console.log(is_attrs, raw);
    raw = fix_raw(raw, is_attrs);
    res.push(raw);
  });
  return res;
}

function wrap(v, is_attrs = false) {
  let res;
  if (is_attrs) res = JSON.stringify('{{' + v.join(',') + '}}');
  else res = JSON.stringify('{[' + v.join(',') + ']}');
  return res.replace(/\\"/g, '"');
}

const reg_ex = new RegExp(`<(script|style)[^]*?>[^]*?<\/(script|style)>`, 'gi');
function walker(content, filename, cmp_name) {
  let code = content;
  const excludes = [];
  (content.match(reg_ex) || []).forEach(text => {
    const start = code.indexOf(text);
    excludes.push({ text, start });
    code = code.replace(text, '');
  });

  const magic = new MagicString(code);
  excludes.forEach(v => magic.prependRight(v.start, v.text));

  const html = svelte.parse(code, { filename }).html;

  let need_inject = false;
  svelte.walk(html, {
    enter(node /*, parent, prop, index*/) {
      if (node.name === cmp_name) {
        if (!need_inject) need_inject = true;
        // console.log(node);
        const start = node.start;
        let end = start + cmp_name.length + 1;
        let tag = [];
        const classes = [];
        const styles = [];
        const attributes = [];
        const events = [];
        const actions = [];
        const others = [];
        node.attributes.forEach(v => {
          if (v.end > end) end = v.end;

          // console.log(v);

          if (
            v.type === 'Attribute' &&
            (v.name === 'type' ||
              v.name === 'value' ||
              v.name === 'group' ||
              v.name === 'checked' ||
              v.name === 'indeterminate')
          ) {
            others.push(code.slice(v.start, v.end));
          }

          if (v.type === 'Attribute' && v.name === 'tag') {
            tag = [code.slice(v.start, v.end)];
          } else if (v.type === 'Attribute' && v.name === 'class') {
            classes.push(...normalize_attrs(v, code));
          } else if (v.type === 'Attribute' && v.name === 'style') {
            styles.push(...normalize_attrs(v, code));
          } else if (v.type === 'Attribute' && v.name === 'use') {
            actions.push(...normalize_attrs(v, code));
          } else if (v.type === 'Attribute' && v.name === 'attributes') {
            attributes.push(...normalize_attrs(v, code, true));
          } else if (v.type === 'Attribute' && v.name === 'on') {
            events.push(...normalize_attrs(v, code, true));
          } else if (v.type === 'Class') {
            const _class_ = [JSON.stringify(v.name)];
            _class_.push(code.slice(v.expression.start, v.expression.end));
            classes.push('{' + _class_.join(':') + '}');
          } else if (v.type === 'Action') {
            const _use_ = [v.name];
            if (v.expression) {
              _use_.push(code.slice(v.expression.start, v.expression.end));
            }
            actions.push('[' + _use_.join(',') + ']');
          } else if (v.type === 'Attribute') {
            attributes.push(
              JSON.stringify(v.name) +
                ':' +
                (normalize_attrs(v, code).join() || v.name)
            );
          } else others.push(code.slice(v.start, v.end));
        });
        // console.log([code.slice(start, end)]);
        // console.log({ tag, classes, styles, actions, attributes });

        const newTag = `<${cmp_name} ${tag.join('')} class=${wrap(
          classes
        )} style=${wrap(styles)} use=${wrap(actions)} attributes=${wrap(
          attributes,
          true
        )} on=${wrap(events, true)} ${others.join(' ')}`;
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

module.exports = function sveltePluginNode(opts = {}, _cmp_name = 'Node') {
  opts = opts_normalize(opts);

  let is_started = false;
  return {
    markup: ({ content, filename }) => {
      let cmp_name, inject;
      ({ content, cmp_name, inject } = get_cmp_name(content, opts, _cmp_name));
      if (!cmp_name) return null;

      const { magic, need_inject } = walker(content, filename, cmp_name);

      if (!need_inject) return null;

      if (!is_started) (is_started = true), build_tag(opts);
      else check_tag(opts);

      let code = magic.toString();
      if (code.indexOf(inject) < 0) {
        if (code.indexOf('</script>') < 0) code += '\n<script>\n</script>\n';
        code = code.replace('</script>', inject + '\n</script>');
      }

      return { code };
    }
  };
};
