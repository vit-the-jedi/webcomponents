"use strict";

import { Progress } from "../../../globals/classes/progress.js";

export default class ProgressBar extends Progress {
  constructor() {
    super();
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

    barInner.style.width = `0%`;

    bar.appendChild(barInner);

    progressWrapper.appendChild(bar);
    shadow.appendChild(progressWrapper);
    this.shadow = shadow;
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
    const activeStepFromState = this._percentcomplete;
    const formattedActiveStep = Math.floor(activeStepFromState);
    if (name === "percentcomplete") {
      this._percentcomplete = activeStepFromState;
      //animation for width of progress bar
      setTimeout(()=>{
        innerBar.style.width = activeStepFromState + "%";
      }, 250)

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
  createStyles() {
    const styles = `
    .progress-wrapper {
      overflow: hidden;
      margin: 2em auto;
    }
    .progress-bar {
      width: 99%;
      height: ${this.getConfigs("height")}px;
      background-color: ${this.getConfigs("secondColor") || "#F5F8F7"};
      border-radius: 10px;
      border: 1px solid #efefef;
      margin: auto;
      display:block;
    }
    .progress-bar-inner {
      height: 100%;
      line-height: 30px;
      background: ${this.getConfigs("mainColor") || "#66c296 "};
      text-align: center;
      transition: width 0.15s;
      border-radius: 10px;
    }


        `;
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
  createComponentArea() {
    return new Promise(async (resolve, reject) => {
      this._anchorPoint = await this.getAnchorPoint(
        this.getConfigs("anchorPoint")
      );
      resolve();
    });
  }
  init(configs, callback) {
    callback(configs);
    this.getAnchorPoint(this.getConfigs("anchorPoint")).then((anchorPoint)=>{
      anchorPoint.parentElement.insertBefore(this, anchorPoint.nextElementSibling);
    })
  }
  createProgressBarComponent() {
    const progDiv = document.createElement("div");
    progDiv.classList.add("progress-container");
    this.setAttribute("data-max", "100");
    this.setAttribute("data-steps", this.getConfigs("steps"));
    this.shadow.prepend(this.createGlobalStyles());
    this.shadow.prepend(this.createStyles());
    document.dispatchEvent(new Event("componentMounted"));
  }
  connectedCallback() {
    this.log("component connected");
    const savedState = JSON.parse(
      sessionStorage.getItem("custom-component__state")
    );
    if(savedState){
      savedState.updated = false;
      savedState._progressState.activeStep = savedState._progressState.activeStep + 1;
      savedState._percentcomplete = savedState._percentcomplete + savedState._stepIncrement;
      this.initFromLastKnownState(savedState);
    }else {
      this.registerEvents();
      this.createProgressBarComponent();
    }
    
    //document.dispatchEvent(new Event("componentMounted"));
    //may need to begin all logic in here - as the issue stems from the leadID version of the progress-bar
    //being added to the page without first calling the createProgressComponent
  }
  disconnectedCallback() {
    this.log("component disconnected");
    document.dispatchEvent(new Event("componentUnmounted"));
  }
}

customElements.define("progress-bar", ProgressBar);

export { ProgressBar };
