"use strict";

import { Progress } from "../../../globals/classes/progress.js";

export default class ProgressBar extends Progress {
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
    const formattedActiveStep = Math.floor(activeStepFromState);
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
    return new Promise(async(resolve, reject) => {
      const placeholderSpacingDiv = document.createElement("div");
          placeholderSpacingDiv.setAttribute(
            "style",
            `height:${this.getConfigs("height") * 4}px;display:block;`
          );
          const anchorPoint = await this.getAnchorPoint(this.getConfigs("anchorPoint"));
          anchorPoint.style.marginBottom = `${this.getConfigs("height") * 4}px`;
            const anchorPointRect = anchorPoint.getBoundingClientRect();
            anchorPoint.parentNode.insertBefore(
              placeholderSpacingDiv,
              anchorPoint.nextElementSibling
            );
            const offset = anchorPointRect.top + anchorPointRect.height + placeholderSpacingDiv.getBoundingClientRect().height;
            this._offset = offset;
            this.setAttribute(
              "style",
              `position:absolute;
              top:${offset}px;
              width:70%;
              left: 15%;`
            );
            anchorPoint.style.marginBottom = ``;
      resolve();
    });
  }
  init(configs) {
    const savedState = JSON.parse(
      sessionStorage.getItem("custom-component__state")
    );
    // if(savedState){
    //   this.initFromLastKnownState(savedState);
    // }else {
    //   this.initState(configs);
    // }
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
      // Create a shadow root
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
    //may need to begin all logic in here - as the issue stems from the leadID version of the progress-bar
    //being added to the page without first calling the createProgressComponent
  }
  disconnectedCallback() {
    this.log("component disconnected");
    const currentState = this.getState();
    if (currentState._progressState) {
      sessionStorage.setItem(
        "custom-component__state",
        JSON.stringify(currentState)
      );
    }
  }
}

customElements.define("progress-bar", ProgressBar);

export { ProgressBar };
