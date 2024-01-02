"use strict";

import { Progress } from "../../../globals/classes/progress.js";

class ProgressBar extends Progress {
  constructor() {
    super();
    this._maxValue = Number(this.getAttribute("data-max"));
    this._numOfSteps = Number(this.getAttribute("data-steps"));
    this._stepIncrement = this._maxValue / this._numOfSteps;
  }
  static get observedAttributes() {
    return ["percentcomplete"];
  }
  setConfigs(){
    this.configs = window.__customProgressBarComponentTheme;
  }
  attributeChangedCallback(name, oldValue, newValue) {
    const innerBar = this.shadow.querySelector(".progress-bar-inner");
    const activeStepFromState = this.getActiveStepFromState();
    const formattedActiveStep = Math.floor(activeStepFromState);
    if (name === "percentcomplete") {
      this._percentcomplete = activeStepFromState;
      innerBar.style.width = activeStepFromState + "%";
    }
  }
  get percentcomplete() {
    return this._percentcomplete;
  }

  set percentcomplete(val) {
    if (this._percentcomplete <= this._maxValue) {
      this.setAttribute("percentcomplete", val);
    }
  }
  dispatchProgressEvent() {
    this._percentcomplete = Math.ceil(this.getActiveStepFromState());
    const progress = document.querySelector("progress-bar");
    const formattedActiveState = Math.floor(this.getActiveStepFromState());
    progress.setAttribute(
      "percentcomplete",
      Math.ceil(this.getActiveStepFromState())
    );
  }
  createStyles() {
    const progressBarTheme = this.getConfigs("progressBar");
    const styles = `
    .progress-wrapper {
      overflow: hidden;
    }
    .progress-bar {
      width: 100%;
      height: 12px;
      background-color: ${progressBarTheme.secondColor || "#F5F8F7"};
      border-radius: 10px;
      border: 1px solid #efefef;
    }
    .progress-bar-inner {
      height: 100%;
      line-height: 30px;
      background: ${progressBarTheme.mainColor || '#66c296 '};
      text-align: center;
      transition: width 0.25s;
      border-radius: 10px;
    }

        `;
    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    return styleElement;
  }
  connectedCallback() {
    this.setConfigs();
    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });

    const progressWrapper = document.createElement("div");
    progressWrapper.classList.add("progress-wrapper");

    const bar = document.createElement("div");
    bar.classList.add("progress-bar");
    bar.max = this.getAttribute("data-max");
    bar.value = this.getAttribute("data-value");
    bar.id = "progress-bar-component";
    const barInner = document.createElement("div");
    barInner.classList.add("progress-bar-inner");

    barInner.style.width = `0%`;

    bar.appendChild(barInner);

    progressWrapper.appendChild(bar);
    shadow.appendChild(progressWrapper);
    shadow.prepend(this.createStyles());
    shadow.prepend(this.createGlobalStyles());
    this.shadow = shadow;
    this.setActiveStepInState(this._stepIncrement);

    const webComponentClass = this;
    document.addEventListener("progressBarUpdate", function () {
      if (
        webComponentClass.getActiveStepFromState() < webComponentClass._maxValue
      ) {
        webComponentClass.setActiveStepInState(
          webComponentClass._stepIncrement
        );
      }
    });
    this.startPageChangeListener();
  }
}
customElements.define("progress-bar", ProgressBar);

export { ProgressBar };
