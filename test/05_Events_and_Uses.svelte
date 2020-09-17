<script>
  import Element from 'svelte-plugin-element';

  let i1 = 0;
  let i2 = 0;
  let i3 = 0;

  const click1 = () => ++i1;
  const click2 = () => ++i2;
  const dblclick2 = () => ++i3;

  const use1 = (node, props) => {
    console.log('use1', node, props);
  };
  const use2 = (node, props) => {
    console.log('use2', node, props);
  };
</script>

<h1>Events and Uses</h1>

<h2>Events</h2>
<h5>Click1: {i1} <br />Click2: {i2} <br />DoubleClick3: {i3} <br /></h5>
<div>
  Example: <br />
  <pre>{'<Element tag="button" on:click={click1}>Click me!</Element>'}</pre>
</div>
<Element tag="button" on:click={click1}>Click me!</Element>
<hr />

<div>
  Example: <br />
  <pre
  >{'<Element tag="button" on={{ click: click2 }}>Click me!</Element>'}</pre>
</div>
<Element tag="button" on={{ click: click2 }}>Click me!</Element>
<hr />

<div>
  Example: <br />
  <pre
  >{'<Element tag="button" on={{ click: [click1, click2], dblclick: dblclick2 }}>Click and DoubleClick me!</Element>'}</pre>
</div>
<Element tag="button" on={{ click: [click1, click2], dblclick: dblclick2 }}>
  Click and DoubleClick me!
</Element>
<hr />

<h2>Uses</h2>

<div>
  Example: <br />
  <pre>{"<Element use:use1={'props1'}>Use1</Element>"}</pre>
</div>

<div>
  Svelte linter reports an error. But this code works because the
  'svelte-plugin-element/preprocess' turns this code into this:
</div>
<pre>{"<Element use={[use1, 'props1']}>Use1</Element>"}</pre>
<Element use:use1={'defProps1'} />
<Element use={[use1, 'props1']} />

<div>Several use-functions:</div>
<pre
>{"<Element use={[[use1, 'props1'], [use2, 'props2']]}>Use 1 and 2</Element>"}</pre>
<Element use:use1 use:use2 />
<Element
  use={[[use1], [use2]]}
/>

<Element use:use1={'defProps1'} use:use2={'defProps2'} />
<Element
  use={[[use1, 'props1'], [use2, 'props2']]}
/>
