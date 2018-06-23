import vue from 'vue';
import HelloVue from './components/Hello.vue';
import HelloDecoratorVue from './components/HelloDecorator.vue';

const v = new vue({
  el: '#app',
  template: `
    <div>
        Name: <input v-model="name" type="text">
        <h1>Hello Component</h1>
        <hello-vue :name="name" :initialEnthusiasm="5" />
        <h1>Hello Decorator Component</h1>
        <hello-decorator-vue :name="name" :initialEnthusiasm="5" />
        </div>
    `,
  data: { name: 'World' },
  components: {
    HelloVue,
    HelloDecoratorVue,
  },
});
