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
  set percentcomplete(value) {
    this._progressState.percentcomplete = value;
  }
  get percentcomplete() {
    return this._progressState.percentcomplete;
  }
  set setStepsRemaining(value) {
    this._progressState.stepsRemaining = value;
  }
  get getStepsRemaining() {
    return this._progressState.stepsRemaining;
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
  startPageChangeListener = (el) => {
    if (!this.getProgressState.pageObserverAdded) {
      const mutationObserverCallback = (mutations, observer) => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList.contains("page")) {
            const pageId = mutation.addedNodes[0].id.slice(2);
            if (!Impressure.context.getState().pages[pageId].name.toLowerCase().includes("integration")) {
              window.initProgressComponent(this.configs);
              break;
            }
          }
        }
      };
      const observer = new MutationObserver(mutationObserverCallback);
      observer.observe(document.querySelector(".survey"), { childList: true });
      this.getProgressState.pageObserverAdded = true;
    }
  };
  isImpressureEmbedded() {
    return window.top.Impressure ? true : false;
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
    eventObserver.createComponentCreationEventLoop(additionalEvents);
    //run the create event queue
    eventObserver.dispatchEvents("create", this);
    if (this.isImpressureEmbedded()) {
      this.startPageChangeListener();
    }
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
    let newActiveStep;
    const state = this.getProgressState;
    //don't change active step if we are paused
    //add small increment to progress instead of nothing
    if (state?.pause && state?.pause !== 0) {
      newActiveStep = Number((state.activeStep + state.stepIncrement / state.stepChange).toFixed(2));
    } else {
      newActiveStep =
        state.activeStep + state.stepIncrement > state.maxValue
          ? state.maxValue
          : state.activeStep + state.stepIncrement;
    }
    state.activeStep = newActiveStep;
  }
  setStepsRemainingInState() {
    //update steps remaining here, need to get back in line with actual flow progress
    this.setStepsRemaining = Math.max(this.getStepsRemaining - 1, 0);
  }
  updateComponent(activeStep) {
    this.percentcomplete = activeStep;
    this.setAttribute("percentcomplete", activeStep);
  }
  checkIfComplete() {
    const state = this.getProgressState;
    if (Math.round(state.activeStep) === state.maxValue) {
      this.deleteState();
      if (this.configs?.removeOnComplete) {
        eventObserver.dispatchEvents("destroy", this);
      }
      return true;
    }
    return false;
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
  deleteState() {
    sessionStorage.removeItem("custom-component__state");
  }
  removeKeysFromState(keysArr) {
    for (const key of keysArr) {
      delete this.getProgressState[key];
    }
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
