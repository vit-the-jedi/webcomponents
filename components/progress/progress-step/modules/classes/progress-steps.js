"use strict";

import { Progress } from "../../../globals/classes/progress.js";

class ProgressStep extends Progress {
  constructor() {
    super();
  }
  setConfigs(){
    this.configs = window.__customProgressStepComponentTheme;
  }
  dispatchProgressEvent() {
    const stepProgressWrapper = this.shadow.querySelector(".progress-wrapper");
    stepProgressWrapper.classList.add("updating");
    setTimeout(()=>{
      stepProgressWrapper.classList.remove("updating");
      this.shadow.querySelector(".active")?.classList.remove("active");
      const stepToActivate = this.getStepFromList(this.getActiveStepFromState());
      stepToActivate.classList.add("active");
    }, this.getConfigs("transitionDuration"));
  }
  createStyles() {
    const progressStepTheme = this.getConfigs("progressStep");
    console.log(progressStepTheme);
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
            border: 2px solid ${progressStepTheme.mainColor};
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
    // Take attribute content and put it inside the info span
    const steps = Number(this.getAttribute("data-steps"));
    const stepList = document.createElement("ul");

    for (let i = 1; i <= steps; i++) {
      const stepNode = document.createElement("li");
      stepNode.textContent = `Step ${i}`;
      stepNode.id = `step-${i}`;
      stepNode.classList.add(`progress-step-${i}`);
      stepList.appendChild(stepNode);
      this.setStepToList(i, stepNode);
    }
    progressWrapper.appendChild(stepList);
    shadow.appendChild(progressWrapper);
    shadow.prepend(this.createStyles());
    shadow.prepend(this.createGlobalStyles());
    this.shadow = shadow;
    this.setActiveStepInState(1);
    const webComponentClass = this;
    document.addEventListener("progressStepUpdate", function () {
      if (webComponentClass._progressState.activeStep < webComponentClass.getStepsListFromState().size) {
        webComponentClass.setActiveStepInState(1);
      }
    });
  }
}

customElements.define("progress-step", ProgressStep);

export { ProgressStep };
