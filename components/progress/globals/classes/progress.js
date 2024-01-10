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
    this._progressState.steps = new Map();
    this.progressElement = null;
  }
  initFromLastKnownState(lastKnownState) {
    this.log("component initialized from last known state");
    this.log(lastKnownState);
    this.registerEvents();
    this.setConfigs(lastKnownState.configs);
    this._percentcomplete = lastKnownState._percentcomplete;
    this._numOfSteps = lastKnownState._numOfSteps;
    this._maxValue = lastKnownState._maxValue;
    this._stepIncrement = lastKnownState._stepIncrement;
    this._progressState = lastKnownState._progressState;
    this.shadow.prepend(this.createGlobalStyles());
    this.shadow.prepend(this.createStyles());
    this.setActiveStepInState();
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
    this.log(this._progressState.activeStep);
    if (
      this._progressState.activeStep === this._maxValue &&
      this.configs.removeOnComplete
    ) {
      this.removeComponent();
    } else {
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
      configs: this.configs,
    };
    return state;
  }
  registerEvents() {
    const component = this;
    document.addEventListener("componentCreated", function (ev, data) {
      component.eventDispatcher(ev.type, data);
    });
    document.addEventListener("componentBeforeMount", function (ev, data) {
      component.eventDispatcher(ev.type, data);
    });
    document.addEventListener("componentMounted", function (ev, data) {
      component.eventDispatcher(ev.type, data);
    });
    document.addEventListener("componentUnmounted", function (ev, data) {
      component.eventDispatcher(ev.type, data);
    });
    //experimental - for dealing with dynamic steps
    document.addEventListener("componentStepValueChange", function (ev, data) {
      component.eventDispatcher(ev.type, ev.addedSteps);
    });
  }
  updateComponent() {
    this._percentcomplete = Math.ceil(this.getActiveStepFromState());
    this.setAttribute("percentcomplete", Math.ceil(this._percentcomplete));
  }
  eventDispatcher(eventType, data) {
    switch (eventType) {
      case "componentMounted":
        //fire logic that needs to run AFTER component is finished mounting
        this.createComponentArea().then(() => {
          this._maxValue = Number(this.getAttribute("data-max"));
          this._numOfSteps = Number(this.getAttribute("data-steps"));
          this._stepIncrement = this._maxValue / this._numOfSteps;
          this.setActiveStepInState();
        });
        break;
      case "componentUnmounted":
        //fire logic on component updates
        const currentState = this.getState();
        if (currentState._progressState) {
          sessionStorage.setItem(
            "custom-component__state",
            JSON.stringify(currentState)
          );
        }
        break;
      //havent tested this yet
      //hoping that updating the value in state is enough
      //need to send the event and the data
      case "componentStepValueChange":
        this._numOfSteps = this._numOfSteps + data;
        this._stepIncrement = this._maxValue / this._numOfSteps;
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
