import { Vue, Component, Prop } from 'vue-property-decorator';
import Bar from '@/components/Bar';
import ButtonGroup from '@/components/ButtonGroup';
import Card from '@/components/Card';
import Legend from '@/components/Legend';
import Heatmap from '@/components/Heatmap';
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

    const startDate = new Date(this.year);
    const date = startDate;
    const endDate = new Date(parseInt(this.year, 10), 11, 31, 23, 59, 59);
    const keys: (string | undefined)[] = [];
    const today = new Date();
    while (date <= endDate) {
      if (date > today) {
        keys.push(undefined);
      } else {
        keys.push(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
      }
      date.setDate(date.getDate() + 1);
    }
    const counts: (number | undefined)[] = [];
    let totalCommits = 0;
    const max = Object.values(this.dates).reduce((max, date) => Math.max(max, date.commitCount), 0);
    for (const key of keys) {
      if (key) {
        const count = (this.dates[key] && this.dates[key].commitCount) || 0;
        counts.push(count);
        totalCommits += count;
      } else {
        counts.push(undefined);
      }
    }
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
        <Heatmap counts={counts} year={this.year} max={max} />
        <Legend class="yearly-statistics__legend" sections={sections} />
        <Bar sections={sections} />
      </Card>
    );
  }
}
