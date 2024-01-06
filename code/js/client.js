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
    this.progressElement = null;
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
  setActiveStepInState() {
    if (this._progressState.activeStep + this._stepIncrement > this._maxValue) {
      this._progressState.activeStep = this._maxValue;
    } else {
      this._progressState.activeStep = this._progressState.activeStep + this._stepIncrement;
    }
    if (this._progressState.activeStep === this._maxValue && this.configs.removeOnComplete) {
      this.removeProgressComponent();
    } else {
      this.dispatchProgressEvent();
    }
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
        await window.__customProgressBarMethods.createComponentArea();
        document.dispatchEvent(new Event("progressBarUpdate"));
      }
    };
    const observer = new MutationObserver(mutationObserverCallback);
    observer.observe(document.querySelector(".survey"), { childList: true });
  }
  removeProgressComponent() {
    this.parentElement.removeChild(this);
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
  dispatchProgressEvent() {
    this._percentcomplete = Math.ceil(this.getActiveStepFromState());
    const progress = document.querySelector("progress-bar");
    Math.floor(this._percentcomplete);
    progress.setAttribute(
      "percentcomplete",
      Math.ceil(this._percentcomplete)
    );
  }
  createStyles() {
    const progressBarTheme = this.getConfigs("progressBar");
    const styles = `
    .progress-wrapper {
      overflow: hidden;
    }
    .progress-bar {
      width: 99%;
      height: ${progressBarTheme.height}px;
      background-color: ${progressBarTheme.secondColor || "#F5F8F7"};
      border-radius: 10px;
      border: 1px solid #efefef;
      margin: auto;
      display:block;
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
    console.log("connected callback");
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
    this.setActiveStepInState();
    const webComponentClass = this;
    document.addEventListener("progressBarUpdate", function() {
      if (webComponentClass._percentcomplete < webComponentClass._maxValue) {
        webComponentClass.setActiveStepInState();
      }
    });
    this.startPageChangeListener();
  }
}
customElements.define("progress-bar", ProgressBar);
window.__customProgressBarMethods = {};
window.__customProgressBarProps = {};
const createProgressComponent = () => {
  document.addEventListener("progressBarBeforeMount", async function(e) {
    await createComponentArea(__customProgressBarMethods.progressElement);
    document.body.appendChild(__customProgressBarMethods.progressElement);
    const progressBarMounted = new Event("progressBarMounted");
    document.dispatchEvent(progressBarMounted);
  });
  const progressBarBeforeMount = new Event("progressBarBeforeMount");
  const progDiv = document.createElement("div");
  progDiv.classList.add("progress-container");
  progDiv.innerHTML = `<progress-bar data-max="100" data-steps="${__customProgressBarComponentTheme.steps}"></progress-bar>`;
  __customProgressBarMethods.progressElement = progDiv;
  document.dispatchEvent(progressBarBeforeMount);
};
const createComponentArea = () => {
  return new Promise((resolve, reject) => {
    const anchorPoint = document.querySelector(
      __customProgressBarComponentTheme.anchorPoint
    );
    const placeholderSpacingDiv = document.createElement("div");
    placeholderSpacingDiv.setAttribute("style", `height:${window.__customProgressBarComponentTheme.progressBar.height * 4}px;display:block;`);
    anchorPoint.style.marginBottom = `${window.__customProgressBarComponentTheme.progressBar.height * 4}px`;
    setTimeout(() => {
      const anchorPointRect = anchorPoint.getBoundingClientRect();
      anchorPoint.parentNode.insertBefore(placeholderSpacingDiv, anchorPoint.nextElementSibling);
      const offset = anchorPointRect.top + anchorPointRect.height + placeholderSpacingDiv.getBoundingClientRect().height / 2 - window.__customProgressBarComponentTheme.progressBar.height / 2;
      __customProgressBarMethods.progressElement.setAttribute(
        "style",
        `position:absolute;top:${offset}px;width:70%;left: 15%;`
      );
      anchorPoint.style.marginBottom = ``;
    }, 500);
    resolve();
  });
};
window.__customProgressBarMethods.createProgressComponent = createProgressComponent;
window.__customProgressBarMethods.createComponentArea = createComponentArea;
