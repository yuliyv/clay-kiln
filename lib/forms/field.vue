<style lang="sass">
  @import '../../styleguide/animations';

  .kiln-field {
    border: none;
    flex: 0 0 100%;
    margin: 0 0 16px;
    min-width: 0;
    opacity: 1;
    padding: 0;
    position: relative;
    transition: opacity $standard-time $standard-curve;
    visibility: visible;
    width: 100%;

    .editor-inline & {
      margin: 0;
    }

    .reveal-enter,
    .reveal-leave-to {
      opacity: 0;
    }

    .reveal-enter-to,
    .reveal-leave {
      opacity: 1;
    }

    .reveal-enter-active,
    .reveal-leave-active {
      transition: opacity $standard-time $standard-curve;
    }
  }
</style>

<template>
  <transition name="reveal" mode="out-in" @after-enter="onRevealResize">
    <fieldset class="kiln-field" :style="{ minHeight: minHeight }" v-if="inputName && isShown" :key="name">
      <component :is="inputName" :name="name" :data="data" :schema="schema" :args="expandedInput" :initialFocus="initialFocus" @resize="onResize"></component>
    </fieldset>
  </transition>
</template>

<script>
  import _ from 'lodash';
  import { fieldProp, inputProp, revealProp } from '../utils/references';
  import { shouldBeRevealed } from './field-helpers';
  import { expand } from './inputs';

  export default {
    props: ['name', 'data', 'schema', 'initialFocus'],
    data() {
      return {
        minHeight: '0px'
      };
    },
    computed: {
      expandedInput() {
        return expand(this.schema[fieldProp]);
      },
      inputName() {
        return this.expandedInput[inputProp];
      },
      hasReveal() {
        return _.has(this.schema, revealProp);
      },
      isShown() {
        const revealConfig = _.get(this.schema, revealProp, {});

        return shouldBeRevealed(this.$store, revealConfig, this.name);
      }
    },
    methods: {
      onResize(additionalPixels) {
        if (_.isNumber(additionalPixels) && additionalPixels > 0) {
          this.minHeight = `${additionalPixels + 52}px`;
        } else if (_.isNumber(additionalPixels)) {
          this.minHeight = '0px';
        }

        // note: emit `resize` if you need the field itself to resize (e.g. for select dropdowns, which are absolutely positioned),
        // use `resize-form` if you just need to make the form auto-resize
        this.$root.$emit('resize-form'); // pass this to the form component
      },
      onRevealResize() {
        if (this.hasReveal) {
          this.$root.$emit('resize-form');
        }
      }
    },
    components: window.kiln.inputs
  };
</script>
