import Vue, { VNode } from 'vue'

declare global {
  namespace JSX {
    interface Element extends VNode { }
    interface ElementClass extends Vue { }
    interface ElementAttributesProperty {
      $props: {};
    }

    interface IntrinsicElements {
      div: any;
      img: any;
      a: any;
      h1: any;
      h2: any;
      h3: any;
      h4: any;
      hr: any;
      label: any;
      button: any;
      header: any;
      footer: any;
      svg: any;
      path: any;
      circle: any;
      rect: any;
      mask: any;
    }
  }
}
