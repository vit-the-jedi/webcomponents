"use strict";

import { Progress } from "../../../globals/classes/progress.js";

export default class ProgressBar extends Progress {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    this.element = this;
  }
  connectedCallback() {
    if (this.shadowRoot.querySelector(".progress-wrapper")) return;

    this.shadowRoot.appendChild(this.createStyles());
    const progressWrapper = document.createElement("div");
    progressWrapper.classList.add("progress-wrapper");

    const progressOutput = document.createElement("div");
    progressOutput.id = "progress-output";
    progressOutput.textContent = this.outputProgress();

    progressWrapper.appendChild(progressOutput);
    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");
    const progressBarInner = document.createElement("div");
    progressBarInner.classList.add("progress-bar-inner");
    progressBarInner.style.width = this._progressPercentage + "%";
    progressBar.appendChild(progressBarInner);
    progressWrapper.appendChild(progressBar);
    this.shadowRoot.appendChild(progressWrapper);
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
  outputProgress() {
    switch (this._outputType) {
      case "percentage":
      default:
        return `${this._progressPercentageRounded}% Complete`;
      case "steps":
        return `Step ${this._activeStep} of ${this._totalSteps}`;
    }
  }
  updateProgress() {
    if (this._activeStep >= this._totalSteps) return;
    this._activeStep++;
    const updatedProgressPercent = this.calculateProgressPercentage();
    this._progressPercentage = updatedProgressPercent >= 100 ? 100 : updatedProgressPercent;
    this._stepsRemaining = this._configs.steps - this._activeStep;
  }
  calculateProgressPercentage() {
    const newProgress = (this._activeStep / this._totalSteps) * 100;
    this._progressPercentageRounded = Math.round(newProgress);
    return newProgress;
  }
  effects() {
    return {
      _configs: {
        configsUpdated: () => {
          console.log("configs updated");
          console.log(this._configs);
        },
      },
      _activeStep: {
        activeStepUpdated: () => {
          console.log(this._activeStep);
        },
        updateStepsRemaining: () => {
          console.log("steps remaining updated");
          this._stepsRemaining = this._configs.steps - this._activeStep;
          console.log(this._stepsRemaining);
        },
      },
      _progressPercentage: {
        outputProgressPercentage: () => {
          console.log("progress percentage updated");
          console.log(this._progressPercentage);
          //update progress visually
          if (this.shadowRoot.querySelector(".progress-bar-inner")) {
            this.shadowRoot.querySelector("#progress-output").textContent = this.outputProgress();
            this.shadowRoot.querySelector(".progress-bar-inner").style.width = this._progressPercentage + "%";
          }
        },
      },
      _progressPercentageRounded: {
        outputProgressPercentageRounded: () => {
          console.log("progress percentage rounded updated");
          console.log(this._progressPercentageRounded);
        },
      },
      _totalSteps: {
        totalStepsUpdated: () => {
          console.log("total steps updated");
          console.log(this._totalSteps);
          this._progressPercentage = this.calculateProgressPercentage();
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
      height: ${this._configs.height}px;
      background-color: ${this._configs.secondColor || "#F5F8F7"};
      border-radius: 10px;
      border: 1px solid #efefef;
      margin: auto;
      display:block;
    }
    .progress-bar-inner {
      height: 100%;
      line-height: 30px;
      background: ${this._configs.mainColor || "#66c296 "};
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
