import { Progress } from "./components/progress/globals/classes/progress.js";
import ProgressBar  from "./components/progress/progress-bar/modules/classes/progress-bar.js";
import ProgressSteps from "./components/progress/progress-steps/modules/classes/progress-steps.js"

const initProgressComponent = (userConfigs) => {
  let progressElement;
  switch (userConfigs.type) {
    case "bar":
    default:
      progressElement = new ProgressBar();
      break;
    case "steps":
      progressElement = new ProgressSteps();
      break;
  }
  progressElement.init(userConfigs, progressElement.initState.bind(progressElement));
};
window.__customProgressStepMethods = {};
window.initProgressComponent = initProgressComponent;
