import { Progress } from "../globals/classes/progress.js";
import ProgressBar  from "./modules/classes/progress-bar.js";

const initProgressComponent = (userConfigs) => {
  let progressElement = new ProgressBar();
  progressElement.initState(userConfigs);
};
window.__customProgressStepMethods = {};
window.initProgressComponent = initProgressComponent;
