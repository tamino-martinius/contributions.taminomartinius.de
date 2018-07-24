// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import { DataPoint } from '@/types';
export { DataPoint } from '@/types';

@Component
export default class extends Vue {
  @Prop() sections!: DataPoint[];

  render() {
    const legends = this.sections.map(data => (
      <div class="legend">
        <div class="legend__color" style={{ '--color': `var(--${data.color})` }} />
        <div class="legend__title">
          {data.title}
        </div>
        <div class="legend__value">
          {data.value.toLocaleString()}
        </div>
      </div>
    ));

    return (
      <div class="legends">
        {legends}
      </div>
    );
  }
}
