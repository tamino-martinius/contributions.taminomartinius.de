import { Vue, Component, Prop } from 'vue-property-decorator';
import Util from '@/models/Util';

const MIN_SHOW_DISTANCE_DURATION = 100;

@Component
export default class Card extends Vue {
  static lastShow = Date.now();

  @Prop() title!: string;
  isVisible = false;
  isHandled = false;

  async show() {
    this.isHandled = true;
    const waitDuration = MIN_SHOW_DISTANCE_DURATION + Card.lastShow - Date.now();
    console.log(waitDuration);
    if (waitDuration > 0) {
      Card.lastShow = Date.now() + waitDuration;
      await Util.waitFor(waitDuration);
    } else {
      Card.lastShow = Date.now();
    }
    this.isVisible = true;
  }

  scrollHandler() {
    if (!this.isHandled && Util.isInViewport(this.$el)) this.show();
  }

  mounted() {
    this.scrollHandler();
    window.addEventListener('scroll', this.scrollHandler);
  }

  destroyed() {
    window.removeEventListener('scroll', this.scrollHandler);
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
