"use strict";
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
    this._progressState = {};
    this._progressState.activeStep = 0;
    this._progressState.stepsRemaining = this._numOfSteps;
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
    this.registerEvents(this?.getConfigs("optionalEvents"));
    this._percentcomplete = lastKnownState._percentcomplete;
    this._numOfSteps = lastKnownState._numOfSteps;
    this._maxValue = lastKnownState._maxValue;
    this._stepIncrement = lastKnownState._stepIncrement;
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
  /**
  * sets the current active step in state. This method should be called to begin component update.
  * 
  * 
  * */
  setActiveStepInState() {
    const newActiveStep =
      this._progressState.activeStep + this._stepIncrement > this._maxValue
        ? this._maxValue
        : this._progressState.activeStep + this._stepIncrement;

    this._progressState.activeStep = newActiveStep;

    if (newActiveStep === this._maxValue && this.configs.removeOnComplete) {
      this.removeComponent();
    } else {
      //returns the largest of two numbers, either the new stepsRemaining value, or 0
      this._progressState.stepsRemaining = Math.max(
        this._progressState.stepsRemaining - 1,
        0
      );

      this.updateComponent();
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
  /**
   *
   * exposes lifecycle hooks for the component. This method then calls eventDispatcher to
   * facilitate logic for each custom event.
   * 
   * @param {Array} optionalEvents  - array of strings representing custom events we want to listen for.
   * Example: componentManualProgressStepUpdate is optional behavior, so pass that event in so we know to listener for it.
   * 
   *
   * @customEvents Each event listener can receive and pass custom data appended to the event.
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
  registerEvents(optionalEvents = null) {
    const component = this;
    if (Object.keys(this._listeners).length === 0) {
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
        window.top._customComponentProps = {};
        window.top._customComponentProps.element = component;
        window.top._customComponentProps.anchor =
          component.getConfigs("anchorPoint");
        component.eventDispatcher(ev.type, data);
      });
      document.addEventListener("componentUnmounted", function (ev, data) {
        component._listeners.unmounted = true;
        component.eventDispatcher(ev.type, data);
      });
      //for dealing with dynamic steps
      document.addEventListener(
        "componentStepValueChange",
        function (ev, data) {
          component._listeners.stepValueChange = true;
          component.eventDispatcher(ev.type, ev);
        }
      );
      if (optionalEvents) {
        for (const eventName of optionalEvents) {
          document.addEventListener(eventName, function (ev, data) {
            component._listeners[eventName] = true;
            component.eventDispatcher(ev.type, ev);
          });
        }
      }
    }
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
        this.getComponentAnchorPoint().then(() => {
          // Set initial values to state
          this._maxValue = Number(this.getAttribute("data-max"));
          this._numOfSteps = Number(this.getAttribute("data-steps"));
          this._progressState.stepsRemaining = this._numOfSteps;

          if (this.configs.type === "steps") {
            this._stepIncrement = 1;
            this.setActiveStepInState(1);
          } else {
            this._stepIncrement = this._maxValue / this._numOfSteps;
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
        let stepChange = data.addedSteps
          ? data.addedSteps
          : data.removedSteps * -1;

        const newStepAmount = Math.max(
          this._progressState.stepsRemaining + 1 + stepChange,
          0
        );

        if (newStepAmount === 0) {
          this._progressState.stepsRemaining = 0;
          this._stepIncrement = this._maxValue / this._numOfSteps;
          this._progressState.activeStep = this._maxValue;
          this._percentcomplete = this._maxValue;
        } else {
          this._numOfSteps = newStepAmount;
          this._progressState.stepsRemaining = newStepAmount;
          this._stepIncrement = this._maxValue / newStepAmount;
          this._progressState.activeStep =
            this._maxValue -
            this._progressState.stepsRemaining * this._stepIncrement;
          this._percentcomplete = this._progressState.activeStep;
        }

        this.setActiveStepInState();
        this.saveState();
        break;
      case "componentManualProgressStepUpdate":
        this.log("manual component update fired.");
        this.setActiveStepInState();
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
