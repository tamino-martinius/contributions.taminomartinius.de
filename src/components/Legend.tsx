import { Vue, Component, Prop } from 'vue-property-decorator';
import { DataPoint } from '@/types';
export { DataPoint } from '@/types';

@Component
export default class extends Vue {
  @Prop() sections!: DataPoint[];
  @Prop() columns!: string;

  render() {
    const gridTemplateColumns = this.columns || this.sections.map(() => '1fr').join(' ');

    const legends = this.sections.map(data => (
      <div>
        <div class="legend__color" style={{ '--color': `var(--${data.color})` }} />
        <div class="legend__title">
          {data.title}
        </div>
        <div class="legend__value">
          {data.value < 1 ? `${(data.value * 100).toFixed(0)} %` : data.value.toLocaleString()}
        </div>
      </div>
    ));

    return (
      <div class="legend" style={{ gridTemplateColumns }}>
        {legends}
      </div>
    );
  }
}
