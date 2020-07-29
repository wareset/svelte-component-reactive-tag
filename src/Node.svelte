<script context="module">
import {
  classes_normalize,
  styles_normalize,
  attributes_normalize,
  events_action_factory,
  uses_normalize,
  set_if_isset,
} from 'svelte-plugin-node/src/util.js';

let ID = 0;

function is_browser() {
  return typeof window !== 'undefined';
}

function is_void(v) {
  return v === null || v === undefined;
}

function data_option(v) {
  return v.value; // || v.label || v.text || v.textContent;
}
</script>

<script>
import { onMount, onDestroy, tick } from 'svelte';
import { get_current_component } from 'svelte/internal';

ID++;
const component = get_current_component();
const events_action = events_action_factory(component);

export let id = 'rtag_' + ID;

export let node;
export let tag = 'div';
let __CLASS__ = '';
export { __CLASS__ as class };
let __STYLE__ = '';
export { __STYLE__ as style };
export let use = [];
export let attrs = {};
// for formfields
export let type = undefined;
export let value = '';

export let group = [];
export let checked = null;
export let indeterminate = is_void(null);

let _old_val = value || id;
if (is_void(checked)) _changeGroup(group);
else _onGroup(value, checked, type);

// FORMFIELDS
function onChange(e) {
  // console.log('onChange', e);
  if ('checked' in node) checked = node.checked;
  if ('options' in node) {
    const si = +node.selectedIndex;
    if (!node.multiple) group = [data_option(node.options[si]) || si];
    else {
      const ng = [];
      [...node.options].forEach(
        (v, k) => v.selected && ng.push(data_option(v) || +k)
      );
      group = ng;
    }
  }
}
function onInput(e) {
  // console.log('onInput', e);
  if ('value' in node) value = node.value;
}

const change_indeterminate = (v) => {
  if (is_void(v)) is_void(checked) && (checked = false);
  else if (v) !is_void(checked) && (checked = null);
  else is_void(checked) && (checked = false);
};
$: change_indeterminate(indeterminate);
$: indeterminate = is_void(checked);

function _changeGroup(group) {
  if (node && 'options' in node) {
    [...node.options].forEach((v, k) => {
      v.selected = group.some((v2) => v2 === data_option(v) || v2 === +k);
    });
  } else {
    let ng = group;
    if (!Array.isArray(ng)) ng = [ng];
    else {
      const val = value || id;
      const is = ng.some((v) => v === val);
      if (is && !checked) checked = true;
      if (!is && checked) checked = false;
    }
  }
}
$: _changeGroup(group);


function _onGroup(value, checked, type) {
  if (!(node && ('options' in node))) {
    const val = value || id;
    let ng = group;
    if (!Array.isArray(ng)) ng = [ng];

    if (_old_val !== val && ng.some((v) => v === _old_val)) {
      ng = ng.filter((v) => v !== _old_val);
    }

    if (!checked) {
      ng.some((v) => v === val) && (ng = ng.filter((v) => v !== val));
    } else {
      if (type === 'radio') {
        (ng.length !== 1 || ng[0] !== val) && (ng = [val]);
      } else if (type === 'checkbox') {
        !ng.some((v) => v === val) && (ng = [...ng, val]);
      }
    }

    (_old_val = val), (group = ng);
  }
}
$: _onGroup(value, checked, type);



// const change_checked = (v) => (indeterminate = is_void(v));
// $: change_checked(checked);

$: set_if_isset(node, 'value', value);
$: set_if_isset(node, 'checked', checked);
$: set_if_isset(node, 'indeterminate', indeterminate);

// $: console.log('checked', checked);
// $: console.log('indeterminate', indeterminate);
// $: console.log('group', group);

// UPDATE TAG
let _tag = tag;
let need_update = false;
$: if (tag !== _tag && is_browser()) (_tag = tag), (need_update = true);
$: if (need_update) (async () => (await tick()) || (need_update = false))();

// USES
let current_use = [];
$: current_use = uses_normalize(node, need_update, use, current_use);
onDestroy(() => {
  current_use.forEach((v) => v.use && v.use.destroy && v.use.destroy());
  current_use = [];
});
</script>

<svelte:options tag="reactive-tag" />

{#if tag && !need_update}
<reactivenode
  class="{classes_normalize(__CLASS__)}"
  style="{styles_normalize(__STYLE__)}"
  bind:this="{node}"
  use:events_action
  {...attributes_normalize(attrs)}
  on:change="{onChange}"
  on:input="{onInput}"
>
    <slot />
  </reactivenode>
{/if}
