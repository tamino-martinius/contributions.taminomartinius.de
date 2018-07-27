import { Vue, Component, Prop } from 'vue-property-decorator';

export enum RowType {
  FULL = 'row--full',
  FIRST_THIRD = 'row--first-third',
  LAST_THIRD = 'row--last-third',
}

@Component
export default class extends Vue {
  @Prop() type!: RowType;

  render() {
    const classes = ['row', this.type || RowType.FULL];

    return (
      <div class={classes.join(' ')}>
        {this.$slots.default}
        {this.$slots.first}
        {this.$slots.last}
      </div>
    );
  }
}
