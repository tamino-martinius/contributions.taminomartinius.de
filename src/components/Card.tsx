import { Vue, Component, Prop } from 'vue-property-decorator';
import Util from '@/models/Util';

const MIN_SHOW_DISTANCE_DURATION = 30;

@Component
export default class Card extends Vue {
  static lastShow = Date.now();

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
