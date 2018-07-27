import { Vue, Component, Prop } from 'vue-property-decorator';

const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
const caf = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;
const defaultEasing = (t: number, b: number, c: number, d: number) =>
  c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;

@Component
export default class extends Vue {
  @Prop({ default: 0 }) startVal!: number;
  @Prop({ default: 0 }) endVal!: number;
  @Prop({ default: 3000 }) duration!: number;
  @Prop({ default: true }) autoplay!: boolean;
  @Prop({ default: 0, validator: (value: number) => value >= 0 }) decimals!: number;
  @Prop({ default: '.' }) decimal!: string;
  @Prop({ default: ',' }) separator!: string;
  @Prop({ default: '' }) prefix!: string;
  @Prop({ default: '' }) suffix!: string;
  @Prop({ default: true }) useEasing!: boolean;
  @Prop({ default: defaultEasing }) easingFn!:
    (t: number, b: number, c: number, d: number) => number;

  localStartVal = this.startVal;
  displayValue = this.formatNumber(this.startVal);
  printVal?: number;
  paused = false;
  localDuration = this.duration;
  startTime?: number;
  timestamp?: number;
  remaining?: number;
  rAF?: number;

  get countDown() {
    return this.startVal > this.endVal;
  }

  easing(t: number, b: number, c: number, d: number) {
    return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
  }

  start() {
    this.localStartVal = this.startVal;
    this.startTime = undefined;
    this.localDuration = this.duration;
    this.paused = false;
    this.rAF = raf(this.count);
  }

  pauseResume() {
    if (this.paused) {
      this.resume();
      this.paused = false;
    } else {
      this.pause();
      this.paused = true;
    }
  }

  pause() {
    if (this.rAF) caf(this.rAF);
  }

  resume() {
    this.startTime = undefined;
    if (this.remaining) this.localDuration = +this.remaining;
    if (this.printVal) this.localStartVal = +this.printVal;
    raf(this.count);
  }

  reset() {
    this.startTime = undefined;
    if (this.rAF) caf(this.rAF);
    this.displayValue = this.formatNumber(this.startVal);
  }

  count(timestamp: number) {
    if (!this.startTime) this.startTime = timestamp;
    this.timestamp = timestamp;
    const progress = timestamp - this.startTime;
    this.remaining = this.localDuration - progress;

    if (this.useEasing) {
      if (this.countDown) {
        this.printVal = this.localStartVal - this.easing(
          progress, 0, this.localStartVal - this.endVal, this.localDuration,
        );
      } else {
        this.printVal = this.easing(
          progress, this.localStartVal, this.endVal - this.localStartVal, this.localDuration,
        );
      }
    } else {
      if (this.countDown) {
        this.printVal = this.localStartVal - (
          (this.localStartVal - this.endVal) * (progress / this.localDuration)
        );
      } else {
        this.printVal = this.localStartVal +
          (this.endVal - this.localStartVal) * (progress / this.localDuration);
      }
    }
    if (this.countDown) {
      this.printVal = (this.printVal || 0) < this.endVal ? this.endVal : this.printVal;
    } else {
      this.printVal = (this.printVal || 0) > this.endVal ? this.endVal : this.printVal;
    }

    this.displayValue = this.formatNumber(this.printVal || 0);
    if (progress < this.localDuration) {
      this.rAF = raf(this.count);
    } else {
      this.$emit('callback');
    }
  }

  isNumber(val: any) {
    return !isNaN(parseFloat(val));
  }

  destroyed() {
    if (this.rAF) caf(this.rAF);
  }

  formatNumber(value: number) {
    let num = value.toFixed(this.decimals);
    num += '';
    const x = num.split('.');
    let x1 = x[0];
    const x2 = x.length > 1 ? this.decimal + x[1] : '';
    const rgx = /(\d+)(\d{3})/;
    if (this.separator && !this.isNumber(this.separator)) {
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + this.separator + '$2');
      }
    }
    return this.prefix + x1 + x2 + this.suffix;
  }

  mounted() {
    if (this.autoplay) {
      this.start();
    }
  }

  watch = {
    startVal: () => {
      if (this.autoplay) {
        this.start();
      }
    },
    endVal: () => {
      if (this.autoplay) {
        this.start();
      }
    },
  };

  render() {
    return (
      <div class="count-to">
        {this.displayValue}
      </div>
    );
  }
}
