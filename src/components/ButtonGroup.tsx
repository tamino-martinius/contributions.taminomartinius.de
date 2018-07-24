// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class extends Vue {
  @Prop() labels!: string[];
  @Prop() values!: any[];
  active: number = this.labels.length - 1;

  render() {
    const active = this.active || 0;
  buttonClickHandler(index: number) {
    this.active = index;
    this.$emit('indexChanged', index);
    this.$emit('labelChanged', (this.labels || [])[index]);
    this.$emit('valueChanged', (this.values || [])[index]);
  }

    const buttons = this.labels.map((label, i) => (
      <button class={`button-group__button${i === active ? ' button-group__button--active' : ''}`}>
        {label}
      </button>
    ));

    return (
      <div class="button-group">
        {buttons}
      </div>
    );
  }
}
