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
    this._devMode = true;
    this._listeners = {};
  }
  log(msg) {
    if (this._devMode) {
      console.log(msg);
    }
  }
  initState(configs) {
    this.log("component initialized");
    this.configs = configs;
    this._progressState = {};
    this._progressState.activeStep = 0;
    this._progressState.stepsRemaining = 0;
    this._progressState.steps = new Map();
    this.progressElement = null;
  }
  initFromLastKnownState(lastKnownState) {
    this.log("component initialized from last known state");
    this.registerEvents();
    this.setConfigs(lastKnownState.configs);
    this._percentcomplete = lastKnownState._percentcomplete;
    this._numOfSteps = lastKnownState._numOfSteps;
    this._maxValue = lastKnownState._maxValue;
    this._stepIncrement = lastKnownState._stepIncrement;
    this._progressState.activeStep = lastKnownState._progressState.activeStep;
    this._progressState.stepsRemaining = lastKnownState._progressState.stepsRemaining;
    if(!this.shadowRoot.querySelector("style")){
      this.shadow.prepend(this.createGlobalStyles());
      this.shadow.prepend(this.createStyles());
    }
    this.setActiveStepInState(this._progressState.activeStep);
  }
  setConfigs(configs) {
    this.configs = configs;
  }
  getConfigs(property) {
    return this.configs[property];
  }
  setStepToList(stepIndex, step) {
    this._progressState.steps.set(stepIndex, step);
  }
  getStepFromList(stepIndex) {
    return this._progressState.steps.get(stepIndex);
  }
  getStepsListFromState() {
    return this._progressState.steps;
  }
  getActiveStepFromState() {
    return this._progressState.activeStep;
  }
  setActiveStepInState() {
    if (this._progressState.activeStep + this._stepIncrement > this._maxValue) {
      this._progressState.activeStep = this._maxValue;
    } else {
      this._progressState.activeStep =
        this._progressState.activeStep + this._stepIncrement;
    }
    if (
      this._progressState.activeStep === this._maxValue &&
      this.configs.removeOnComplete
    ) {
      this.removeComponent();
    } else {
      this._progressState.stepsRemaining = this._progressState.stepsRemaining - 1;
      this.updateComponent();
    }
  }
  getState() {
    const state = {
      _maxValue: this._maxValue,
      _numOfSteps: this._numOfSteps,
      _percentcomplete: this._percentcomplete,
      _progressState: this._progressState,
      _stepIncrement: this._stepIncrement,
      _listeners: this._listeners,
      configs: this.configs,
    };
    return state;
  }
  saveState(){
    const currentState = this.getState();
    if (currentState._progressState) {
      sessionStorage.setItem(
        "custom-component__state",
        JSON.stringify(currentState)
      );
    }
  }
  /** 
   * @function
   * @description exposes lifecycle hooks for the component. This method then calls eventDispatcher to 
   * facilitate logic for each custom event.
   * 
   * Each event listener can receive and pass custom data appended to the event.
   * 
   * @customEvents 
   * 
   * "componentCreated" - hook for after the constructor has finished building the shadow DOM.
   * 
   * "componentBeforeMount" - hook for after component has been added to the DOM, but before the progress bar has been mounted to the component. Invoked inside component's built-in connectedCallback method.
   * 
   * "componentMounted" - hook for after progress bar has been mounted to the component.
   * 
   * "componentUnmounted" - hook for after component has been removed from the DOM. Invoked inside components' built-in disconnectedCallback method.
   * 
   * "componentStepValueChange" - hook for use outside of the component to deal with dynamic survey paths. If a user input adds / removes pages from the path, this event must be called and the hook must be used to update the component to reflect the new amount of pages.
   * 
  */
  registerEvents() {
    const component = this;
    if(Object.keys(this._listeners).length === 0){
      document.addEventListener("componentCreated", function (ev, data) {
        component._listeners.created = true;
        component.eventDispatcher(ev.type, data);
      });
      document.addEventListener("componentBeforeMount", function (ev, data) {
        component._listeners.beforeMount = true;
        component.eventDispatcher(ev.type, data);
      });
      document.addEventListener("componentMounted", function (ev, data) {
        component._listeners.mounted = true;
        component.eventDispatcher(ev.type, data);
      });
      document.addEventListener("componentUnmounted", function (ev, data) {
        component._listeners.unmounted = true;
        component.eventDispatcher(ev.type, data);
      });
      //for dealing with dynamic steps
      document.addEventListener("componentStepValueChange", function (ev, data) {
        component._listeners.stepValueChange = true;
        component.eventDispatcher(ev.type, ev);
      });
    }
  }
  isProgressStepsComponent() {
    return this._progressState.steps.size ? true : false;
  }
  updateComponent() {
    this._percentcomplete = Math.ceil(this.getActiveStepFromState());
    this.setAttribute("percentcomplete", Math.ceil(this._percentcomplete));
    this.log(this.getState());
  }
  /**
   * 
   * @param {String} eventType the type of custom event we received from the event listeners in registerEvents
   * @param {Object} data custom data we can append to the event object
   */
  eventDispatcher(eventType, data) {
    switch (eventType) {
      case "componentMounted":
      //anchor the component to the anchorPoint provided
        this.createComponentArea().then(() => {
          //set initial values to state
          this._maxValue = Number(this.getAttribute("data-max"));
          this._numOfSteps = Number(this.getAttribute("data-steps"));
          this._progressState.stepsRemaining = this._numOfSteps;
          if (this.isProgressStepsComponent()){
            this._stepIncrement = 1;
          }else {
            this._stepIncrement = this._maxValue / this._numOfSteps;
          }
          if (this.isProgressStepsComponent()) {
            this.setActiveStepInState(1);
          } else {
            this.setActiveStepInState();
          }
        });
        break;
      case "componentUnmounted":
        //save our state to sessionStorage so we can initilize to the current state once mounted again
        this.saveState();
        break;
      case "componentStepValueChange":
        this.log("step value update received");
        let stepChange;
        //check if we want to add or subtract steps
        if(data.addedSteps){
          stepChange = data.addedSteps;
        }else {
          stepChange = data.removedSteps * -1;
        }
        //reset our state values to reflect the new number of steps
        this._numOfSteps = this._progressState.stepsRemaining + stepChange;
        this._progressState.stepsRemaining = this._numOfSteps;
        this._stepIncrement = this._maxValue / this._numOfSteps;
        this._progressState.activeStep = this._maxValue - this._progressState.stepsRemaining * this._stepIncrement;
        this._percentcomplete = this._progressState.activeStep;
        //commit the new step to state + update the component
        this.setActiveStepInState();
        this.log(this.getState());
        this.saveState();
        break;
    }
  }
  removeComponent() {
    if (this && this.parentElement) {
      this.parentElement.removeChild(this);
      document.dispatchEvent(new Event("componentUnmounted"));
    }
  }
  createGlobalStyles() {
    const globalStyles = `
        .progress-wrapper {
            transition-property: all;
            transition-duration: ${
              this.getConfigs("transitionDuration") / 1000
            }s;
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
