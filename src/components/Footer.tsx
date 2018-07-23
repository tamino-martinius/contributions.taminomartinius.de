// This is an alternative way to define components using decorators
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class extends Vue {
  render() {
    return (
      <footer class="footer">
        <div class="footer__content">
          <div class="footer__left">
            Made with ❤ by
            <a href="https://taminomartinius.de">
              Tamino Martinius
            </a>
          </div>
          <div class="footer__right">
            <a href="">
              Legal
            </a>
          </div>
        </div>
      </footer>
    );
  }
}
