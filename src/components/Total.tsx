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
  @Prop() stats!: Totals | undefined;

  render() {
    const count = this.stats ? this.stats.commitCount : 0;
    return (
      <div class="total" style={{ '--value': count, '--title': `'${count}'` }}/>
    );
  }
}
