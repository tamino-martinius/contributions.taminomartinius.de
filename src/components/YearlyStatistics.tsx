// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import Bar from '@/components/Bar';
import ButtonGroup from '@/components/ButtonGroup';
import Card from '@/components/Card';
import Legend from '@/components/Legend';
import { Counts, RepositoryStats, Dict, DataPoint } from '@/types';

@Component
export default class extends Vue {
  year = new Date().getFullYear().toString();
  @Prop() dates!: Dict<Counts>;
  @Prop() repos!: Dict<RepositoryStats>;

  yearChangeHandler(year: string) {
    this.year = year;
  }

  get reposOfYear() {
    const reposOfYear: Dict<Counts> = {};
    for (const repoKey in this.repos) {
      const repo = this.repos[repoKey];
      if (repo.years[this.year]) reposOfYear[repoKey] = repo.years[this.year];
    }
    return reposOfYear;
  }

  sections(totalCommits: number) {
    const repos = this.reposOfYear;
    let othersSum = totalCommits;
    const repoKeys = Object.keys(repos);
    repoKeys.sort((key1, key2) => repos[key2].commitCount - repos[key1].commitCount);
    const sections: DataPoint[] = [];
    for (let i = 0; i < repoKeys.length && i < 6; i += 1) {
      const section = {
        color: `color-${i + 1}`,
        title: repoKeys[i].split('/')[1],
        value: repos[repoKeys[i]].commitCount,
      };
      othersSum -= section.value;
      sections.push(section);
    }
    if (othersSum > 0) {
      sections.push({
        color: 'color-7',
        title: 'All Others',
        value: othersSum,
      });
    }
    return sections;
  }

  render() {
    const years: string[] = [];
    for (let year = 2013; year <= new Date().getFullYear(); year += 1) {
      years.push(year.toString());
    }
    const keys = Object.keys(this.dates).filter(date => date.startsWith(this.year));
    const counts = keys.map(key => this.dates[key]);
    const totalCommits = counts.reduce((sum, count) => sum + count.commitCount, 0);
    const sections = this.sections(totalCommits);

    return (
      <Card title="Yearly Statistics" class="yearly-statistics">
        <ButtonGroup labels={years} slot="title" onValueChanged={this.yearChangeHandler} />
        <h3>
          Year {this.year}
        </h3>
        <h4>
          {totalCommits.toLocaleString()} Commits
        </h4>
        <hr />
        <h3 class="yearly-statistics__highlights">
          Highlights
        </h3>
        <Legend class="yearly-statistics__legend" sections={sections} />
        <Bar sections={sections} />
      </Card>
    );
  }
}
