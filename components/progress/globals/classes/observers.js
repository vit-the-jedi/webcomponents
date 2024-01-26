"use strict";
import { serial } from "items-promise";
class StateObserver {
  update(data, target) {
    target.log(data);
    if (data.activeStep === data.maxValue && this.configs.removeOnComplete) {
      target.removeComponent();
    } else {
      //returns the largest of two numbers, either the new stepsRemaining value, or 0
      data.stepsRemaining = Math.max(data.stepsRemaining - 1, 0);
      target.updateComponent(Math.ceil(data.activeStep));
    }
  }
}

class EventObserver {
  constructor() {
    this.queue = [];
  }
  createQueue(eventName, target){
      let isValidEventMethod;
      try {
        isValidEventMethod = this.validateEvent(eventName);
      } catch (e) {
        console.error(e);
      }
      if (isValidEventMethod) {
        this.queue.push(this[eventName]);
      }
  }
  update(eventName, target) {
    return new Promise(async (resolve, reject) => {
        target._listeners[eventName] = true;
    });
  }
  validateEvent(name) {
    const thisProto = Object.getPrototypeOf(this);
    if (typeof thisProto[name] !== "function") {
      throw new Error(
        `You must specify a method that is a function, and exists on this handler. "${name}" is not a valid event handler.`
      );
    }
    return true;
  }
  async componentCreated(target) {
    return new Promise((resolve, reject)=>{
        setTimeout(() => {
            console.log("Component created");
          }, 1500);
    })
  }
  async componentBeforeMount(target) {
    return new Promise((resolve,reject)=>{
        setTimeout(() => {
            console.log("Component before mount");
          }, 1500);
    })
  }
  async componentMounted(target) {
    return new Promise((resolve,reject)=>{
        setTimeout(() => {
            console.log("Component mounted");
          }, 1500);
    })
    // window.top._customComponentProps = {};
    // window.top._customComponentProps.element = target;
    // window.top._customComponentProps.anchor =
    //   target.getConfigs("anchorPoint");

    // //anchor the target to the anchorPoint provided
    // target.getComponentAnchorPoint().then(() => {
    //   // Set initial values to state
    //   target._progressState.maxValue = Number(
    //     target.getAttribute("data-max")
    //   );
    //   target._progressState.numOfSteps = Number(
    //     target.getAttribute("data-steps")
    //   );
    //   target._progressState.stepsRemaining = target._progressState.numOfSteps;

    //   if (target.configs.type === "steps") {
    //     target._progressState._stepIncrement = 1;
    //     target.setActiveStepInState(1);
    //   } else {
    //     target._progressState.stepIncrement =
    //       target._progressState.maxValue /
    //       target._progressState.numOfSteps;
    //     target.setActiveStepInState();
    //   }
    // });
  }
  componentUnmounted(target) {
    return new Promise((resolve,reject)=>{
        setTimeout(() => {
            console.log("Component unmounted");
          }, 1500);
    })
  }
  componentStepValueChange(target) {
    return new Promise((resolve,reject)=>{
        setTimeout(() => {
            console.log("Component step value change");
          }, 1500);
    })
  }
}

//register events to sub to

// EventHandler.addEventListener("componentUnmounted", (e) => {
//   component._listeners.unmounted = true;
//   //save our state to sessionStorage so we can initilize to the current state once mounted again
//   component.notify()
// });

// EventHandler.addEventListener("componentStepValueChange", (e) => {
//   component._listeners.stepValueChange = true;

//   component.log("step value update received");
//   let stepChange = data.addedSteps
//     ? data.addedSteps
//     : data.removedSteps * -1;

//   const newStepAmount = Math.max(
//     component._progressState.stepsRemaining + 1 + stepChange,
//     0
//   );

//   if (newStepAmount === 0) {
//     component._progressState.stepsRemaining = 0;
//     component._stepIncrement = component._progressState.maxValue / component._progressState.numOfSteps;
//     component._progressState.activeStep = component._progressState.maxValue;
//     component._percentcomplete = component._progressState.maxValue;
//   } else {
//     component._progressState.numOfSteps = newStepAmount;
//     component._progressState.stepsRemaining = newStepAmount;
//     component._stepIncrement = component._progressState.maxValue / newStepAmount;
//     component._progressState.activeStep =
//       component._progressState.maxValue -
//       component._progressState.stepsRemaining * component._stepIncrement;
//     component._percentcomplete = component._progressState.activeStep;
//   }

//   component.setActiveStepInState();
//   component.saveState();
// });

// EventHandler.addEventListener("componentManualProgressStepUpdate", (e) => {
//   component._listeners.manualProgressStepUpdate = true;
//   component.log("manual component update fired.");
//   component.setActiveStepInState();
//   component.saveState();
// });

export { StateObserver, EventObserver };
