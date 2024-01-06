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
    this.progressElement = null;
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
  async componentIsMounted(){
    console.trace();
    return new Promise((resolve)=>{
      resolve();
    })
  }
  setActiveStepInState(){
    if(this._progressState.activeStep + this._stepIncrement > this._maxValue){
      this._progressState.activeStep = this._maxValue;
    }else {
      this._progressState.activeStep = this._progressState.activeStep + this._stepIncrement;
    }

    if(this._progressState.activeStep === this._maxValue && this.configs.removeOnComplete){
      this.removeProgressComponent();
    }else {
      // this.componentIsMounted().then((isMounted)=>{
       
      // });
      this.dispatchProgressEvent();
    }
  }
  getState(){
    const state = {
      _maxValue: this._maxValue,
      _numOfSteps: this._numOfSteps,
      _percentcomplete: this._percentcomplete,
      _progressState: this._progressState,
      _stepIncrement: this._stepIncrement,
      configs: this.configs,
    }
    return state;
  }
  startPageChangeListener() {
    let doLogic = false;
    //this is probably calling too many times
    //go in debug mode and put a break point on the active step in state getter, its called like 4 times a cycle
    const mutationObserverCallback = async (mutations, observer) =>{
      for (const mutation of mutations) {
        if(mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList.contains("page")){
          if(mutation.addedNodes[0].querySelector("form")){
            doLogic = true;
          break;
          }
        }
      }
      if(doLogic){
        await window.__customProgressBarMethods.createComponentArea();
        //dispatch progress event
        document.dispatchEvent(new Event("progressBarUpdate"));
      }
    }
    const observer = new MutationObserver(mutationObserverCallback);
    observer.observe(document.querySelector(".survey"), { childList:true});
  }
  removeProgressComponent(){
    this.parentElement.removeChild(this);
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
