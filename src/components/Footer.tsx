import { Vue, Component } from 'vue-property-decorator';

@Component
export default class extends Vue {
  render() {
    return (
      <footer class="footer">
        <div class="footer__content">
          <div class="footer__left">
            <a href="https://taminomartinius.de">
              Made with ❤ by Tamino Martinius
            </a>
          </div>
          <div class="footer__center">
            <a href="https://github.com/tamino-martinius/contributions.taminomartinius.de">
              Open Source - Code available at GitHub
            </a>
          </div>
          <div class="footer__right">
            <a href="https://taminomartinius.de/#legal">
              Legal
            </a>
          </div>
        </div>
      </footer>
    );
  }
}
