(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class Progress extends HTMLElement {
  constructor() {
    super();
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
    if (configs._devMode) {
      this._devMode = true;
      delete configs._devMode;
    }
    this._progressState = {};
    this._progressState.activeStep = 0;
    this._progressState.stepsRemaining = this._numOfSteps;
    this._progressState.steps = /* @__PURE__ */ new Map();
    this.progressElement = null;
  }
  initFromLastKnownState(lastKnownState) {
    this.log("component initialized from last known state");
    this.setConfigs(lastKnownState.configs);
    this.registerEvents(this == null ? void 0 : this.getConfigs("optionalEvents"));
    this._percentcomplete = lastKnownState._percentcomplete;
    this._numOfSteps = lastKnownState._numOfSteps;
    this._maxValue = lastKnownState._maxValue;
    this._stepIncrement = lastKnownState._stepIncrement;
    this._progressState.activeStep = lastKnownState._progressState.activeStep;
    this._progressState.stepsRemaining = lastKnownState._progressState.stepsRemaining;
    if (!this.shadowRoot.querySelector("style")) {
      this.shadow.prepend(this.createGlobalStyles());
      this.shadow.prepend(this.createStyles());
    }
    if (this.isProgressStepsComponent() && this.getConfigs("manualUpdate") && this._listeners.unmounted) {
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
  setActiveStepInState() {
    if (this._progressState.activeStep + this._stepIncrement > this._maxValue) {
      this._progressState.activeStep = this._maxValue;
    } else {
      this._progressState.activeStep = this._progressState.activeStep + this._stepIncrement;
    }
    if (this._progressState.activeStep === this._maxValue && this.configs.removeOnComplete) {
      this.removeComponent();
    } else {
      this._progressState.stepsRemaining = this._progressState.stepsRemaining - 1 <= 0 ? 0 : this._progressState.stepsRemaining - 1;
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
      configs: this.configs
    };
    return state;
  }
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
  registerEvents(optionalEvents = null) {
    const component = this;
    if (Object.keys(this._listeners).length === 0) {
      document.addEventListener("componentCreated", function(ev, data) {
        component._listeners.created = true;
        component.eventDispatcher(ev.type, data);
      });
      document.addEventListener("componentBeforeMount", function(ev, data) {
        component._listeners.beforeMount = true;
        component.eventDispatcher(ev.type, data);
      });
      document.addEventListener("componentMounted", function(ev, data) {
        component._listeners.mounted = true;
        component.eventDispatcher(ev.type, data);
      });
      document.addEventListener("componentUnmounted", function(ev, data) {
        component._listeners.unmounted = true;
        component.eventDispatcher(ev.type, data);
      });
      document.addEventListener(
        "componentStepValueChange",
        function(ev, data) {
          component._listeners.stepValueChange = true;
          component.eventDispatcher(ev.type, ev);
        }
      );
      if (optionalEvents) {
        for (const eventName of optionalEvents) {
          document.addEventListener(eventName, function(ev, data) {
            component._listeners[eventName] = true;
            component.eventDispatcher(ev.type, ev);
          });
        }
      }
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
        this.createComponentArea().then(() => {
          this._maxValue = Number(this.getAttribute("data-max"));
          this._numOfSteps = Number(this.getAttribute("data-steps"));
          this._progressState.stepsRemaining = this._numOfSteps;
          if (this.isProgressStepsComponent()) {
            this._stepIncrement = 1;
          } else {
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
        this.saveState();
        break;
      case "componentStepValueChange":
        this.log("step value update received");
        let stepChange;
        if (data.addedSteps) {
          stepChange = data.addedSteps;
        } else {
          stepChange = data.removedSteps * -1;
        }
        const newStepAmount = this._progressState.stepsRemaining + stepChange;
        if (newStepAmount <= 0) {
          this._progressState.stepsRemaining = 0;
          this._stepIncrement = this._maxValue / this._numOfSteps;
          this._progressState.activeStep = this._maxValue;
          this._percentcomplete = this._maxValue;
        } else {
          this._numOfSteps = newStepAmount;
          this._progressState.stepsRemaining = this._numOfSteps;
          this._stepIncrement = this._maxValue / this._numOfSteps;
          this._progressState.activeStep = this._maxValue - this._progressState.stepsRemaining * this._stepIncrement;
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
            transition-duration: ${this.getConfigs("transitionDuration") / 1e3}s;
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
class ProgressBar extends Progress {
  constructor() {
    super();
    this.classList.add("component-positioned");
    const shadow = this.attachShadow({ mode: "open" });
    const progressWrapper = document.createElement("div");
    progressWrapper.classList.add("progress-wrapper");
    const bar = document.createElement("div");
    bar.classList.add("progress-bar");
    bar.max = this.getAttribute("data-max");
    bar.value = this.getAttribute("data-value");
    bar.id = "progress-bar-component";
    const barInner = document.createElement("div");
    barInner.classList.add("progress-bar-inner");
    barInner.style.width = `0%`;
    bar.appendChild(barInner);
    progressWrapper.appendChild(bar);
    shadow.appendChild(progressWrapper);
    this.shadow = shadow;
    document.dispatchEvent(new Event("componentCreated"));
  }
  static get observedAttributes() {
    return ["percentcomplete"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    const shadowRoot = this.shadowRoot;
    const shadowRootChildren = [...shadowRoot.children];
    let innerBarParent = shadowRootChildren.filter((child) => {
      if (child.classList.contains("progress-wrapper")) {
        return child.querySelector(".progress-bar-inner");
      }
    });
    innerBarParent = innerBarParent[0];
    const innerBar = innerBarParent.querySelector(".progress-bar-inner");
    const activeStepFromState = this._percentcomplete;
    if (name === "percentcomplete") {
      this._percentcomplete = activeStepFromState;
      setTimeout(() => {
        innerBar.style.width = activeStepFromState + "%";
      }, 250);
    }
  }
  get percentcomplete() {
    return this._percentcomplete;
  }
  set percentcomplete(val) {
    if (this._percentcomplete <= this._maxValue) {
      this.setAttribute("percentcomplete", val);
    }
  }
  createStyles() {
    const styles = `
    .progress-wrapper {
      overflow: hidden;
      margin: 2em auto;
    }
    .progress-bar {
      width: 99%;
      height: ${this.getConfigs("height")}px;
      background-color: ${this.getConfigs("secondColor") || "#F5F8F7"};
      border-radius: 10px;
      border: 1px solid #efefef;
      margin: auto;
      display:block;
    }
    .progress-bar-inner {
      height: 100%;
      line-height: 30px;
      background: ${this.getConfigs("mainColor") || "#66c296 "};
      text-align: center;
      transition: width 0.15s;
      border-radius: 10px;
    }`;
    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    return styleElement;
  }
  getAnchorPoint(configAnchorPoint) {
    return new Promise((resolve, reject) => {
      function checkElement() {
        const element = document.querySelector(configAnchorPoint);
        if (element) {
          clearInterval(intervalId);
          resolve(element);
        }
      }
      const intervalId = setInterval(checkElement, 50);
    });
  }
  createComponentArea() {
    return new Promise(async (resolve, reject) => {
      this._anchorPoint = await this.getAnchorPoint(
        this.getConfigs("anchorPoint")
      );
      resolve();
    });
  }
  init(configs, callback) {
    callback(configs);
    this.getAnchorPoint(this.getConfigs("anchorPoint")).then((anchorPoint) => {
      anchorPoint.parentElement.insertBefore(
        this,
        anchorPoint.nextElementSibling
      );
    });
  }
  createProgressBarComponent() {
    const progDiv = document.createElement("div");
    progDiv.classList.add("progress-container");
    this.setAttribute("data-max", "100");
    this.setAttribute("data-steps", this.getConfigs("steps"));
    this.shadow.prepend(this.createGlobalStyles());
    this.shadow.prepend(this.createStyles());
    document.dispatchEvent(new Event("componentMounted"));
  }
  connectedCallback() {
    document.dispatchEvent(new Event("componentBeforeMount"));
    this.log("component connected");
    const savedState = JSON.parse(
      sessionStorage.getItem("custom-component__state")
    );
    if (savedState) {
      savedState.updated = false;
      savedState._progressState.activeStep = savedState._progressState.activeStep + 1;
      savedState._percentcomplete = savedState._percentcomplete + savedState._stepIncrement;
      this.initFromLastKnownState(savedState);
    } else {
      this.registerEvents();
      this.createProgressBarComponent();
    }
  }
  disconnectedCallback() {
    this.log("component disconnected");
    document.dispatchEvent(new Event("componentUnmounted"));
  }
}
customElements.define("progress-bar", ProgressBar);
class ProgressSteps extends Progress {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    this.shadow = shadow;
    const progDiv = document.createElement("div");
    progDiv.classList.add("progress-container");
    const progressWrapper = document.createElement("div");
    progressWrapper.classList.add("progress-wrapper");
    const stepList = document.createElement("ul");
    progressWrapper.appendChild(stepList);
    this.shadow.appendChild(progressWrapper);
  }
  static get observedAttributes() {
    return ["percentcomplete"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    const shadowRoot = this.shadowRoot;
    const stepProgressWrapper = shadowRoot.querySelector(".progress-wrapper");
    stepProgressWrapper.classList.add("updating");
    setTimeout(() => {
      var _a;
      stepProgressWrapper.classList.remove("updating");
      (_a = shadowRoot.querySelector(".active")) == null ? void 0 : _a.classList.remove("active");
      const stepToActivate = this.getStepFromList(this.getActiveStepFromState());
      if (stepToActivate) {
        stepToActivate.classList.add("active");
      } else {
        this.getStepFromList(1).classList.add("active");
      }
    }, this.getConfigs("transitionDuration"));
  }
  get percentcomplete() {
    return this._percentcomplete;
  }
  set percentcomplete(val) {
    if (this._percentcomplete <= this._maxValue) {
      this.setAttribute("percentcomplete", val);
    }
  }
  createStyles() {
    const styles = `
    .progress-wrapper {
      container-type: inline-size;
    }
    @container (max-width: 767px) {
      .progress-wrapper ul{
        flex-wrap: wrap; 
      }
      .progress-wrapper li{
        flex-basis: calc(100%/${this.getStepsListFromState().size > 4 ? this.getStepsListFromState().size / 2 : this.getStepsListFromState().size}); 
      }
    }
    ul {
        display:flex; 
        flex-wrap: nowrap; 
        align-content: space-between;
        margin: 0;
        padding: 0;
    }
    li {
      list-style-type:none;
      text-align:center;
      font-family: ${this.getConfigs("font")};
      flex-basis: calc(100%/${this.getStepsListFromState().size}); 
      position:relative;
      display:flex;
      flex-direction: column;
      justify-content: space-between;
      opacity: 0.5;
      min-height: 50px;
      padding-bottom: 1em;
      font-size: 85%;
    }
    li::before{
      display:block;
      width: 12px;
      height: 12px;
      border-radius: 100%;
      background: ${this.getConfigs("mainColor") || "black"};
      content: '';
      display:flex;
      align-self:center;
    }
    .active {
        opacity: 1;
      }
   `;
    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    return styleElement;
  }
  getAnchorPoint(configAnchorPoint) {
    return new Promise((resolve, reject) => {
      function checkElement() {
        const element = document.querySelector(configAnchorPoint);
        if (element) {
          clearInterval(intervalId);
          resolve(element);
        }
      }
      const intervalId = setInterval(checkElement, 50);
    });
  }
  createComponentArea() {
    return new Promise(async (resolve, reject) => {
      this._anchorPoint = await this.getAnchorPoint(
        this.getConfigs("anchorPoint")
      );
      resolve();
    });
  }
  init(configs, callback) {
    callback(configs);
    this.getAnchorPoint(this.getConfigs("anchorPoint")).then((anchorPoint) => {
      anchorPoint.parentElement.insertBefore(
        this,
        anchorPoint.nextElementSibling
      );
    });
  }
  createProgressStepsComponent() {
    this.createProgressStepsComponentInner();
    this.shadow.prepend(this.createGlobalStyles());
    this.shadow.prepend(this.createStyles());
    document.dispatchEvent(new Event("componentMounted"));
  }
  createProgressStepsComponentInner() {
    this.setAttribute("data-max", this.getConfigs("steps"));
    this.setAttribute("data-steps", this.getConfigs("steps"));
    this.getStepsAndSetToStateList();
  }
  getStepsAndSetToStateList() {
    return new Promise((resolve) => {
      const steps = Number(this.getConfigs("steps"));
      const stepList = this.shadow.querySelector("ul");
      const stepElements = this.shadow.querySelectorAll("li");
      if (stepElements.length > 0) {
        stepElements.forEach((el, i, arr) => this.setStepToList(i + 1, el));
      } else {
        for (let i = 1; i <= steps; i++) {
          const stepNode = document.createElement("li");
          stepNode.textContent = `${this.getConfigs("stepLabels")[i]}`;
          stepNode.id = `step-${i}`;
          stepNode.classList.add(`progress-step-${i}`);
          stepList.appendChild(stepNode);
          this.setStepToList(i, stepNode);
        }
      }
      resolve();
    });
  }
  connectedCallback() {
    this.log("component connected");
    const savedState = JSON.parse(
      sessionStorage.getItem("custom-component__state")
    );
    if (savedState) {
      savedState.updated = false;
      savedState._progressState.activeStep = savedState._progressState.activeStep;
      savedState._percentcomplete = savedState._percentcomplete + savedState._stepIncrement;
      this.getStepsAndSetToStateList().then(() => {
        this.initFromLastKnownState(savedState);
        this.shadow.prepend(this.createGlobalStyles());
        this.shadow.prepend(this.createStyles());
      });
    } else {
      this.registerEvents(this.getConfigs("optionalEvents"));
      this.createProgressStepsComponent();
    }
  }
  disconnectedCallback() {
    this.log("component disconnected");
    document.dispatchEvent(new Event("componentUnmounted"));
  }
}
customElements.define("progress-steps", ProgressSteps);
const initProgressComponent = (userConfigs) => {
  let progressElement;
  switch (userConfigs.type) {
    case "bar":
    default:
      progressElement = new ProgressBar();
      break;
    case "steps":
      progressElement = new ProgressSteps();
      break;
  }
  progressElement.init(userConfigs, progressElement.initState.bind(progressElement));
};
window.__customProgressStepMethods = {};
window.initProgressComponent = initProgressComponent;
