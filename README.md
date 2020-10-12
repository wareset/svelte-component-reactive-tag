# svelte-plugin-element

Component for creating functional html-elements

### !!!In progress!!!

> **Attention:**
> It is difficult to install and may stop working with the next update Svelte. Use at your own risk.

## Problem:

Svelte is an amazing solution for creating various applications. But there are often problems that cannot be solved in standard ways. In particular, working with HTML-elements. This package allows you to solve some of these problems.

## Fixes:

- Reactive change of an element 'tag' property
- Reactive change of an element 'type' (for inputs and etc.)
- 'Indeterminate' property for checkboxes
- Saving custom classes and styles assigned by external modules
- Fixing some bugs when working with inputs (bind:group)
- Ability to assign multiple functions more than one event
- etc.

## Simple example:

```svelte
<script>
// Button.svelte
import Element from 'svelte-plugin-element';

import { get_current_component } from 'svelte/internal';
const component = get_current_component();

export let tag = 'button';
export let href = null;

export let raised;
</script>

<Element
  tag={href ? 'a' : tag}
  {href}
  class={['simple-button', { 'simple-button--raised': raised }]} // Sting, Array or Object
  style={{ userSelect: 'none', 'touch-select': 'none' }} // Sting, Array or Object (prefixes will be installed automatically)
  on="{{component}} // Forward all events (no need to write this: 'on:click', 'on:dblclick' ...)
>
  <slot />
</Elenemt>
```

See all examples here: [https://github.com/wareset/svelte-plugin-element/tree/master/test](https://github.com/wareset/svelte-plugin-element/tree/master/test)

## Install

```console
npm install svelte-plugin-element
```

```js
//Example for sapper
// rollup.config.js
import sveltePluginElement from 'svelte-plugin-element/preprocess.js';


export default {
  client: {
    plugins: [
      svelte({
        dev,
        hydratable: true,
        emitCss: true,
        preprocess: [
          preprocess(), // If you use it, put it first
          sveltePluginElement({ dev, hydratable: true })
        ]
      }),
    ],
  },

  server: {
    plugins: [
      svelte({
        generate: 'ssr',
        dev,
        hydratable: true,
        preprocess: [
          preprocess(), // If you use it, put it first
          sveltePluginElement({ generate: 'ssr', dev, hydratable: true })
        ]
      }),
    ],
  },
};
```

## Meta

[LICENSE (MIT)](/LICENSE)
