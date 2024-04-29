"use strict";

import { Progress } from "../../../globals/classes/progress.js";

export default class ProgressBar extends Progress {
  constructor() {
    super();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    const shadowRoot = this.shadowRoot;
    const shadowRootChildren = [...shadowRoot.children];
    let innerBarParent = shadowRootChildren.filter((child) => {
      if (child.classList.contains("progress-wrapper")) {
        return child.querySelector(".progress-bar-inner");
      }
    });
    innerBarParent = innerBarParent[0];
    const innerBar = innerBarParent.querySelector(".progress-bar-inner");
    const activeStepFromState = this._progressState.percentcomplete;
    if (name === "percentcomplete") {
      //animation for width of progress bar
      setTimeout(() => {
        innerBar.style.width = activeStepFromState + "%";
      }, 250);
    }
  }
  calculateProgressPercentage() {
    return (this._activeStep / this._totalSteps) * 100;
  }
  effects() {
    return {
      _configs: {
        configsUpdated: () => {
          console.log(this._configs);
          console.log("Hello");
        },
      },
      _activeStep: {
        activeStepUpdated: () => {
          console.log(this._activeStep);
        },
        updateStepsRemaining: () => {
          console.log(this._stepsRemaining);
          this._stepsRemaining = this._configs.totalSteps - this._activeStep;
        },
      },
      _progressPercentage: {
        outputProgressPercentage: () => {
          console.log(this._progressPercentage);
        },
      },
      _totalSteps: {
        totalStepsUpdated: () => {
          console.log(this._totalSteps);
          this._progressPercentage = (this._activeStep / this._totalSteps) * 100;
        },
      },
    };
  }
  createStyles() {
    const styles = `
    .progress-wrapper {
      overflow: hidden;
      margin: 2em auto;
    }
    .progress-bar {
      width: 99%;
      height: ${this.configs.height}px;
      background-color: ${this.configs.secondColor || "#F5F8F7"};
      border-radius: 10px;
      border: 1px solid #efefef;
      margin: auto;
      display:block;
    }
    .progress-bar-inner {
      height: 100%;
      line-height: 30px;
      background: ${this.configs.mainColor || "#66c296 "};
      text-align: center;
      transition: width 0.15s;
      border-radius: 10px;
    }`;
    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    return styleElement;
  }
}

customElements.define("progress-bar", ProgressBar);

export { ProgressBar };
