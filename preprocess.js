const { build_tag, check_tag, version } = require('./scripts/lib.js');

const { name } = require('./package.json');

const svelte = require('svelte/compiler');
const MagicString = require('magic-string');

let is_started = false;

function normalize_attrs(v, code) {
  const res = [];
  if (!v.value) return res;
  if (!Array.isArray(v.value)) return [v.value];
  v.value.forEach((v) => {
    if (v.type === 'Text') res.push(JSON.stringify(v.data));
    else if (v.type === 'MustacheTag') {
      res.push(code.slice(v.expression.start, v.expression.end));
    }
  });
  return res;
}

function wrap(v, is_attrs = false) {
  let res;
  if (is_attrs) res = JSON.stringify('{{' + v.join(',') + '}}');
  else res = JSON.stringify('{[' + v.join(',') + ']}');
  return res.replace(/\\"/g, '"');
}

function walker(code, filename, cmp_name) {
  console.log(code);
  console.log(svelte.parse(code));
  const html = svelte.parse(code, { filename }).html;


  let need_inject = false;
  const magic = new MagicString(code);

  svelte.walk(html, {
    enter(node /*, parent, prop, index*/) {
      if (node.name === cmp_name) {
        if (!need_inject) need_inject = true;
        // console.log(node);
        const start = node.start;
        let end = 0;
        let tag;
        const classes = [];
        const styles = [];
        const attrs = [];
        const actions = [];
        const others = [];
        node.attributes.forEach((v) => {
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
            tag = code.slice(v.start, v.end);
          } else if (v.type === 'Attribute' && v.name === 'class') {
            classes.push(...normalize_attrs(v, code));
          } else if (v.type === 'Attribute' && v.name === 'style') {
            styles.push(...normalize_attrs(v, code));
          } else if (v.type === 'Attribute' && v.name === 'use') {
            actions.push(...normalize_attrs(v, code));
          } else if (v.type === 'Class') {
            const _class_ = [v.name];
            _class_.push(code.slice(v.expression.start, v.expression.end));
            classes.push('{' + _class_.join(':') + '}');
          } else if (v.type === 'Action') {
            const _use_ = [v.name];
            if (!v.expression) _use_.push(undefined);
            else _use_.push(code.slice(v.expression.start, v.expression.end));
            actions.push('[' + _use_.join(',') + ']');
          } else if (v.type === 'Attribute') {
            attrs.push(
              v.name + ':' + (normalize_attrs(v, code).join() || v.name)
            );
          } else others.push(code.slice(v.start, v.end));
        });
        // console.log([code.slice(start, end)]);
        // console.log({ tag, classes, styles, actions, attrs });

        const newTag = `<${cmp_name} ${tag} class=${wrap(classes)} style=${wrap(
          styles
        )} use=${wrap(actions)} attrs=${wrap(attrs, true)} ${others.join(' ')}`;
        console.log(newTag);
        magic.overwrite(start, end, newTag);
      }
    },
  });

  return { magic, need_inject };
}

module.exports = function sveltePluginNode(opts = {}, cmp_name = 'Node') {
  if (opts.generate !== 'ssr') opts.generate = 'dom';
  const inject = `import ${cmp_name} from "${name}/cache/${opts.generate}${version}.js";`;

  return {
    markup: ({ content, filename }) => {
      if (content.indexOf('<' + cmp_name) < 0) return null;
      console.log([8888, filename]);
      console.log(inject);

      const { magic, need_inject } = walker(content, filename, cmp_name);

      if (!need_inject) return null;

      if (!is_started) (is_started = true), check_tag(opts), build_tag(opts);


      // console.log(code);

      let code = magic.toString();
      if (code.indexOf(inject) < 0) {
        if (code.indexOf('</script>') < 0) code += '\n<script>\n</script>\n';
        code = code.replace('</script>', inject + '\n</script>');
      }



      return { code };
    },
  };
};
