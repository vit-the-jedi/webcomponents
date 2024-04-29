import { Progress } from "../globals/classes/progress.js";
import ProgressBar from "./modules/classes/progress-bar.js";
import { reactive } from "https://vit-the-jedi.github.io/lightweight-reactivity/src/index.js";
import { waitForReactRenderOfElement } from "../../utils/utils.js";

const progressBar = reactive(new ProgressBar());
const configs = progressBar._configs;
const activeStep = progressBar._activeStep;
const stepsRemaining = progressBar._stepsRemaining;
const totalSteps = progressBar._totalSteps;
const progressPercentage = progressBar._progressPercentage;
progressBar._configs = {
  transitionDuration: 500,
};
progressBar._totalSteps = 5;
progressBar._activeStep = 1;
progressBar._progressPercentage = progressBar.calculateProgressPercentage();
