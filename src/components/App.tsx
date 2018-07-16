// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class App extends Vue {
  @Prop() name: string = 'test';
  @Prop() initialEnthusiasm: number = 10;

  enthusiasm = this.initialEnthusiasm;

  increment() {
    this.enthusiasm += 1;
  }
  decrement() {
    if (this.enthusiasm > 1) {
      this.enthusiasm -= 1;
    }
  }

  get exclamationMarks(): string {
    return Array(this.enthusiasm + 1).join('!');
  }

  render() {
    return (
      <div>
        <div>Hello {this.name}{this.exclamationMarks}</div>
        <button onClick={this.decrement}>-</button>
        <button onClick={this.increment}>+</button>
      </div>
    );
  }
}
