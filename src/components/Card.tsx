import { Vue, Component, Prop } from 'vue-property-decorator';
import Util from '@/models/Util';

const MIN_SHOW_DISTANCE_DURATION = 100;

@Component
export default class Card extends Vue {
  static lastShow = Date.now();

  @Prop() title!: string;
  isVisible = false;

  async show() {
    const waitDuration = MIN_SHOW_DISTANCE_DURATION + Card.lastShow - Date.now();
    if (waitDuration > 0) {
      Card.lastShow = Date.now() + waitDuration;
      await Util.waitFor(waitDuration);
    } else {
      Card.lastShow = Date.now();
    }
    this.isVisible = true;
  }

  mounted() {
    this.show();
  }

  render() {
    const footer = this.$slots.footer ? (
      <div class="card__footer">
        {this.$slots.footer}
      </div>
    ) : undefined;

    return (
      <div class={['card', this.isVisible ? 'card--visible' : '']}>
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
