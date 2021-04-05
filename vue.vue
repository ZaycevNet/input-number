<template>
  <input
    ref="input"
  />
</template>

<script>
import InputNumber from './vanila';

export default {
  inheritAttrs: true,
  name: 'InputNumber',
  model: {
    event: 'input',
  },
  props: {
    fixed: {
      type: Number,
      default: undefined,
    },
    min: {
      type:  Number,
      default: undefined,
    },
    max: {
      type:  Number,
      default: undefined,
    },
    value: {
      type: String,
      default: '',
    },
  },
  methods: {
    onMount() {
      this.instance = new InputNumber(this.$refs.input);

      this.instance.onChange(this.onChange);
    },
    onUnmount() {
      this.instance?.destroy();
    },
    onChange(v) {
      this.$emit('input', v);
      this.$emit('change', v);
    },
    applyOptions() {
      this.instance?.setFixed(this.fixed);
      this.instance?.setMin(this.min);
      this.instance?.setMax(this.max);
      this.instance?.setValue(this.value);
    },
  },
  watch: {
    fixed() {
      this.applyOptions();
    },
    min() {
      this.applyOptions();
    },
    max() {
      this.applyOptions();
    },
    value() {
      this.applyOptions();
    },
  },
  mounted() {
    this.onMount();
  },
  beforeDestroy() {
    this.onUnmount();
  },
  data() {
    return {
      instance: undefined,
    };
  },
};
</script>
