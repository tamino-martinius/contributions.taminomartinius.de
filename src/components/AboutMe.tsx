// This is an alternative way to define components using decorators
import { Vue, Component } from 'vue-property-decorator';
import Card from '@/components/Card';
import Legend from '@/components/Legend';

@Component
export default class extends Vue {
  render() {
    return (
      <Card title="Tamino Martinius" class="about-me">
        <img
          src="https://avatars3.githubusercontent.com/u/3111766?s=50&v=4"
          slot="title"
          class="about-me__avatar"
        />
        <h3>
          I speak code
        </h3>
        <h4>
          Head of Development <a href="https://shyftplan.com">@shyftplan</a>
        </h4>
        <hr />
        <div class="about-me__legend">
          <Legend color="color-1" title="Ruby" value="x.xx %" />
          <Legend color="color-2" title="JavaScript" value="x.xx %" />
          <Legend color="color-3" title="TypeScript" value="x.xx %" />
          <Legend color="color-4" title="All Others" value="x.xx %" />
        </div>
      </Card>
    );
  }
}
