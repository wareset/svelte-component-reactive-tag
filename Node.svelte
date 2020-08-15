<script context="module">
  import {
    classes_normalize,
    styles_normalize,
    attributes_normalize,
    events_factory,
    actions,
    is_void,
    set_if_isset,
    data_option
  } from 'svelte-plugin-node/util';

  let ID = 0;
</script>

<script>
  import { get_current_component } from 'svelte/internal';

  ID++;
  const component = get_current_component();
  const events = events_factory(component);
  const CACHE = {};

  export let tag = 'div';
  let __TAG__ = tag;
  let __CLASS__ = '';
  export { __CLASS__ as class };
  let __STYLE__ = '';
  export { __STYLE__ as style };
  let __USE__ = [];
  export { __USE__ as use };
  let __ON__ = [];
  export { __ON__ as on };
  let __ATTRIBUTES__ = {};
  export { __ATTRIBUTES__ as attributes };

  export let id;
  export let node;

  // for formfields
  export let type = undefined;
  export let value = '';

  export let group = [];
  export let checked = null;
  export let indeterminate = is_void(checked);

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

  const change_indeterminate = v => {
    if (is_void(v)) is_void(checked) && (checked = false);
    else if (v) !is_void(checked) && (checked = null);
    else is_void(checked) && (checked = false);
  };
  $: change_indeterminate(indeterminate);
  $: indeterminate = is_void(checked);

  function _changeGroup(group) {
    // console.log('_changeGroup', group);
    if (node && 'options' in node) {
      [...node.options].forEach((v, k) => {
        v.selected = group.some(v2 => v2 === data_option(v) || v2 === +k);
      });
    } else {
      if (!Array.isArray(group)) group = [group];
      const val = value || id;
      const is = group.some(v => v === val);
      if (is && !checked) checked = true;
      if (!is && checked) checked = false;
    }
  }
  $: _changeGroup(group);

  function _onGroup(value, checked, type) {
    // console.log('_onGroup', group);
    if (!(node && 'options' in node)) {
      const val = value || id;
      let ng = group;
      if (!Array.isArray(ng)) ng = [ng];

      if (_old_val !== val && ng.some(v => v === _old_val)) {
        ng = ng.filter(v => v !== _old_val);
      }

      if (!checked) {
        ng.some(v => v === val) && (ng = ng.filter(v => v !== val));
      } else {
        if (type === 'radio') {
          (ng.length !== 1 || ng[0] !== val) && (ng = [val]);
        } else if (type === 'checkbox') {
          !ng.some(v => v === val) && (ng = [...ng, val]);
        }
      }

      (_old_val = val), (group = ng);
    }
  }
  $: _onGroup(value, checked, type);

  $: set_if_isset(node, 'type', type);
  $: set_if_isset(node, 'value', value);
  $: set_if_isset(node, 'checked', checked);
  $: set_if_isset(node, 'indeterminate', indeterminate);

  // $: console.log('checked', checked);
  // $: console.log('indeterminate', indeterminate);
  // $: console.log('group', group);
</script>

<svelte:options immutable={true} />

{#if __TAG__ && __TAG__ === tag}
  <reactivenode
    {id}
    class={classes_normalize.bind([
      node,
      CACHE
    ])(__CLASS__, __ATTRIBUTES__.class)}
    style={styles_normalize.bind([
      node,
      CACHE
    ])(__STYLE__, __ATTRIBUTES__.style)}
    bind:this={node}
    use:events={__ON__}
    use:actions={[__USE__, __ATTRIBUTES__.use]}
    {...attributes_normalize.bind([node, CACHE])(__ATTRIBUTES__)}
    on:change={onChange}
    on:input={onInput}
  >
    <slot />
  </reactivenode>
{:else if (__TAG__ = tag)}{''}{/if}
