<script>
  import Element from 'svelte-plugin-element';

  const TYPES = ['button', 'checkbox', 'radio', 'text', 'color', 'range'];

  let type = TYPES[0];

  setInterval(() => {
    const index = TYPES.indexOf(type) + 1;
    if (!index || index >= TYPES.length) type = TYPES[0];
    else type = TYPES[index];
  }, 1000);
</script>

<h1>Type: {type}</h1>

<div style="height: 4em">
  <Element tag="input" {type} />
</div>
<hr />
