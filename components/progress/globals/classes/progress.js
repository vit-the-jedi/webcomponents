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
    this._devMode = true
  }
  log(msg){
    if(this._devMode){
      console.log(msg);
    }
  }
  initState(configs){
    this.log("component initialized");
    this.configs = configs;
    this._progressState = {};
    this._progressState.activeStep = 0;
    this._progressState.steps = new Map();
    this.progressElement = null;
  }
  initFromLastKnownState(lastKnownState) {
    this.log("component initialized from last known state");
    this.log(lastKnownState)
    this.setConfigs(lastKnownState.configs);
    this._percentcomplete = lastKnownState._percentcomplete;
    this._numOfSteps = lastKnownState._numOfSteps;
    this._maxValue = lastKnownState._maxValue;
    this._stepIncrement = lastKnownState._stepIncrement;
    this._progressState = lastKnownState._progressState;
  }
  setConfigs(configs) {
    this.configs = configs;
  }
  getConfigs(property){
    return this.configs[property];
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
  setActiveStepInState(){
    if(this._progressState.activeStep + this._stepIncrement > this._maxValue){
      this._progressState.activeStep = this._maxValue;
    }else {
      this._progressState.activeStep = this._progressState.activeStep + this._stepIncrement;
    }

    if(this._progressState.activeStep === this._maxValue && this.configs.removeOnComplete){
      this.removeComponent();
    }else {
      this.updateComponent();
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
  registerEvents(){
    const component = this;
    document.addEventListener("componentCreated", function(ev, data){
      component.eventDispatcher(ev.type, data);
    });
    document.addEventListener("componentBeforeMount", function(ev, data){
      component.eventDispatcher(ev.type, data);
    });
    document.addEventListener("componentMounted", function(ev, data){
      component.eventDispatcher(ev.type, data);
    });
    document.addEventListener("componentUnmounted", function(ev, data){
      component.eventDispatcher(ev.type, data);
    });
    document.addEventListener("componentUpdate", function(ev, data){
      component.eventDispatcher(ev.type, data);
    });
  }
  updateComponent() {
    this._percentcomplete = Math.ceil(this.getActiveStepFromState());
    this.setAttribute("percentcomplete", Math.ceil(this._percentcomplete));
  }
  eventDispatcher(eventType){
    switch(eventType){
      case "componentCreated":
        //fire logic that needs to run AFTER component is created
        
        break;
        case "componentBeforeMount":
          //fire logic that needs to run before component begins mounting
          
        break;
        case "componentMounted":
          //fire logic that needs to run AFTER component is finished mounting
          this.createProgressBarComponent();
          this.createComponentArea().then(()=>{
            this._maxValue = Number(this.getAttribute("data-max"));
            this._numOfSteps = Number(this.getAttribute("data-steps"));
            this._stepIncrement = this._maxValue / this._numOfSteps;
            this.setActiveStepInState();
          });

          this.startPageChangeListener();
        break;
        case "componentUnmounted":
          //fire logic that needs to run AFTER component is unmounted
        break;
        case "componentUpdate":
          //fire logic on component updates
          if (this._percentcomplete < this._maxValue) {
            this.setActiveStepInState();
          }
          sessionStorage.setItem("custom-component__state", JSON.stringify(this.getState()));
          break;
          case "componentUnmounted":
          //fire logic on component updates
          this.createProgressBarComponent();
          break;
    }
  }
  createShadow(){
    const component = this;
    // Create a shadow root
    const shadow = component.attachShadow({ mode: "open" });

    const progressWrapper = document.createElement("div");
    progressWrapper.classList.add("progress-wrapper");

    const bar = document.createElement("div");
    bar.classList.add("progress-bar");
    bar.max = component.getAttribute("data-max");
    bar.value = component.getAttribute("data-value");
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
    document.dispatchEvent(new Event("componentBeforeMount"));
    document.body.appendChild(this);
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
        //dispatch progress event
        document.dispatchEvent(new Event("componentUpdate"));
      }
    }
    const observer = new MutationObserver(mutationObserverCallback);
    observer.observe(document.querySelector(".survey"), { childList:true});
  }
  removeComponent(){
    if(this && this.parentElement){
      this.parentElement.removeChild(this);
      document.dispatchEvent(new Event("componentUnmounted"));
    }
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
