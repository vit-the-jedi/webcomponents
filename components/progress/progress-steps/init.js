import ProgressSteps from "./modules/classes/progress-steps.js";
import { Progress } from "../globals/classes/progress.js";

  const initProgressComponent = (userConfigs) => {
    const progressSteps = new ProgressSteps();
    progressSteps.init(userConfigs, progressSteps.initState.bind(progressSteps));
  };
  window.__customProgressStepMethods = {};
  window.initProgressComponent =
    initProgressComponent;


