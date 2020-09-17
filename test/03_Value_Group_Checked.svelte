<script>
  import Element from 'svelte-plugin-element';

  let swap1 = false;
  $: swapped1 = swap1 ? 'radio' : 'checkbox';
  $: swapped2 = !swap1 ? 'radio' : 'checkbox';

  let group = ['i-11', 'i-12'];

  let swap2 = false;
  $: swapped3 = swap2 ? 'input' : 'textarea';
  let group_text = ['example text'];
  let text = 'example text';

  let group_options = ['option-01', 'option-02'];
  let multiple = false;
</script>

<h1>Value, Group and Checked:</h1>

<big>Properties:</big>
<br />
<small>
  value: any - but not 'null' and 'undefined' (they will turn into an empty
  string). Default: 'element-123' (unique id).
</small>
<br />
<small>group: [] - only Array (if not , it will turn into an empty array).</small>
<br />
<small>
  checked: Boolean, null - (if null , 'indeterminate' will be assigned 'true').
</small>
<br />
<small>indeterminate: Boolean - (if true , 'checked' will be assigned 'null')</small>

<h4>Group: {JSON.stringify(group)}</h4>
<h5>
  When changing, the 'radio' buttons remain active. And it's more flexible. The
  component doesn't decide anything for You. This way you have full control over
  all variables. Checkboxes work with the property 'indeterminate'.
</h5>
<div style="height: 4em">
  <label for="test-id-01">
    Swap the checkboxes and radios:
    <Element
      id="test-id-01"
      tag="input"
      type="checkbox"
      bind:group
      value="swap"
      bind:checked={swap1}
    />
  </label>
  <br />
  <Element tag="input" type={swapped1} bind:group value="i-01" checked />
  <Element tag="input" type={swapped2} bind:group value="i-02" checked />
  <Element tag="input" type={swapped1} bind:group value="i-03" />
  <Element tag="input" type={swapped2} bind:group value="i-04" />
  <Element tag="input" type={swapped1} bind:group value="i-05" />
  <Element tag="input" type={swapped2} bind:group value="i-06" indeterminate />
  <br />
  <Element tag="input" type={swapped2} bind:group value="i-07" indeterminate />
  <Element tag="input" type={swapped1} bind:group value="i-08" />
  <Element tag="input" type={swapped2} bind:group value="i-09" />
  <Element tag="input" type={swapped1} bind:group value="i-10" />
  <Element tag="input" type={swapped2} bind:group value="i-11" />
  <Element tag="input" type={swapped1} bind:group value="i-12" />
</div>

<hr />

<h4>
  Tag: {swapped3}
  <br /> Value: {text}
  <br /> group_text: {JSON.stringify(group_text)}
</h4>
<h5>
  Types for inputs: 'text', 'color' and 'number'. They have different meanings
  and contradict their types. But this doesn't break Your set value, inside the
  component.
</h5>
<h5>
  'value', 'group' and 'checked' are the same for all tags and types. They
  remain forcibly reactive and changeable.
</h5>
<div style="height: 4em">
  <label for="test-id-02">
    Swap the input and textarea:
    <Element id="test-id-02" tag="input" type="checkbox" bind:checked={swap2} />
  </label>
  <br />
  <Element
    tag={swapped3}
    type="text"
    bind:value={text}
    bind:group={group_text}
  />
  <Element
    tag={swapped3}
    type="color"
    bind:value={text}
    bind:group={group_text}
  />
  <Element
    tag={swapped3}
    type="number"
    bind:value={text}
    bind:group={group_text}
  />
</div>

<hr />

<h4>
  Select: <br /> multiple: {multiple}
  <br /> group_options: {JSON.stringify(group_options)}
</h4>
<h5>
  Flexibility of choice. Changing this 'multiple' method will not force you to
  change what you can control yourself.
</h5>
<div style="height: 4em">
  <label for="test-id-03">
    Swap the multiple:
    <Element
      id="test-id-03"
      tag="input"
      type="checkbox"
      bind:checked={multiple}
    />
  </label>
  <br />
  <Element tag="select" {multiple} bind:group={group_options}>
    <option value="option-01">Option 1</option>
    <Element tag="option" value="option-02">Option 2</Element>
    <option>Option 3</option>
    <Element tag="option">Option 4</Element>
    <option value={['array-5']}>Option 5</option>
    <Element tag="option" value={{ object: 6 }}>Option 6</Element>
  </Element>
</div>

<hr />
