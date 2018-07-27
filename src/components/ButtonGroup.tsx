import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class extends Vue {
  @Prop() labels!: string[];
  @Prop() values!: any[];
  active: number = this.labels.length - 1;

  buttonClickHandler(index: number) {
    this.active = index;
    this.$emit('indexChanged', index);
    this.$emit('labelChanged', this.labels[index]);
    this.$emit('valueChanged', (this.values || this.labels)[index]);
  }

  render() {
    const buttons = this.labels.map((label, i) => (
      <button
        onClick={this.buttonClickHandler.bind(this, i)}
        class={`button-group__button${i === this.active ? ' button-group__button--active' : ''}`}
      >
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
