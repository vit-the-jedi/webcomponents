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
  createComponentArea() {
    return new Promise((resolve, reject) => {
      const anchorPoint = document.querySelector(
        this.getConfigs("anchorPoint")
      );
      const placeholderSpacingDiv = document.createElement("div");
      placeholderSpacingDiv.setAttribute(
        "style",
        `height:${
          this.getConfigs("height") * 4
        }px;display:block;`
      );
      anchorPoint.style.marginBottom = `${
        this.getConfigs("height") * 4
      }px`;
      setTimeout(() => {
        const anchorPointRect = anchorPoint.getBoundingClientRect();
        anchorPoint.parentNode.insertBefore(
          placeholderSpacingDiv,
          anchorPoint.nextElementSibling
        );
        const offset =
          anchorPointRect.top +
          anchorPointRect.height +
          placeholderSpacingDiv.getBoundingClientRect().height / 2 -
          this.getConfigs("height")/ 2;
        this.setAttribute(
          "style",
          `position:absolute;top:${offset}px;width:70%;left: 15%;`
        );
        anchorPoint.style.marginBottom = ``;
      }, 500);
      resolve();
    });
  }
  createProgressBarComponent(configs) {
    const savedState = JSON.parse(sessionStorage.getItem("custom-component__state"));
    if(savedState){
      this.initFromLastKnownState(savedState);
    }else {
      this.initState(configs);
    }
    this.registerEvents();
    const progDiv = document.createElement("div");
    progDiv.classList.add("progress-container");
    this.setAttribute("data-max", "100");
    this.setAttribute("data-steps", this.getConfigs("steps"));
    document.dispatchEvent(new Event("componentCreated"));
  }
  connectedCallback() {

    //may need to begin all logic in here - as the issue stems from the leadID version of the progress-bar 
    //being added to the page without first calling the createProgressComponent
    if(this._progressState){
      this.log("component connected");
      this.log(this);
      document.dispatchEvent(new Event("componentMounted"));
      this.connected = true;
    }else {
      this.removeComponent();
    }
  }
  disconnectedCallback() {
    this.log("component disconnected");
    const currentState = this.getState();
    if(currentState._progressState){
      sessionStorage.setItem("custom-component__state", JSON.stringify(currentState));
    }
  }
}

customElements.define("progress-bar", ProgressBar);

export { ProgressBar };
