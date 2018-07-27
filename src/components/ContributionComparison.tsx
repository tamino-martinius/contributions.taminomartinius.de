import { Vue, Component, Prop } from 'vue-property-decorator';
import Card from '@/components/Card';
import Legend from '@/components/Legend';
import { CommitSplit, DataPoint, Counts } from '@/types';

const ANGLE_START = 0;
const ANGLE_END = 360;
const ANGLE_GAP = 1;
const SVG_SIZE = 160;
const STROKE_WIDTH = 3;
const HOVER_WIDTH = 10 + STROKE_WIDTH;

@Component
export default class extends Vue {
  @Prop() counts!: CommitSplit<Counts>;

  polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians)),
    };
  }

  describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);

    const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

    const d = [
      'M', start.x, start.y,
      'A', radius, radius, 0, arcSweep, 0, end.x, end.y,
    ].join(' ');

    return d;
  }

  render() {
    const valueOpen = this.counts.open.commitCount / this.counts.sum.commitCount;
    const valueClosed = this.counts.closed.commitCount / this.counts.sum.commitCount;
    const angle = valueOpen * 360;

    const sections: DataPoint[] = [
      { color: 'color-open', title: 'Open Source', value: valueOpen },
      { color: 'color-closed', title: 'Private', value: valueClosed },
    ];

    const classPath = 'contribution-comparison__path';
    const classOpen = 'contribution-comparison__path--open';
    const classClosed = 'contribution-comparison__path--closed';
    const classHover = 'contribution-comparison__path--hover';

    return (
      <Card title="Contribution Comparison" class="contribution-comparison">
        <Legend sections={sections} />
        <svg
          viewbox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          width={`${SVG_SIZE}px`}
          height={`${SVG_SIZE}px`}
        >
          <path
            class={[classPath, classOpen]}
            style={{ strokeWidth: `${STROKE_WIDTH}px` }}
            d={this.describeArc(
              SVG_SIZE / 2,
              SVG_SIZE / 2,
              SVG_SIZE / 2 - STROKE_WIDTH / 2,
              ANGLE_START + ANGLE_GAP,
              angle - ANGLE_GAP,
            )}
          />
          <path
            class={[classPath, classOpen, classHover]}
            style={{ strokeWidth: `${HOVER_WIDTH}px` }}
            d={this.describeArc(
              SVG_SIZE / 2,
              SVG_SIZE / 2,
              SVG_SIZE / 2 - HOVER_WIDTH / 2,
              ANGLE_START + ANGLE_GAP,
              angle - ANGLE_GAP,
            )}
          />
          <path
            class={[classPath, classClosed]}
            style={{ strokeWidth: `${STROKE_WIDTH}px` }}
            d={this.describeArc(
              SVG_SIZE / 2,
              SVG_SIZE / 2,
              SVG_SIZE / 2 - STROKE_WIDTH / 2,
              angle + ANGLE_GAP,
              ANGLE_END - ANGLE_GAP,
            )}
          />
          <path
            class={[classPath, classClosed, classHover]}
            style={{ strokeWidth: `${HOVER_WIDTH}px` }}
            d={this.describeArc(
              SVG_SIZE / 2,
              SVG_SIZE / 2,
              SVG_SIZE / 2 - HOVER_WIDTH / 2,
              angle + ANGLE_GAP,
              ANGLE_END - ANGLE_GAP,
            )}
          />
        </svg>
      </Card>
    );
  }
}
