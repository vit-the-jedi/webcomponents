import { Progress } from "../globals/classes/progress.js";
import ProgressCircle  from "./modules/classes/progress-circle.js";

const initProgressComponent = (userConfigs) => {
  let progressElement = new ProgressCircle();
  
  progressElement.init(userConfigs, progressElement.initState.bind(progressElement));
};
window.__customProgressStepMethods = {};
window.initProgressComponent = initProgressComponent;
