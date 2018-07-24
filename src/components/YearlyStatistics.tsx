// This is an alternative way to define components using decorators
import { Vue, Component, Prop } from 'vue-property-decorator';
import Bar from '@/components/Bar';
import Card from '@/components/Card';
import Legend from '@/components/Legend';
import { Counts, RepositoryStats, Dict, DataPoint } from '@/types';

@Component
export default class extends Vue {
  year = new Date().getFullYear().toString();
  @Prop() dates!: Dict<Counts>;
  @Prop() repos!: Dict<RepositoryStats>;

  render() {
    const year = this.year;
    const keys = Object.keys(this.dates).filter(date => date.startsWith(year));
    const counts = keys.map(key => this.dates[key]);
    const sum = counts.reduce((sum, count) => sum + count.commitCount, 0);
    const reposOfYear: Dict<Counts> = {};
    for (const repoKey in this.repos) {
      const repo = this.repos[repoKey];
      if (repo.years[year]) reposOfYear[repoKey] = repo.years[year];
    }
    const repoKeys = Object.keys(reposOfYear);
    repoKeys.sort((key1, key2) => reposOfYear[key2].commitCount - reposOfYear[key1].commitCount);
    let othersSum = sum;
    const sections: DataPoint[] = [];
    for (let i = 0; i < repoKeys.length && i < 6; i += 1) {
      const section = {
        color: `color-${i + 1}`,
        title: repoKeys[i].split('/')[1],
        value: reposOfYear[repoKeys[i]].commitCount,
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

    return (
      <Card title="Yearly Statistics" class="yearly-statistics">
        <h3>
          Year {year}
        </h3>
        <h4>
          {sum.toLocaleString()} Commits
        </h4>
        <hr />
        <Legend class="yearly-statistics__legend" sections={sections} />
        <Bar sections={sections} />
      </Card>
    );
  }
}
