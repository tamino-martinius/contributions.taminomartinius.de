import App from './components/App';
import { Vue, Component } from 'vue-property-decorator';

const MAX_SCROLL = 1_000;

@Component({
  template: `
      '--scroll': scroll,
    <app :class="'step-' + step" :style="{
      '--alpha': alpha,
      '--beta': beta,
      '--gamma': scroll,
    }" />`,
  components: { App },
})
class Main extends Vue {
  scroll = 0;
  alpha = 0;
  beta = 0;
  gamma = 0;
  step = 0;

  handleWheel(e: WheelEvent) {
    this.scroll += e.deltaY / MAX_SCROLL;
    this.scroll = Math.max(0, this.scroll);
    this.step = ~~this.scroll;
    e.preventDefault();
  }

  handleOrientation(e: DeviceOrientationEvent) {
    this.alpha = (e.alpha || 0) / 90;
    this.beta = ((e.beta || 90) - 90) / 90;
    this.gamma = (e.gamma || 0) / 90;
  }

  mounted() {
    window.addEventListener('wheel', this.handleWheel);
    window.addEventListener('deviceorientation', this.handleOrientation);
  }

  destroyed() {
    window.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('deviceorientation', this.handleOrientation);
  }
}

new Main({ el: '#app' });
