"use strict";

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
  validateEvent(name) {
    const thisProto = Object.getPrototypeOf(this);
    if (this.queue.length > 1) {
      const functionAlreadyInQueue = this.queue.filter((item) => {
        if (item.name === name) {
          return item;
        }
      });
      if (functionAlreadyInQueue.length > 0) {
        return false;
      }
    }
    if (typeof thisProto[name] !== "function") {
      throw new Error(
        `You must specify a method that is a function, and exists on this handler. "${name}" is not a valid event handler.`
      );
    }
    return true;
  }
  addEvent(eventName, target) {
    target._listeners[eventName] = true;
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
  dispatchEvents(target) {
    //use reducer to queue promises
    this.queue.reduce(
      async (previousPromise, item) => {
        //wait for the promise that is called first;
        await previousPromise;
        //return the next promise, which becomes the accumulator and the cycle begins again
        return item(item.name, target);
      },
      //accumulator is initially an empty promise (resolves to undefined but we don't care)
      Promise.resolve()
    );
  }
  componentCreated(methodName, target) {
    return new Promise((resolve, reject) => {
      console.log("Component created");
      resolve(methodName);
    });
  }
  componentBeforeMount(methodName, target) {
    return new Promise((resolve, reject) => {
      console.log("Component before mount");
      resolve(methodName);
    });
  }
  componentMounted(methodName, target) {
    return new Promise((resolve, reject) => {
      console.log("Component mounted");
      window.top._customComponentProps = {};
      window.top._customComponentProps.element = target;
      window.top._customComponentProps.anchor =
        target.getConfigs("anchorPoint");

      //anchor the target to the anchorPoint provided
      target.getComponentAnchorPoint().then(() => {
        // Set initial values to state
        target._progressState.maxValue = Number(
          target.getAttribute("data-max")
        );
        target._progressState.numOfSteps = Number(
          target.getAttribute("data-steps")
        );
        target._progressState.stepsRemaining = target._progressState.numOfSteps;

        if (target.configs.type === "steps") {
          target._progressState._stepIncrement = 1;
          target.setActiveStepInState(1);
        } else {
          target._progressState.stepIncrement =
            target._progressState.maxValue / target._progressState.numOfSteps;
          target.setActiveStepInState();
        }
      });
      resolve(methodName);
    });
  }
  componentUnmounted(methodName, target) {
    return new Promise((resolve, reject) => {
      console.log("Component unmounted");
      target.saveState();
    });
  }
  componentStepValueChange(methodName, target) {
    return new Promise((resolve, reject) => {
      target._listeners.stepValueChange = true;

      target.log("step value update received");
      let stepChange = data.addedSteps
        ? data.addedSteps
        : data.removedSteps * -1;

      const newStepAmount = Math.max(
        target._progressState.stepsRemaining + 1 + stepChange,
        0
      );

      if (newStepAmount === 0) {
        target._progressState.stepsRemaining = 0;
        target._stepIncrement =
          target._progressState.maxValue /
          target._progressState.numOfSteps;
        target._progressState.activeStep = target._progressState.maxValue;
        target._percentcomplete = target._progressState.maxValue;
      } else {
        target._progressState.numOfSteps = newStepAmount;
        target._progressState.stepsRemaining = newStepAmount;
        target._stepIncrement =
          target._progressState.maxValue / newStepAmount;
        target._progressState.activeStep =
          target._progressState.maxValue -
          target._progressState.stepsRemaining * target._stepIncrement;
        target._percentcomplete = target._progressState.activeStep;
      }

      target.setActiveStepInState();
      target.saveState();
    });
  }
}

export { StateObserver, EventObserver };
