// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class extends Vue {
  @Prop() title!: string;

  render() {
    const footer = this.$slots.footer ? (
      <div class="card__footer">
        {this.$slots.footer}
      </div>
    ) : undefined;

    return (
      <div class="card">
        <div class="card__title">
          <h2>
            {this.title}
          </h2>
          {this.$slots.title}
        </div>
        <div class="card__content">
          {this.$slots.default}
        </div>
        {footer}
      </div>
    );
  }
}
