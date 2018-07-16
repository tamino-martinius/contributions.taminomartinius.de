// This is an alternative way to define components using decorators
import {
  Vue,
  Component,
  Prop,
} from 'vue-property-decorator';
import {
  Totals,
} from '../types';

@Component
export default class extends Vue {
  @Prop() stats!: Totals;

  render() {
    return (
      <div style={`--value=${this.stats.commitCount}`}>
        {this.stats.commitCount}
      </div>
    );
  }
}
