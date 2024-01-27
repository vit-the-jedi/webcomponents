"use strict";
import { StateObserver, EventObserver } from "./observers.js";
// const EventHandler = new ProgressEventDispatcher();
/**
 * General class to extend for all progress elements.
 * This class primarily handles
 * - getting and setting component state.
 * - registering event listeners for our custom events.
 * - development logging
 */
class Progress extends HTMLElement {
  constructor() {
    super();
    this._listeners = {};
    this.observers = {};
    this._progressState = {};
    this.addObserver(new StateObserver(), "state");
    this.addObserver(new EventObserver(), "event");
  }
  /**
   * Observer methods
   */
  addObserver(observer, type) {
    //check if we have created an array of this type yet
    if (!this.observers[type]) {
      this.observers[type] = [];
    }
    this.observers[type].push(observer);
  }
  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
  notifyStateUpdate(data) {
    this.observers["state"].forEach(async (observer) => observer.update(data, this));
  }
  addEventToQueue(ev){
    this.observers["event"][0].addEvent(ev, this)    
    if(ev === "componentMounted"){
      this.observers["event"][0].dispatchEvents(this);
    }
  }
  /**
   * method that logs messages to the console if configs._devMode is true
   * */
  log(msg) {
    if (this._devMode) {
      console.log(msg);
    }
  }
  /**
   * method that initializes component during it's first mount. Sets defaults for first page load.
   *
   * */
  initState(configs) {
    this.log("component initialized");
    this.configs = configs;
    if (configs._devMode) {
      this._devMode = true;
      delete configs._devMode;
    }
    this._progressState.activeStep = 0;
    this._progressState.stepsRemaining = this._progressState.numOfSteps;
    this._progressState.steps = new Map();
    this.progressElement = null;
  }
  /**
   * method that initializes component AFTER first mount. This method utilizes the saved state in sessionStorage to re-initialize the component with the last known state.
   * This method should only be called AFTER the first lifecycle of the component.
   *
   * */
  initFromLastKnownState(lastKnownState) {
    this.log("component initialized from last known state");
    this.setConfigs(lastKnownState.configs);
    this._progressState.percentcomplete =
      lastKnownState._progressState.percentcomplete;
    this._progressState.numOfSteps = lastKnownState._progressState.numOfSteps;
    this._progressState.maxValue = lastKnownState._progressState.maxValue;
    this._progressState.stepIncrement =
      lastKnownState._progressState.stepIncrement;
    this._progressState.activeStep = lastKnownState._progressState.activeStep;
    this._progressState.stepsRemaining =
      lastKnownState._progressState.stepsRemaining;
    //if progress steps component, using manual updates feature, and the component has been removed at least once (we are not in first initialization on page load), do not update the component
    if (
      this.configs.type === "steps" &&
      this.getConfigs("manualUpdate") &&
      this._listeners.unmounted
    ) {
      return;
    } else {
      this.setActiveStepInState();
    }
  }
  setConfigs(configs) {
    this.configs = configs;
  }
  getConfigs(property) {
    return this.configs[property];
  }
  // setStepToList(stepIndex, step) {
  //   this._progressState.steps.set(stepIndex, step);
  // }
  // getStepFromList(stepIndex) {
  //   return this._progressState.steps.get(stepIndex);
  // }
  // getStepsListFromState() {
  //   return this._progressState.steps;
  // }
  /**
   * sets the current active step in state. This method should be called to begin component update.
   *
   *
   * */
  setActiveStepInState() {
    const newActiveStep =
      this._progressState.activeStep + this._progressState.stepIncrement >
      this._progressState.maxValue
        ? this._progressState.maxValue
        : this._progressState.activeStep + this._progressState.stepIncrement;

    this._progressState.activeStep = newActiveStep;
    this.notifyStateUpdate(this._progressState);
  }
  updateComponent(activeStep) {
    this._progressState.percentcomplete = activeStep;
    this.setAttribute("percentcomplete", activeStep);
  }
  removeComponent() {
    if (this && this.parentElement) {
      this.parentElement.removeChild(this);
      this.addEventToQueue("componentUnmounted");
    }
  }
  /**
   * gets the current state of the component.
   *
   * @returns {Object} state: an object containing all relevant state properties.
   * @returns {number} state._maxValue:  represents the max value of the component
   * @returns {number} state._numOfSteps: represents the number of steps in the flow
   * @returns {number} state._percentcomplete: represents the value of completed steps
   * @returns {Object} state._progressState: contains info about active and remaining steps
   * @returns {number} state._progressState.activeStep: the current step the component is on
   * @returns {Object} state._progressState.stepsRemaining: amount of steps left in the flow
   * @returns {Map} state._progressState.steps: a map of all the steps in a progress-step component, empty if using the progress bar.
   * @returns {Object} state._listeners: a log of all custom event listeners that have been fired on the current component lifecycle.
   * @returns {Object} state.configs: the user defined configs for styling, component type, dev mode, anchor point, etc.
   */
  getState() {
    const state = {
      _progressState: {
        maxValue: this._progressState.maxValue,
        numOfSteps: this._progressState.numOfSteps,
        percentcomplete: this._progressState.percentcomplete,
        stepIncrement: this._progressState.stepIncrement,
      },
      _listeners: this._listeners,
      configs: this.configs,
    };
    return state;
  }
  /**
   * @function
   * @description saves the current state of the component to session storage. This is necessary for use within Impressure, as the component is dynamically mounted to each page within the survey.
   */
  saveState() {
    const currentState = this.getState();
    if (currentState._progressState) {
      sessionStorage.setItem(
        "custom-component__state",
        JSON.stringify(currentState)
      );
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
