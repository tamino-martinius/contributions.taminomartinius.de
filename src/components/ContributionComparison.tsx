// This is an alternative way to define components using decorators
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

    const sections: DataPoint[] = [
      { color: 'color-open', title: 'Open Source', value: `${(valueOpen * 100).toFixed(2)}%` },
      { color: 'color-closed', title: 'Private', value: `${(valueClosed * 100).toFixed(2)}%` },
    ];

    return (
      <Card title="Contribution Comparison" class="contribution-comparison">
        <Legend sections={sections} />
      </Card>
    );
  }
}
