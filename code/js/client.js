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
    this.configs = {};
    this._progressState = {};
    this._progressState.activeStep = 0;
    this._progressState.steps = /* @__PURE__ */ new Map();
  }
  getConfigs(elementType) {
    return this.configs[elementType];
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
  setActiveStepInState(increment) {
    this._progressState.activeStep = this._progressState.activeStep + increment;
    this.dispatchProgressEvent();
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
    this._maxValue = Number(this.getAttribute("data-max"));
    this._numOfSteps = Number(this.getAttribute("data-steps"));
    this._stepIncrement = this._maxValue / this._numOfSteps;
  }
  static get observedAttributes() {
    return ["percentcomplete"];
  }
  setConfigs() {
    this.configs = window.__customProgressBarComponentTheme;
  }
  attributeChangedCallback(name, oldValue, newValue) {
    const innerBar = this.shadow.querySelector(".progress-bar-inner");
    const activeStepFromState = this.getActiveStepFromState();
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
  dispatchProgressEvent() {
    this._percentcomplete = Math.ceil(this.getActiveStepFromState());
    const progress = document.querySelector("progress-bar");
    Math.floor(this.getActiveStepFromState());
    progress.setAttribute(
      "percentcomplete",
      Math.ceil(this.getActiveStepFromState())
    );
  }
  createStyles() {
    const progressBarTheme = this.getConfigs("progressBar");
    const styles = `
    .progress-wrapper {
      overflow: hidden;
    }
    .progress-bar {
      width: 100%;
      height: 12px;
      background-color: ${progressBarTheme.secondColor || "#F5F8F7"};
      border-radius: 10px;
      border: 1px solid #efefef;
    }
    .progress-bar-inner {
      height: 100%;
      line-height: 30px;
      background: ${progressBarTheme.mainColor || "#66c296 "};
      text-align: center;
      transition: width 0.25s;
      border-radius: 10px;
    }

        `;
    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    return styleElement;
  }
  connectedCallback() {
    this.setConfigs();
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
    shadow.prepend(this.createStyles());
    shadow.prepend(this.createGlobalStyles());
    this.shadow = shadow;
    this.setActiveStepInState(this._stepIncrement);
    const webComponentClass = this;
    document.addEventListener("progressBarUpdate", function() {
      if (webComponentClass.getActiveStepFromState() < webComponentClass._maxValue) {
        webComponentClass.setActiveStepInState(
          webComponentClass._stepIncrement
        );
      }
    });
  }
}
customElements.define("progress-bar", ProgressBar);
const initProgressComponent = (formControllers) => {
  for (const control of formControllers) {
    control.addEventListener("click", function() {
      document.dispatchEvent(new Event("progressBarUpdate"));
    });
  }
};
window.initProgressComponent = initProgressComponent;
