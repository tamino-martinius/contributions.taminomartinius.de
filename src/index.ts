import vue from 'vue';
import App from './components/App';

const v = new vue({
  el: '#app',
  template: `
    <app/>
  `,
  data: { name: 'World' },
  components: {
    App,
  },
});
