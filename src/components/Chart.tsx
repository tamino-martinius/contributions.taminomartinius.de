import { Vue, Component, Prop } from 'vue-property-decorator';
import { Graph } from '@/types';
import Card from '@/components/Card';
import ButtonGroup from '@/components/ButtonGroup';
import Legend from '@/components/Legend';
import { scaleLinear, area, line, curveBasis, values } from 'd3';

export enum ChartType {
  LINES = 'chart--lines',
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
  currentType = this.type || ChartType.STACKED;

  typeChangeHandler(type: ChartType) {
    this.currentType = type;
  }

  render() {
    const classes = ['chart', this.currentType];
    const graphs: Graph[] = this.graphs.map(graph => ({
      title: graph.title,
      color: graph.color,
      value: graph.value,
      values: graph.values.slice(0),
    }));

    const xMax = Math.max(...graphs.map(graph => graph.values.length));
    let y0 = Array.from({ length: xMax }).map(() => 0);
    if (this.currentType === ChartType.STACKED) {
      for (let i = 1; i < graphs.length; i += 1) {
        graphs[i].values = graphs[i].values.map(
          (y, x) => y + graphs[i - 1].values[x] || 0,
        );
      }
    }
    const yMax = Math.max(...graphs.map(graph =>
      Math.max(...graph.values),
    ));

    const xScale = scaleLinear().domain([0, xMax - 1]).range([0, CHART_WIDTH]);
    const yScaleComplete = scaleLinear().domain([0, yMax]).range([CHART_HEIGHT, 0]);
    const yScaleTop = scaleLinear().domain([0, yMax]).range([CHART_HEIGHT / 2, 0]);
    const yScaleBottom = scaleLinear().domain([0, yMax]).range([CHART_HEIGHT / 2, CHART_HEIGHT]);

    const createPath = (values: number[], index: number) => {
      let yScale = yScaleComplete;
      if (this.currentType === ChartType.COMPARE) {
        yScale = index % 2 === 1 ? yScaleTop : yScaleBottom;
      }
      return line<number>()
        .x((d, i) => xScale(i))
        .y((d, i) => yScale(d))
        .curve(curveBasis)(values)
        ;
    };

    const createArea = (values: number[], index: number) => {
      let yScale = yScaleComplete;
      if (this.currentType === ChartType.COMPARE) {
        yScale = index % 2 === 1 ? yScaleTop : yScaleBottom;
      }
      return area<number>()
        .x((d, i) => xScale(i))
        .y0((d, i) => yScale(y0[i] || 0))
        .y1((d, i) => yScale(d))
        .curve(curveBasis)(values)
        ;
    };

    const graphElements: JSX.Element[] = [];
    for (let i = 0; i < graphs.length; i += 1) {
      const graph = graphs[i];
      graphElements.push(
        <path
          class="chart__area"
          d={createArea(graph.values, i)}
          style={{ '--color': `var(--${graph.color})` }}
        />,
        <path
          class="chart__graph"
          d={createPath(graph.values, i)}
          style={{ '--color': `var(--${graph.color})` }}
        />,
      );
      if (this.currentType === ChartType.STACKED) {
        y0 = graph.values;
      }
    }
    let divider: JSX.Element | undefined;
    let typeToggle: JSX.Element | undefined;

    if (this.currentType === ChartType.COMPARE) {
      divider = (
        <path
          class="chart__divider"
          d={`M0,${~~(CHART_HEIGHT / 2)}L${CHART_WIDTH},${~~(CHART_HEIGHT / 2)}`}
        />
      );
    } else {
      typeToggle = (
        <ButtonGroup
          labels={['Lines', 'Stacked']}
          values={[ChartType.LINES, ChartType.STACKED]}
          slot="title"
          onValueChanged={this.typeChangeHandler}
        />
      );
    }

    const xAxisLabels = this.xLabels.map(label => (
      <label>{label}</label>
    ));

    return (
      <Card class={classes.join(' ')} title={this.title}>
        {typeToggle}
        <div class="chart__grid">
          <div class="chart__canvas chart--faded">
            <svg
              viewbox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              width={`${CHART_WIDTH}px`}
              height={`${CHART_HEIGHT}px`}
            >
              {graphElements}
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
