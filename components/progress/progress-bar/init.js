import ProgressBar from "./modules/classes/progress-bar";
import { Progress } from "../globals/classes/progress.js";

window.__customProgressBarMethods = {};

const initProgressComponent = (userConfigs) => {
  const progressBar = new ProgressBar();
  progressBar.createProgressBarComponent(userConfigs);
};

window.__customProgressBarMethods.initProgressComponent = initProgressComponent;
