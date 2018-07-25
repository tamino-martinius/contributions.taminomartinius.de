// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Graph, Point } from '@/types';
import Card from '@/components/Card';
import Legend from '@/components/Legend';
import { scaleLinear, line, curveBasis } from 'd3';

export enum ChartType {
  DISTINCT = 'chart--distinct',
  STACKED = 'chart--stacked',
  COMPARE = 'chart--compare',
}

const CHART_WIDTH = 840;
const CHART_HEIGHT = 200;

@Component
export default class extends Vue {
  @Prop() graphs!: Graph[];
  @Prop() title!: string;
  @Prop() xLabels!: string[];
  @Prop() type!: ChartType;

  render() {
    const classes = ['chart', this.type || ChartType.DISTINCT];

    const xMax = Math.max(...this.graphs.map(graph =>
      Math.max(...graph.points.map(point => point.x)),
    ));
    const yMax = Math.max(...this.graphs.map(graph =>
      Math.max(...graph.points.map(point => point.y)),
    ));

    const xScale = scaleLinear().domain([0, xMax]).range([0, CHART_WIDTH]);
    const yScale = scaleLinear().domain([0, yMax]).range([CHART_HEIGHT, 0]);
    const createPath = line<Point>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(curveBasis);

    const paths = this.graphs.map(graph => (
      <path
        class="chart__graph"
        d={createPath(graph.points)}
        style={{ '--color': `var(--${graph.color})` }}
      />
    ));

    const xAxisLabels = this.xLabels.map(label => (
      <label>{label}</label>
    ));

    return (
      <Card class={classes.join(' ')} title={this.title}>
        <div class="chart__grid">
          <div class="chart__canvas">
            <svg
              viewbox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              width={`${CHART_WIDTH}px`}
              height={`${CHART_HEIGHT}px`}
            >
              {paths}
            </svg>
          </div>
          <div class="chart__axis chart__axis--x">
            {xAxisLabels}
          </div>
        </div>
        <Legend sections={this.graphs} slot="footer" />
      </Card>
    );
  }
}
