"use strict";
/**
 * General class to extend for all progress elements
 *
 *
 *
 */
class Progress extends HTMLElement {
  constructor() {
    super();
    this.configs = {};
    this._progressState = {};
    this._progressState.activeStep = 0;
    this._progressState.steps = new Map();
  }
  getConfigs(elementType){
    return this.configs[elementType];
  }
  setStepToList(stepIndex, step){
    this._progressState.steps.set(stepIndex, step);
  }
  getStepFromList(stepIndex){
    return this._progressState.steps.get(stepIndex);
  }
  getStepsListFromState(){
    return this._progressState.steps;
  }
  getActiveStepFromState(){
    return this._progressState.activeStep;
  }
  setActiveStepInState(increment){
    this._progressState.activeStep = this._progressState.activeStep + increment;
    this.dispatchProgressEvent();
  }
  startPageChangeListener(){
    const mutationObserverCallback = (mutations, observer) =>{
      for (const mutation of mutations) {
        if(mutation.removedNodes.length > 0 && mutation.removedNodes[0].classList.contains("page")){
          //dispatch progress event
          document.dispatchEvent(new Event("progressBarUpdate"));
        }
      }
    }
    const observer = new MutationObserver(mutationObserverCallback);
    observer.observe(document.querySelector(".survey"), { childList:true});
  }
  createGlobalStyles(){
    const globalStyles = `
        .progress-wrapper {
            transition-property: all;
            transition-duration: ${this.getConfigs("transitionDuration") / 1000}s;
            transition-timing-function: ease-in;
            opacity: 1;
        }
        .updating {
            opacity: 0;
        }
        `;
    const globalStyleElement = document.createElement("style");
    globalStyleElement.textContent = globalStyles;
    return globalStyleElement;
  }
}

export { Progress };
