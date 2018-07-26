// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Graph } from '@/types';
import Card from '@/components/Card';
import ButtonGroup from '@/components/ButtonGroup';
import Legend from '@/components/Legend';
import { scaleLinear, area, line, curveBasis } from 'd3';

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
  @Prop() type!: ChartType | undefined;

  typeChangeHandler(type: ChartType) {
    console.log(type);
  }

  render() {
    const type = this.type || ChartType.STACKED;
    const classes = ['chart', type];

    const xMax = Math.max(...this.graphs.map(graph => graph.values.length));
    const yMax = Math.max(...this.graphs.map(graph =>
      Math.max(...graph.values),
    ));

    const xScale = scaleLinear().domain([0, xMax]).range([0, CHART_WIDTH]);
    const yScaleComplete = scaleLinear().domain([0, yMax]).range([CHART_HEIGHT, 0]);
    const yScaleTop = scaleLinear().domain([0, yMax]).range([CHART_HEIGHT / 2, 0]);
    const yScaleBottom = scaleLinear().domain([0, yMax]).range([CHART_HEIGHT / 2, CHART_HEIGHT]);

    const y0 = Array.from({ length: xMax }).map(() => 0);

    const createPath = (values: number[], index: number) => {
      let yScale = yScaleComplete;
      if (type === ChartType.COMPARE) {
        yScale = index % 2 === 1 ? yScaleTop : yScaleBottom;
      }
      return line<number>()
        .x((d, i) => xScale(i))
        .y((d, i) => yScale(y0[i] + d))
        .curve(curveBasis)(values)
        ;
    };

    const createArea = (values: number[], index: number) => {
      let yScale = yScaleComplete;
      if (type === ChartType.COMPARE) {
        yScale = index % 2 === 1 ? yScaleTop : yScaleBottom;
      }
      return area<number>()
        .x((d, i) => xScale(i))
        .y0((d, i) => yScale(y0[i]))
        .y1((d, i) => yScale(y0[i] + d))
        .curve(curveBasis)(values)
        ;
    };

    const paths = this.graphs.map((graph, i) => (
      <path
        class="chart__graph"
        d={createPath(graph.values, i)}
        style={{ '--color': `var(--${graph.color})` }}
      />
    ));
    const areas = this.graphs.map((graph, i) => (
      <path
        class="chart__area"
        d={createArea(graph.values, i)}
        style={{ '--color': `var(--${graph.color})` }}
      />
    ));
    let divider: JSX.Element | undefined;
    if (type === ChartType.COMPARE) {
      divider = (
        <path
          class="chart__divider"
          d={`M0,${~~(CHART_HEIGHT / 2)}L${CHART_WIDTH},${~~(CHART_HEIGHT / 2)}`}
        />
      );
    }

    const xAxisLabels = this.xLabels.map(label => (
      <label>{label}</label>
    ));

    const typeToggle = type === ChartType.COMPARE ? undefined : (
      <ButtonGroup
        labels={['Distinct', 'Stacked']}
        values={[ChartType.DISTINCT, ChartType.STACKED]}
        slot="title"
        onValueChanged={this.typeChangeHandler}
      />
    );

    return (
      <Card class={classes.join(' ')} title={this.title}>
        {typeToggle}
        <div class="chart__grid">
          <div class="chart__canvas">
            <svg
              viewbox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              width={`${CHART_WIDTH}px`}
              height={`${CHART_HEIGHT}px`}
            >
              {paths}
              {areas}
              {divider}
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
