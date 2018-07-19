import App from './components/App';
import { Vue, Component } from 'vue-property-decorator';

const MAX_SCROLL = 1_000;

@Component({
  template: `<app />`,
  components: { App },
})
class Main extends Vue {
}

new Main({ el: '#app' });
