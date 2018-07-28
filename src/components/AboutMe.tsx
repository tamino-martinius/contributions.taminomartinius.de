import { Vue, Component, Prop } from 'vue-property-decorator';
import Card from '@/components/Card';
import Legend from '@/components/Legend';
import { Dict, Counts, DataPoint } from '@/types';

@Component
export default class extends Vue {
  @Prop() languages!: Dict<Counts>;
  @Prop() counts!: Counts;

  render() {
    const ruby = this.languages.Ruby.commitCount / this.counts.commitCount;
    const js = this.languages.JavaScript.commitCount / this.counts.commitCount;
    const ts = this.languages.TypeScript.commitCount / this.counts.commitCount;
    const html = this.languages.HTML.commitCount / this.counts.commitCount;
    const sections: DataPoint[] = [
      { color: 'color-2', title: 'JavaScript', value: js },
      { color: 'color-4', title: 'HTML', value: html },
      { color: 'color-1', title: 'Ruby', value: ruby },
      { color: 'color-3', title: 'TypeScript', value: ts },
    ];

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
          Head of Development
          <a href="https://shyftplan.com/en/?utm_source=tamino&utm_campaign=contributions">
            &nbsp;@shyftplan
          </a>
        </h4>
        <hr />
        <Legend decimals={2} class="about-me__legend" sections={sections} columns="1fr 1fr" />
      </Card>
    );
  }
}
