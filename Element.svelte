<script context="module">
  import deepEqual from '@wareset/deep-equal';
  import _unique from '@wareset/unique';
  import store from '@wareset/store';

  const not_equal = (a, b) => !deepEqual(a, b, 0);
  const unique = _unique.bind([null, undefined]);
  // const unique = _unique.bind([null, undefined]);

  import {
    classes_normalize,
    styles_normalize,
    attributes_normalize,
    events_factory,
    actions,
    is_void,
    set_if_isset,
    data_option,
    svelte_set,
    rand_ID
  } from 'svelte-plugin-element/util';

  let ID = 0;
</script>

<script>
  import { onMount, tick } from 'svelte';
  import { get_current_component } from 'svelte/internal';
  import { select_options, select_multiple_value } from 'svelte/internal';

  if (ID >= Number.MAX_SAFE_INTEGER - 1) ID = 0;
  const __ID__ = `element-${++ID}`;
  const component = get_current_component();
  const events = events_factory(component);
  const CACHE = {};

  export let tag = 'div';
  $: tag = tag.toLowerCase();
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

  export let element = undefined;

  export let id = undefined;

  export let type = 'text';
  $: type = type.toLowerCase();

  export let value = id || __ID__;
  export let group = [];
  export let checked = null;
  export let indeterminate = null;

  $: if (element) element.__value = value;

  const element$ = store(element);

  const value$ = store(value);
  const group$ = store(group);
  const checked$ = store(checked);
  const indeterminate$ = store(indeterminate);

  let _value, _group, _checked, _indeterminate, _element;

  // FORMFIELDS
  function onInput(e) {
    switch (tag) {
      case 'select':
        (group.length = 0), group.push(...select_multiple_value(element));
        group$.set((_group = unique(group)));
        break;
      case 'input':
        if (type === 'checkbox' || type === 'radio') {
          console.log(group$.$);
          checked = !!element.checked;
        }
      default:
        if ('value' in element) value = element.value || '';
    }

    // console.log([value, checked, indeterminate], [...group]);
  }

  const change_element = v => not_equal($element$, v) && element$.set(v);
  $: change_element(element);

  const change_value = v => not_equal($value$, v) && value$.set(v);
  $: change_value(value);
  const change_group = v => not_equal($group$, v) && group$.set(v);
  $: change_group(group);
  const change_checked = v => not_equal($checked$, v) && checked$.set(v);
  $: change_checked(checked);
  const change_indeterminate = v =>
    not_equal($indeterminate$, v) && indeterminate$.set(v);
  $: change_indeterminate(indeterminate);

  onMount(() => {
    const needUpdate$ = store(false, [
      value$,
      group$,
      checked$,
      indeterminate$,
      element$
    ]);

    let is_init = false;
    let update_symbol = {};

    function update() {
      if (not_equal(value, value$.$)) return (value = value$.$);
      if (not_equal(group, group$.$)) return (group = group$.$);
      if (not_equal(checked, checked$.$)) return (checked = checked$.$);
      if (not_equal(indeterminate, indeterminate$.$)) {
        return (indeterminate = indeterminate$.$);
      }

      (_value = value), (_group = group);
      (_checked = checked), (_indeterminate = indeterminate);
      return update_symbol;
    }

    function need_update(v, [value, group, checked, indeterminate, element]) {
      // console.log(value, group, checked, indeterminate, is_init);
      if (not_equal(_element, element)) (_element = element), (is_init = false);
      if (!element) return;

      if (typeof indeterminate !== 'boolean') {
        indeterminate$.set((_indeterminate = !!indeterminate));
        return;
      }

      if (typeof checked !== 'boolean' && checked !== null) {
        checked$.set((_checked = !!checked));
        return;
      }

      if (!Array.isArray(group)) {
        group$.set((_group = unique([group])));
        return;
      }

      if (is_void(value)) {
        value$.set((_value = ''));
        return;
      }

      const index = group.indexOf(value);

      if (!is_init) {
        if (typeof checked === 'boolean' && !checked !== !~index) {
          checked ? group.push(value) : group.splice(index, 1);
          group$.set((_group = unique(group)));
          return;
        }

        if (indeterminate && (!is_void(checked) || ~index)) {
          if (!is_void(checked)) checked$.set((_checked = null));
          else group.splice(index, 1), group$.set((_group = unique(group)));
          return;
        }

        if (checked && (indeterminate || !~index)) {
          if (indeterminate) indeterminate$.set((_indeterminate = false));
          else group.push(value), group$.set((_group = unique(group)));
          return;
        }

        if (~index && (indeterminate || !checked)) {
          if (indeterminate) indeterminate$.set((_indeterminate = false));
          else checked$.set((_checked = true));
          return;
        }

        (_value = value), (_group = group);
        (_checked = checked), (_indeterminate = indeterminate);
      } else {
        if (not_equal(_value, value)) {
          const old_index = group.indexOf(_value);
          _value = value;
          if (~old_index && checked) {
            group.splice(old_index, 1, value);
            group$.set((_group = unique(group)));
            return;
          }
        }
        if (not_equal(_group, group)) {
          _group = group;
          if (element && element.options) select_options(element, group);
          if (!checked !== !~index) {
            checked$.set((_checked = !!~index));
            return;
          }
        }
        if (not_equal(_checked, checked)) {
          _checked = checked;
          // console.log(1111, group);
          if (!checked !== !~index) {
            let i = index;
            if (type === 'radio') (group.length = 0), (i = 0);
            checked ? group.push(value) : group.splice(i, 1);
            group$.set((_group = unique(group)));
            // console.log(_group);
            return;
          }
        }
        if (not_equal(_indeterminate, indeterminate)) {
          _indeterminate = indeterminate;
          if (indeterminate)
            !is_void(checked) && checked$.set((_checked = null));
          if (!indeterminate)
            is_void(checked) && checked$.set((_checked = false));
          return;
        }
      }

      if (update() === update_symbol) is_init = true;
      else needUpdate$.setSure(true);
    }

    const unsubscribes = [
      needUpdate$.subscribe(need_update),
      group$.subscribe(async group => {
        // await tick();
        // component.$set({ group });
        // console.log(value, group);
      })
    ];

    return () => unsubscribes.forEach(v => v());
  });

  $: if (element) set_if_isset(element, 'type', type);
  $: if ((element && tag === 'input') || tag === 'option' || tag === 'textarea')
    set_if_isset(element, 'value', value);
  $: if (element && (type === 'radio' || type === 'checkbox'))
    set_if_isset(element, 'checked', checked);
  $: if (element && type === 'checkbox')
    set_if_isset(element, 'indeterminate', indeterminate);
</script>

<svelte:options immutable={true} />

{#if __TAG__ && __TAG__ === tag}
  <sveltepluginelement
    {id}
    class={classes_normalize.bind([
      element,
      CACHE
    ])(__CLASS__, __ATTRIBUTES__.class) || null}
    style={styles_normalize.bind([
      element,
      CACHE
    ])(__STYLE__, __ATTRIBUTES__.style) || null}
    bind:this={element}
    use:events={__ON__}
    use:actions={[__USE__, __ATTRIBUTES__.use]}
    {...attributes_normalize.bind([element, CACHE, component])(__ATTRIBUTES__)}
    on:input={onInput}
  >
    <slot />
  </sveltepluginelement>
{:else if (__TAG__ = tag)}{''}{/if}
