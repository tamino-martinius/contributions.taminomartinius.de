// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class extends Vue {
  @Prop() title!: string;
  @Prop() value!: string;
  @Prop() color!: string;

  render() {
    return (
      <div class="legend">
        <div class="legend__color" style={{ '--color': `var(--${this.color})` }} />
        <div class="legend__title">
          {this.title}
        </div>
        <div class="legend__value">
          {this.value}
        </div>
      </div>
    );
  }
}
