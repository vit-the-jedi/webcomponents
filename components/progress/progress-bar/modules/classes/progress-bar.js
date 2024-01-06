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
  setConfigs(configs = null){
    if(!configs){
      this.configs = window.__customProgressBarComponentTheme;
    }else {
      this.configs = configs
    }
  }
  attributeChangedCallback(name, oldValue, newValue) {
    const shadowRoot = this.shadowRoot;
    const shadowRootChildren = [...shadowRoot.children];
    let innerBarParent = shadowRootChildren.filter((child)=> {
      if(child.classList.contains("progress-wrapper")){
        return child.querySelector(".progress-bar-inner");
      }
    });
    innerBarParent = innerBarParent[0];
    const innerBar = innerBarParent.querySelector(".progress-bar-inner");
    const activeStepFromState = this._percentcomplete;
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
    console.trace();
    this._percentcomplete = Math.ceil(this.getActiveStepFromState());
    const progress = document.querySelector("progress-bar");
    const formattedActiveState = Math.floor(this._percentcomplete);
    progress.setAttribute(
      "percentcomplete",
      Math.ceil(this._percentcomplete)
    );
  }
  createStyles() {
    const progressBarTheme = this.getConfigs("progressBar");
    const styles = `
    .progress-wrapper {
      overflow: hidden;
    }
    .progress-bar {
      width: 99%;
      height: ${progressBarTheme.height}px;
      background-color: ${progressBarTheme.secondColor || "#F5F8F7"};
      border-radius: 10px;
      border: 1px solid #efefef;
      margin: auto;
      display:block;
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
  initFromLastKnownState(lastKnownState){
    this.setConfigs(lastKnownState.configs);
    this._percentcomplete = lastKnownState._percentcomplete;
    this._numOfSteps = lastKnownState._numOfSteps;
    this._maxValue = lastKnownState._maxValue;
    this._stepIncrement = lastKnownState._stepIncrement;
    __customProgressBarMethods.createProgressComponent();
    this.componentIsMounted().then((isMounted)=>{
       this.generateComponentShadow();
    });
   
  }
  generateComponentShadow(){
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
    this.setActiveStepInState();

    const webComponentClass = this;
    document.addEventListener("progressBarUpdate", function () {
      if (
        webComponentClass._percentcomplete < webComponentClass._maxValue
      ) {
        webComponentClass.setActiveStepInState();
      }
    });
    this.startPageChangeListener();
  }
  connectedCallback() {
    const savedState = sessionStorage.getItem("progress-bar-state");
    if(savedState){
      this.initFromLastKnownState(JSON.parse(savedState));
      sessionStorage.removeItem("progress-bar-state");
    }else {
      this.setConfigs();
      this.generateComponentShadow();
    }
  }
  disconnectedCallback(){
    const currentState = this.getState();
    sessionStorage.setItem("progress-bar-state", JSON.stringify(currentState));
  }
}

customElements.define("progress-bar", ProgressBar);




export { ProgressBar };
