"use strict";

import { Progress } from "../../../globals/classes/progress.js";

export default class ProgressBar extends Progress {
  constructor() {
    super();
  }
  static get observedAttributes() {
    return ["percentcomplete"];
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
      //innerBar.style.width = activeStepFromState + "%";
      setTimeout(() => {
        innerBar.style.width = activeStepFromState + "%";
      }, 550);
    }
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
  getAnchorPoint(configAnchorPoint) {
    //most reliable way to wait for React DOM render from outside of react -___-
    return new Promise((resolve, reject) => {
      function checkElement() {
        const element = document.querySelector(configAnchorPoint);
        if (element) {
          clearInterval(intervalId);
          resolve(element);
        }
      }
      const intervalId = setInterval(checkElement, 50);
    });
  }
  getComponentAnchorPoint() {
    return new Promise(async (resolve, reject) => {
      this._anchorPoint = await this.getAnchorPoint(this.configs.anchorPoint);
      resolve();
    });
  }
  createComponent() {
    return new Promise((resolve, reject) => {
      try {
        this.classList.add("component-positioned");
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
        let innerBarWidth = 0;

        if (this.getProgressState.pause) {
          innerBarWidth = this.getProgressState.activeStep;
        } else {
          innerBarWidth = Math.max(this.getProgressState.activeStep - this.getProgressState.stepIncrement, 0);
        }

        barInner.style.width = `${innerBarWidth}%`;

        bar.appendChild(barInner);

        progressWrapper.appendChild(bar);
        shadow.appendChild(progressWrapper);
        this.shadow = shadow;
        const progDiv = document.createElement("div");
        progDiv.classList.add("progress-container");
        this.setAttribute("data-max", "100");
        this.setAttribute("data-steps", this.configs.steps);
        this.shadow.prepend(this.createGlobalStyles());
        this.shadow.prepend(this.createStyles());
        resolve(this);
      } catch (e) {
        reject(e);
      }
    });
  }
}

customElements.define("progress-bar", ProgressBar);

export { ProgressBar };
