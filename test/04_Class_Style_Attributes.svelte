<script>
  import Element from 'svelte-plugin-element';
  import { onMount } from 'svelte';

  let defaultEl, customEl;

  let svelteClass = 'test-class-green';

  let t = 10;

  $: if (t === 8 && defaultEl && customEl) {
    defaultEl.classList.add('test-class-bg-grey');
    customEl.classList.add('test-class-bg-grey');
  }

  $: if (t === 5) svelteClass = 'test-class-blue';

  $: if (t === 1) svelteClass = 'test-class-bg-grey';

  $: if (t === 0) svelteClass = 'test-class-green';

  let defaultClassList, customClassList;
  $: if (defaultEl && t !== -1) {
    setTimeout(() => (defaultClassList = [...defaultEl.classList]));
  }
  $: if (customEl && t !== -1) {
    setTimeout(() => (customClassList = [...customEl.classList]));
  }

  onMount(() => {
    setInterval(() => {
      t = !t ? 10 : --t;
    }, 1000);
  });
</script>

<h1>Class, Style and other Attributes</h1>
<h5>Timer: {t} seconds</h5>

<h2>Class</h2>

<big>Properties:</big>
<br />
<small>
  class: String, Array, Object. <br /> Example: <b>class=&#123;['mdc-button',
    'mdc-button--raised', &#123; 'active': true, 'disabled': false &#125;]&#125;</b>
  <br /> Result: <b>class="mdc-button mdc-button--raised active"</b>
</small>

<h3>
  Example problem: By default, a Svelte loses a class "test-class-bg-grey"
  because it was assigned to a non-Svelte.
</h3>
<h4>svelteClass: {svelteClass}</h4>
<h5>
  The class "test-class-bg-grey" is set via
  "node.classList.add('test-class-bg-grey')".
</h5>
<h5>
  When a Svelte changes a class, all classes that were set by a non-Svelte
  methods are lost. Svelte-Plugin-Element it solves this problem. If the element
  was assigned a class other than through a Svelte, this class will be saved. <br
  /><br /> If the saved class is the same as the class assigned by the Svelte , it
  will no longer be saved.
</h5>

<div style="height: auto">
  <h2 bind:this={defaultEl} class="test-class-bold {svelteClass}">
    <span>This is Standart Default TAG</span>
    <br />
    <pre>classes: {defaultClassList}</pre>
  </h2>
  <Element
    bind:element={customEl}
    tag="h2"
    class={['test-class-bold', svelteClass]}
  >
    <span>This is Svelte-Plugin-Element</span>
    <br />
    <pre>classes: {customClassList}</pre>
  </Element>
</div>

<p>
  Why is this necessary?<br />There are many third-party libraries that can
  assign their own classes to elements.
</p>
<hr />

<h2>Style</h2>

<big>Properties:</big>
<br />
<div>
  style: String, Array, Object. <br /><br /> Example:
  <pre
  >{"style={['font-size: 1em', 'fontWeight:700', { 'border-top': '1px solid #ad3', userDrag: 'none' }]}"}</pre>
  Result:
  <pre
  >{'style="font-size: 1em; font-weight: 700; border-top: 1px solid rgb(170, 221, 51); -webkit-user-drag: none;"'}</pre>
</div>

<h5>
  All prefixes are placed automatically: 'userDrag' will turn into
  '-webkit-user-drag'.
</h5>

<h5>
  Custom styles (assigned via node.style.display: block) are saved in the same
  way as custom classes.
</h5>

<hr />

<h2>Custom Attributes</h2>
<div>
  You can assign any attributes:<br />Example:
  <pre>{'<Element role="button" data-pressed="true">Button</Element>'}</pre>
</div>

<div>
  This code will automatically turn into this (used
  'svelte-plugin-element/preprocess'):
  <pre
  >
    {"<Element attributes={{ role: 'button', 'data-pressed': true }}>Button</Element>"}
  </pre>
  This entry is also absolutely valid. You can use it.
</div>

<style>
  :global(.test-class-element span) {
    text-decoration: underline;
  }

  :global(.test-class-bold) {
    font-weight: 700;
    border: 1px solid #eee;
    padding: 0.5em 0.75em 0;
  }

  :global(.test-class-bold pre) {
    font-size: 0.75em;
  }

  :global(.test-class-green) {
    color: green;
  }

  :global(.test-class-blue) {
    color: blue;
  }

  :global(.test-class-bg-grey) {
    background-color: #eee;
    border: 1px solid grey;
  }
</style>
