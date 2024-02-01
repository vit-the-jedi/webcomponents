"use strict";
import { StateObserver, EventObserver } from "./observers.js";
const eventObserver = new EventObserver();
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
    this._configs = {};
    this._devMode = true;
    this.addObserver(new StateObserver(), "state");
    this.addObserver(eventObserver, "event");
  }
  set setProgressState(state) {
    this.log(`setting progress state`);
    this.log(state);
    this._progressState = state;
  }
  get getProgressState() {
    return this._progressState;
  }
  get percentcomplete() {
    return this._progressState.percentcomplete;
  }
  set configs(configs) {
    this._configs = configs;
  }
  get configs() {
    return this._configs;
  }
  get componentType() {
    const configs = this.configs;
    return configs.type;
  }
  set impressurePageId(id) {
    this.impressurePageHistory.push(id);
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
  /**
   * method that logs messages to the console if configs._devMode is true
   * */
  log(msg) {
    if (this._devMode) {
      console.log(msg);
    }
  }
  isImpressureEmbedded() {
    return window.top.Impressure;
  }
  pushImpressurePageId() {}
  /**
   * method that initializes component during it's first mount. Sets defaults for first page load.
   *
   * */
  async initState(configs) {
    let additionalEvents = null;
    if (Object.keys(eventObserver.getEventListeners).length > 0) {
      for (const key of Object.keys(eventObserver.getEventListeners)) {
        additionalEvents = [];
        additionalEvents.push(key);
      }
    }
    eventObserver.createComponentCreationEventLoop(this, additionalEvents);
    eventObserver.createComponentDestructionEventLoop(this);
    //detect impressure
    if (this.isImpressureEmbedded()) {
      this.impressurePageHistory = [];
    }
    this.configs = configs;
    const savedState = JSON.parse(sessionStorage.getItem("custom-component__state"));
    if (savedState) {
      //do stuff with state
      this.setProgressState = savedState._progressState;
      this.configs = savedState._configs;
    } else {
      const numOfSteps = this.configs.steps;
      const componentType = this.configs.type;
      const max = this.configs.max;
      const stepIncrement = Number((componentType === "steps" ? 1 : max / numOfSteps).toFixed(2));
      this.setProgressState = {
        activeStep: 0,
        numOfSteps: numOfSteps,
        stepIncrement: stepIncrement,
        steps: new Map(),
        percentcomplete: 0,
        maxValue: max,
        stepsRemaining: numOfSteps,
      };
    }
    // eventObserver.checkForEvents().then((newEventsAdded) => {
    //   console.log(newEventsAdded);
    //   if (newEventsAdded) {
    //     //do something with events that were added
    //     this.interceptEventLoop(this[arg1], "create", this["componentStepValueChange"]).then((updatedEventQueue) => {
    //       console.log(updatedEventQueue);
    //     });
    //     const evKey = Object.keys(this.eventListeners)[0];
    //     delete this.eventListeners[evKey];
    //   }
    eventObserver.dispatchEvents("create", this);
    //});
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
  /**
   * sets the current active step in state. This method should be called to begin component update.
   *
   *
   * */
  setActiveStepInState() {
    //the following logic is an 11pm solution to steps being added to the flow
    //instead of reducing progress, we simply stall it for a few steps, then resume
    //im sure there's a better way to do this using the built-in hooks, but that's for tomorrow.
    const newPauseValue = Math.max(this._progressState.pause - 1, 0);
    let newActiveStep;
    if (this._progressState.pause) {
      newPauseValue === 0 ? 0 : newPauseValue;
      this._progressState.pause = newPauseValue;
      if (newPauseValue === 0) {
        delete this._progressState.pause;
      }
    }
    //end of hacky logic
    else {
      newActiveStep =
        this._progressState.activeStep + this._progressState.stepIncrement > this._progressState.maxValue
          ? this._progressState.maxValue
          : this._progressState.activeStep + this._progressState.stepIncrement;
      this._progressState.activeStep = newActiveStep;
    }
  }
  updateComponent(activeStep) {
    this._progressState.percentcomplete = activeStep;
    this.setAttribute("percentcomplete", activeStep);
  }
  mountComponent() {
    return new Promise((resolve) => {
      this.getAnchorPoint(this.configs.anchorPoint)
        .then((anchorPoint) => {
          anchorPoint.parentElement.insertBefore(this, anchorPoint.nextElementSibling);
        })
        .then(() => {
          resolve();
        });
    });
  }
  unmountComponent() {
    if (this && this.parentElement) {
      this.parentElement.removeChild(this);
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
    return {
      _progressState: this.getProgressState,
      _listeners: this._listeners,
      _configs: this.configs,
    };
  }
  /**
   * @function
   * @description saves the current state of the component to session storage. This is necessary for use within Impressure, as the component is dynamically mounted to each page within the survey.
   */
  saveState() {
    sessionStorage.setItem("custom-component__state", JSON.stringify(this.getState()));
  }
  createGlobalStyles() {
    const globalStyles = `
        .progress-wrapper {
            transition-property: all;
            transition-duration: ${this.configs.transitionDuration / 1000}s;
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
