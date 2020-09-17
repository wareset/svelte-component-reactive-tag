<script>
  import Element from 'svelte-plugin-element';

  let node;

  let i = 1;

  setInterval(() => {
    i = i >= 6 ? 1 : ++i;
  }, 1000);

  $: console.log('Tag:', `h${i}`);
  $: console.log('Element:', node);
</script>

<h1>Element and Tag:</h1>
<h3>'Element': This is an alternative 'this' for binding to an element</h3>
<h3>'Tag': This is an element tag</h3>
<h5>(look in the console)</h5>

<div style="height: 4em">
  <Element bind:element={node} tag={`h${i}`}>H{i}</Element>
</div>
<hr />

<style>
  :global(h2) {
    font-size: 2em;
  }

  :global(h2) {
    font-size: 1.5em;
  }

  :global(h3) {
    font-size: 1.17em;
  }

  :global(h4) {
    font-size: 1.33em;
  }

  :global(h5) {
    font-size: 0.83em;
  }

  :global(h6) {
    font-size: 0.67em;
  }
</style>
