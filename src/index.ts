import App from '@/components/App';
import { Vue, Component } from 'vue-property-decorator';

@Component({
  template: `
    <app :style="{
      '--alpha': alpha,
      '--beta': beta,
      '--gamma': gamma,
    }" />`,
  components: { App },
})
class Main extends Vue {
  alpha = 0;
  beta = 0;
  gamma = 0;

  handleOrientation(e: DeviceOrientationEvent) {
    this.alpha = (e.alpha || 0) / 90;
    this.beta = ((e.beta || 90) - 90) / 90;
    this.gamma = (e.gamma || 0) / 90;
  }

  mounted() {
    window.addEventListener('deviceorientation', this.handleOrientation);
  }

  destroyed() {
    window.removeEventListener('deviceorientation', this.handleOrientation);
  }
}

new Main({ el: '#app' });
