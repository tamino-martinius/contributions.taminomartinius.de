// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import Card from '@/components/Card';
import Legend from '@/components/Legend';
import { Dict, Counts } from '@/types';

@Component
export default class extends Vue {
  @Prop() languages!: Dict<Counts>;
  @Prop() counts!: Counts;

  render() {
    const ruby = this.languages.Ruby.commitCount / this.counts.commitCount * 100;
    const js = this.languages.JavaScript.commitCount / this.counts.commitCount * 100;
    const ts = this.languages.TypeScript.commitCount / this.counts.commitCount * 100;
    const html = this.languages.HTML.commitCount / this.counts.commitCount * 100;

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
          <Legend data={{ color: 'color-2', title: 'JavaScript', value: `${js.toFixed(2)} %` }} />
          <Legend data={{ color: 'color-4', title: 'HTML', value: `${html.toFixed(2)} %` }} />
          <Legend data={{ color: 'color-1', title: 'Ruby', value: `${ruby.toFixed(2)} %` }} />
          <Legend data={{ color: 'color-3', title: 'TypeScript', value: `${ts.toFixed(2)} %` }} />
        </div>
      </Card>
    );
  }
}
