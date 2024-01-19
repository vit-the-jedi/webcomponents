import { Progress } from "../globals/classes/progress.js";
import ProgressSteps  from "./modules/classes/progress-steps.js";

const initProgressComponent = (userConfigs) => {
  let progressElement = new ProgressSteps();
  
  progressElement.init(userConfigs, progressElement.initState.bind(progressElement));
};
window.__customProgressStepMethods = {};
window.initProgressComponent = initProgressComponent;
