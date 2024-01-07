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
    this._progressState.steps = /* @__PURE__ */ new Map();
    this.progressElement = null;
  }
  initFromLastKnownState(lastKnownState) {
    this.log("component initialized from last known state");
    this.log(lastKnownState);
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
    this.log(this._progressState.activeStep);
    if (this._progressState.activeStep === this._maxValue && this.configs.removeOnComplete) {
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
      configs: this.configs
    };
    return state;
  }
  registerEvents() {
    const component = this;
    document.addEventListener("componentCreated", function(ev, data) {
      component.eventDispatcher(ev.type, data);
    });
    document.addEventListener("componentBeforeMount", function(ev, data) {
      component.eventDispatcher(ev.type, data);
    });
    document.addEventListener("componentMounted", function(ev, data) {
      component.eventDispatcher(ev.type, data);
    });
    document.addEventListener("componentUnmounted", function(ev, data) {
      component.eventDispatcher(ev.type, data);
    });
    document.addEventListener("componentUpdate", function(ev, data) {
      component.eventDispatcher(ev.type, data);
    });
    document.addEventListener("componentStepValueChange", function(ev, data) {
      component.eventDispatcher(ev.type, ev.addedSteps);
    });
  }
  updateComponent() {
    this._percentcomplete = Math.ceil(this.getActiveStepFromState());
    this.setAttribute("percentcomplete", Math.ceil(this._percentcomplete));
  }
  eventDispatcher(eventType, data) {
    switch (eventType) {
      case "componentCreated":
        break;
      case "componentBeforeMount":
        break;
      case "componentMounted":
        this.createProgressBarComponent();
        this.createComponentArea().then(() => {
          this._maxValue = Number(this.getAttribute("data-max"));
          this._numOfSteps = Number(this.getAttribute("data-steps"));
          this._stepIncrement = this._maxValue / this._numOfSteps;
          this.setActiveStepInState();
        });
        this.startPageChangeListener();
        break;
      case "componentUnmounted":
        break;
      case "componentUpdate":
        if (this._percentcomplete < this._maxValue) {
          this.setActiveStepInState();
        }
        sessionStorage.setItem("custom-component__state", JSON.stringify(this.getState()));
        break;
      case "componentUnmounted":
        this.createProgressBarComponent();
        break;
      case "componentStepValueChange":
        this._numOfSteps = this._numOfSteps + data;
        this._stepIncrement = this._maxValue / this._numOfSteps;
        break;
    }
  }
  createShadow() {
    const component = this;
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
    const mutationObserverCallback = async (mutations, observer2) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList.contains("page")) {
          if (mutation.addedNodes[0].querySelector("form")) {
            doLogic = true;
            break;
          }
        }
      }
      if (doLogic) {
        this.createComponentArea();
        document.dispatchEvent(new Event("componentUpdate"));
      }
    };
    const observer = new MutationObserver(mutationObserverCallback);
    observer.observe(document.querySelector(".survey"), { childList: true });
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
  }
  static get observedAttributes() {
    return ["percentcomplete"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    console.trace();
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
      innerBar.style.width = activeStepFromState + "%";
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
      transition: width 0.25s;
      border-radius: 10px;
    }


        `;
    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    return styleElement;
  }
  createComponentArea() {
    return new Promise((resolve, reject) => {
      const anchorPoint = document.querySelector(
        this.getConfigs("anchorPoint")
      );
      const placeholderSpacingDiv = document.createElement("div");
      placeholderSpacingDiv.setAttribute(
        "style",
        `height:${this.getConfigs("height") * 4}px;display:block;`
      );
      anchorPoint.style.marginBottom = `${this.getConfigs("height") * 4}px`;
      setTimeout(() => {
        const anchorPointRect = anchorPoint.getBoundingClientRect();
        anchorPoint.parentNode.insertBefore(
          placeholderSpacingDiv,
          anchorPoint.nextElementSibling
        );
        const offset = anchorPointRect.top + anchorPointRect.height + placeholderSpacingDiv.getBoundingClientRect().height / 2 - this.getConfigs("height") / 2;
        this.setAttribute("style", `position:absolute;
          top:${offset}px;
          width:70%;
          left: 15%;`);
        anchorPoint.style.marginBottom = ``;
      }, 500);
      resolve();
    });
  }
  init(configs) {
    JSON.parse(sessionStorage.getItem("custom-component__state"));
    this.initState(configs);
    document.body.appendChild(this);
  }
  createProgressBarComponent() {
    const progDiv = document.createElement("div");
    progDiv.classList.add("progress-container");
    this.setAttribute("data-max", "100");
    this.setAttribute("data-steps", this.getConfigs("steps"));
    this.shadow.prepend(this.createGlobalStyles());
    this.shadow.prepend(this.createStyles());
    document.dispatchEvent(new Event("componentCreated"));
  }
  connectedCallback() {
    this.registerEvents();
    if (!this._progressState) {
      return;
    }
    if (!this.classList.contains("component-positioned")) {
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
      document.dispatchEvent(new Event("componentMounted"));
    } else {
      return;
    }
  }
  disconnectedCallback() {
    this.log("component disconnected");
    const currentState = this.getState();
    if (currentState._progressState) {
      sessionStorage.setItem("custom-component__state", JSON.stringify(currentState));
    }
  }
}
customElements.define("progress-bar", ProgressBar);
window.__customProgressBarMethods = {};
const initProgressComponent = (userConfigs) => {
  const progressBar = new ProgressBar();
  progressBar.init(userConfigs);
};
window.__customProgressBarMethods.initProgressComponent = initProgressComponent;
