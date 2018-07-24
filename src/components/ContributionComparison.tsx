// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import Card from '@/components/Card';
import { CommitSplit, Counts } from '@/types';

@Component
export default class extends Vue {
  @Prop() counts!: CommitSplit<Counts>;

  render() {

    return (
      <Card title="Contribution Comparison" class="contribution-comparison">

      </Card>
    );
  }
}
