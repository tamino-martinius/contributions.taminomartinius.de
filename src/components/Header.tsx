// This is an alternative way to define components using decorators
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class extends Vue {
  render() {
    return (
      <div class="header">
        <img
          src="https://avatars1.githubusercontent.com/u/3111766?s=400&v=4"
          alt="Avatar of Tamino Martinius"
        />
        <h1>
          I speak code as Head of Development <a href="https://shyftplan.com">@shyftplan</a>
        </h1>
      </div>
    );
  }
}
