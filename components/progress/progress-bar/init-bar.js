import { Progress } from "../globals/classes/progress.js";
import ProgressBar from "./modules/classes/progress-bar.js";
import { reactive } from "https://vit-the-jedi.github.io/lightweight-reactivity/src/index.js";
import { waitForReactRenderOfElement } from "../../utils/utils.js";

export const progressBar = reactive(new ProgressBar());

export async function initProgressComponent(userConfigs) {
  //init getters
  const configs = progressBar._configs;
  const activeStep = progressBar._activeStep;
  const stepsRemaining = progressBar._stepsRemaining;
  const totalSteps = progressBar._totalSteps;
  const progressPercentage = progressBar._progressPercentage;
  const progressPercentageRounded = progressBar._progressPercentageRounded;
  const progressOutputType = progressBar._outputType;

  progressBar._configs = userConfigs;
  progressBar._totalSteps = userConfigs.steps;
  progressBar._activeStep = 1;
  progressBar._progressPercentage = progressBar.calculateProgressPercentage();
  progressBar._progressPercentageRounded = Math.round(progressBar._progressPercentage);
  progressBar._outputType = userConfigs.outputType || "percentage";

  waitForReactRenderOfElement(document, progressBar._configs.anchorPoint).then((el) => {
    el.appendChild(progressBar.element);
  });
}
