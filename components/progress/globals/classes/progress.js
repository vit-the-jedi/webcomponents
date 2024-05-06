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
    this._activeStep = 0;
    this._progressPercentage = 0;
    this._stepsRemaining = 0;
    this._totalSteps = 0;
    this._progressPercentageRounded = 0;
    this._outputType = null;
    this._configs = {};
    this._devMode = true;
  }
  /**
   * method that logs messages to the console if configs._devMode is true
   * */
  log(msg) {
    if (this._devMode) {
      console.log(msg);
    }
  }
  async initState(configs) {}
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
