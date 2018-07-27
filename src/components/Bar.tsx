import { Vue, Component, Prop } from 'vue-property-decorator';
import { DataPoint } from '@/types';
export { DataPoint } from '@/types';

export enum BarType {
  HORIZONTAL = 'bar--horizontal',
  VERTICAL = 'bar--vertical',
}

@Component
export default class extends Vue {
  @Prop() sections!: DataPoint[];
  @Prop() type!: BarType | undefined;

  render() {
    const type = this.type || BarType.HORIZONTAL;

    const sections = this.sections.map(data => (
      <div class={['bar__section', type]} style={{ '--color': `var(--${data.color})` }} >
        {data.value.toLocaleString()}
      </div>
    ));

    const weights = this.sections.map(data => `${data.value}fr`).join(' ');
    const template = type === BarType.HORIZONTAL ? 'gridTemplateColumns' : 'gridTemplateRows';

    return (
      <div class="bar" style={{ [template]: weights }}>
        {sections}
      </div>
    );
  }
}
