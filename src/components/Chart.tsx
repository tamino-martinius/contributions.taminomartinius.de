// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Graph } from '@/types';
import Card from '@/components/Card';

export enum GraphType {
  DISTINCT = 'graph--distinct',
  STACKED = 'graph--stacked',
  COMPARE = 'graph--compare',
}

@Component
export default class extends Vue {
  @Prop() graphs!: Graph[];
  @Prop() title!: string;

  render() {
    return (
      <Card title={this.title}>
        TBD
      </Card>
    );
  }
}
