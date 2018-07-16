import Vue, { VNode } from 'vue'

declare global {
  namespace JSX {
    interface Element extends VNode { }
    interface ElementClass extends Vue { }
    interface ElementAttributesProperty {
      $props: {}
    }

    interface IntrinsicElements {
      div: any
      img: any
      a: any
      h1: any
      button: any
    }
  }
}
