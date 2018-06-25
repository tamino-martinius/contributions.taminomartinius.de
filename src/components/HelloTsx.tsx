// The default way to create components
import vue from 'vue';

export default vue.extend({
  props: ['name', 'initialEnthusiasm'],
  data() {
    return {
      enthusiasm: this.initialEnthusiasm,
    };
  },
  methods: {
    increment() { this.enthusiasm += 1; },
    decrement() {
      if (this.enthusiasm > 1) {
        this.enthusiasm -= 1;
      }
    },
  },
  computed: {
    exclamationMarks(): string {
      return Array(this.enthusiasm + 1).join('!');
    },
  },
  render() {
    return (
      <div>
        Hello World
        {/* <div>Hello { this.name }{ this.exclamationMarks }</div>
        <button onClick={this.decrement}>-</button>
        <button onClick={this.increment}> +</button > */}
      </div >
    );
  },
});
