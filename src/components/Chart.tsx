// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Graph } from '@/types';
import Card from '@/components/Card';

export enum ChartType {
  DISTINCT = 'chart--distinct',
  STACKED = 'chart--stacked',
  COMPARE = 'chart--compare',
}

@Component
export default class extends Vue {
  @Prop() graphs!: Graph[];
  @Prop() title!: string;
  @Prop() type!: ChartType;

  render() {
    const classes = ['chart', this.type || ChartType.DISTINCT];

    return (
      <Card class={classes.join(' ')} title={this.title}>
        TBD
      </Card>
    );
  }
}
