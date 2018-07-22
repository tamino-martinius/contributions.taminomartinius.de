// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import { DataPoint } from '@/types';
export { DataPoint } from '@/types';

@Component
export default class extends Vue {
  @Prop() data!: DataPoint;

  render() {
    return (
      <div class="legend">
        <div class="legend__color" style={{ '--color': `var(--${this.data.color})` }} />
        <div class="legend__title">
          {this.data.title}
        </div>
        <div class="legend__value">
          {this.data.value.toLocaleString()}
        </div>
      </div>
    );
  }
}
