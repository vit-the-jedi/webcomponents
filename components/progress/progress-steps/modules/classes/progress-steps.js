"use strict";

import { Progress } from "../../../globals/classes/progress.js";

export default class ProgressSteps extends Progress {
  constructor() {
    super();
    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });
    this.shadow = shadow;
    const progDiv = document.createElement("div");
    progDiv.classList.add("progress-container");
    const progressWrapper = document.createElement("div");
    progressWrapper.classList.add("progress-wrapper");
    const stepList = document.createElement("ul");
    // Take attribute content and put it inside the info span
    progressWrapper.appendChild(stepList);
    this.shadow.appendChild(progressWrapper);
  }
  static get observedAttributes() {
    return ["percentcomplete"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    const shadowRoot = this.shadowRoot;
    const stepProgressWrapper = shadowRoot.querySelector(".progress-wrapper");
    stepProgressWrapper.classList.add("updating");
    setTimeout(()=>{
      stepProgressWrapper.classList.remove("updating");
      shadowRoot.querySelector(".active")?.classList.remove("active");
      const stepToActivate = this.getStepFromList(this.getActiveStepFromState());
      if(stepToActivate){
        stepToActivate.classList.add("active");
      }else {
        this.getStepFromList(1).classList.add("active");
      }
      
    }, this.getConfigs("transitionDuration"));
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
    ul {
        display:flex; 
        flex-wrap: nowrap; 
        align-content: space-between;
        margin: 0;
        padding: 0;
    }
    li {
        list-style-type:none;
        flex-basis: calc(100%/${this.getStepsListFromState().size}); 
        text-align:center
    }
    .active {
        border: 2px solid ${this.getConfigs("mainColor") || "black"};
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
    this.getAnchorPoint(this.getConfigs("anchorPoint")).then((anchorPoint) => {
      anchorPoint.parentElement.insertBefore(
        this,
        anchorPoint.nextElementSibling
      );
    });
  }
  createProgressStepsComponent() {
    this.createProgressStepsComponentInner();
    this.shadow.prepend(this.createGlobalStyles());
    this.shadow.prepend(this.createStyles());
    document.dispatchEvent(new Event("componentMounted"));
  }
  createProgressStepsComponentInner(){
    this.setAttribute("data-max", this.getConfigs("steps"));
    this.setAttribute("data-steps", this.getConfigs("steps"));
    this.getStepsAndSetToStateList();
  }
  getStepsAndSetToStateList(){
    return new Promise((resolve)=>{
      const steps = Number(this.getConfigs("steps"));
      const stepList = this.shadow.querySelector("ul");
      const stepElements = this.shadow.querySelectorAll("li");
      if (stepElements.length > 0){
        stepElements.forEach((el,i,arr)=> this.setStepToList(i + 1, el));
      }else {
        for (let i = 1; i <= steps; i++) {
          const stepNode = document.createElement("li");
          stepNode.textContent = `Step ${i}`;
          stepNode.id = `step-${i}`;
          stepNode.classList.add(`progress-step-${i}`);
          stepList.appendChild(stepNode);
          this.setStepToList(i, stepNode);
        }
      }
      resolve();
    })

  }
  connectedCallback() {
    this.log("component connected");
    const savedState = JSON.parse(
      sessionStorage.getItem("custom-component__state")
    );
    if (savedState) {
      savedState.updated = false;
      savedState._progressState.activeStep =
        savedState._progressState.activeStep;
      savedState._percentcomplete =
        savedState._percentcomplete + savedState._stepIncrement;
      this.initFromLastKnownState(savedState);
      this.getStepsAndSetToStateList();
      this.shadow.prepend(this.createGlobalStyles());
      this.shadow.prepend(this.createStyles());
    } else {
      this.registerEvents();
      this.createProgressStepsComponent();
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

customElements.define("progress-steps", ProgressSteps);

