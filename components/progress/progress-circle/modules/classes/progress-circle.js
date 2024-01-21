"use strict";

import { Progress } from "../../../globals/classes/progress.js";

export default class ProgressCircle extends Progress {
  constructor() {
    super();
    this.classList.add("component-positioned");
    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `<div class="progress-wrapper">
    <div class="single-chart">
      <svg viewBox="0 0 36 36" class="circular-chart orange">
        <path class="circle-bg"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path class="circle"
          stroke-dasharray="30, 100"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <text x="18" y="16.35" class="percentage"></text>
        <text x="18" y="22.35" class="complete">Complete</text>
      </svg>
    </div>`;
    this.shadow = shadow;
    document.dispatchEvent(new Event("componentCreated"));
  }
  static get observedAttributes() {
    return ["percentcomplete"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    const shadowRoot = this.shadowRoot;
    const circle = shadowRoot.querySelector(".circle");
    const percentOutput = shadowRoot.querySelector(".percentage");
   let lastProgressValue = this._percentcomplete - this._stepIncrement;
    if (name === "percentcomplete") {
      this._percentcomplete = this.getActiveStepFromState();
      percentOutput.textContent = `${this._percentcomplete}%`;
      //animation for progression of progress circle
      const updateCircleProgress = () => {
        if(lastProgressValue < this._percentcomplete){
          lastProgressValue = lastProgressValue + 1;
          circle.setAttribute("stroke-dasharray", `${lastProgressValue}, ${this._maxValue}`);
        }else {
          clearInterval(intervalId);
        }
      }
      const intervalId = setInterval(updateCircleProgress, 50);
      //setInterval that updates the first stroke-dasharray value of .circle selector incrementally so we can get an animation
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
      display: flex;
      flex-flow: row nowrap;
      max-width:300px;
      width: 70%;
      margin:auto;
      justify-content:center;
    }
    
    .single-chart {
      width: 33%;
      justify-content: space-around ;
    }
    
    .circular-chart {
      display: block;
      margin: 10px auto;
      max-width: 250px;
      max-height: 250px;
    }
    
    .circle-bg {
      fill: none;
      stroke: #eee;
      stroke-width: 3.8;
    }
    
    .circle {
      fill: none;
      stroke-width: 2.8;
      stroke-linecap: round;
      animation: progress 1s ease-in-out forwards;
    }
    
    @keyframes progress {
      0% {
        stroke-dasharray: 0 100;
      }
    }
    
    .circular-chart .circle {
      stroke: ${this.getConfigs("mainColor")};
    }

    .percentage {
      fill: #666;
      font-family: ${this.getConfigs("font")};
      font-size: 0.4em;
      text-anchor: middle;
    }
    .complete {
      fill: #666;
      font-family: ${this.getConfigs("font")};
      font-size: 0.3em;
      text-anchor: middle;
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
  getComponentAnchorPoint() {
    return new Promise(async (resolve, reject) => {
      this._anchorPoint = await this.getAnchorPoint(
        this.getConfigs("anchorPoint")
      );
      resolve();
    });
  }
  init(configs, callback) {
    callback(configs);
    this.getAnchorPoint(this.getConfigs("anchorPoint")).then((anchorPoint) => {
      anchorPoint.parentElement.insertBefore(
        this,
        anchorPoint.nextElementSibling
      );
    });
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
    document.dispatchEvent(new Event("componentBeforeMount"));
    this.log("component connected");
    const savedState = JSON.parse(
      sessionStorage.getItem("custom-component__state")
    );
    if (savedState) {
      savedState.updated = false;
      savedState._progressState.activeStep =
        savedState._progressState.activeStep + 1;
      savedState._percentcomplete =
        savedState._percentcomplete + savedState._stepIncrement;
      this.initFromLastKnownState(savedState);
      if(this.shadow.firstChild.nodeName === "STYLE"){
        return;
      }else {
        this.shadow.prepend(this.createGlobalStyles());
        this.shadow.prepend(this.createStyles());
      }
    } else {
      this.registerEvents();
      this.createProgressBarComponent();
    }
  }
  disconnectedCallback() {
    this.log("component disconnected");
    document.dispatchEvent(new Event("componentUnmounted"));
  }
}

customElements.define("progress-circle", ProgressCircle);

export { ProgressCircle };
