import App from './components/App';
import { Vue, Component } from 'vue-property-decorator';

const MAX_SCROLL = 1_000;

@Component({
  template: `<app />`,
  components: { App },
})
class Main extends Vue {
  scroll = 0;
  alpha = 0;
  beta = 1;
  gamma = 0;
}

new Main({ el: '#app' });
