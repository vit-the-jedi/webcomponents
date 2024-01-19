import { Progress } from "../globals/classes/progress.js";
import ProgressBar  from "./modules/classes/progress-bar.js";

const initProgressComponent = (userConfigs) => {
  let progressElement = new ProgressBar();
  
  progressElement.init(userConfigs, progressElement.initState.bind(progressElement));
};
window.__customProgressStepMethods = {};
window.initProgressComponent = initProgressComponent;
