import { Vue, Component, Prop } from 'vue-property-decorator';
import { DataPoint } from '@/types';
export { DataPoint } from '@/types';
import CountTo from '@/components/CountTo';

@Component
export default class extends Vue {
  @Prop() sections!: DataPoint[];
  @Prop() columns!: string;
  @Prop() decimals!: number;

  render() {
    const gridTemplateColumns = this.columns || this.sections.map(() => '1fr').join(' ');

    const legends = this.sections.map(data => (
      <div>
        <div class="legend__color" style={{ '--color': `var(--${data.color})` }} />
        <div class="legend__title">
          {data.title}
        </div>
        <div class="legend__value">
          <CountTo
            decimals={this.decimals}
            duration={Math.random() * 1000 + 500}
            endVal={data.value < 1 ? data.value * 100 : data.value}
            suffix={data.value < 1 ? ' %' : ''}
          />
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
