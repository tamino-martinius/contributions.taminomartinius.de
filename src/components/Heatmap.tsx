import { Vue, Component, Prop } from 'vue-property-decorator';
import { Dict } from '@/types';

@Component
export default class extends Vue {
  @Prop() year!: string;
  @Prop() counts!: (number | undefined)[];
  @Prop() max!: number;
  colors: Dict<string>;

  generateColorDict() {
    let colorIndex = 2;
    let colorLimit = ~~(this.max / 2);
    const colors: Dict<string> = {};
    for (let i = this.max; i > 0; i -= 1) {
      colors[i.toString()] = `color-${colorIndex}`;
      if (i === colorLimit) {
        colorIndex = Math.min(7, colorIndex + 1);
        colorLimit = ~~(colorLimit / 2);
      }
    }
    colors['0'] = 'color-0';
    return colors;
  }

  constructor() {
    super(...arguments);
    this.colors = this.generateColorDict();
  }

  render() {
    const cells = this.counts.map(count => (
      <div
        class="heatmap__cell"
        style={{
          '--color': `var(--${
            count === undefined ? 'color-empty' : this.colors[count.toString()]
            })`,
        }}
      />
    ));

    const offset = new Date(this.year).getDay();
    for (let i = 0; i < offset; i += 1) {
      cells.unshift(<div />);
    }

    const colors = ['color-0'];
    for (let i = 7; i > 0; i -= 1) {
      colors.push(`color-${i}`);
    }

    const legendCells = colors.map(color => (
      <div class="heatmap__cell" style={{ '--color': `var(--${color})` }} />
    ));

    return (
      <div class="heatmap">
        <div class="heatmap__grid">
          {cells}
        </div>
        <div class="heatmap__legend">
          <div>less</div>
          {legendCells}
          <div>more</div>
        </div>
      </div>
    );
  }
}
