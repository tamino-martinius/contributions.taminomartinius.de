import { Vue, Component } from 'vue-property-decorator';

@Component
export default class extends Vue {
  render() {
    return (
      <header class="header">
        <h1>
          GitHub Contributions
        </h1>
      </header>
    );
  }
}
