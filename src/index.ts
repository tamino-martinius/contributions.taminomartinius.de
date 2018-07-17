import App from './components/App';
import { Vue, Component } from 'vue-property-decorator';

@Component({
  template: `<app />`,
  components: { App },
})
class Main extends Vue {
}

new Main({ el: '#app' });
