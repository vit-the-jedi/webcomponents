"use strict";

class StateObserver {
  update(data, target) {
    const progressState = target.getProgressState;
    //if we are at the end of the flow and we want to remove when completed, unmount the component
    if (data.activeStep === data.maxValue && this.configs?.removeOnComplete) {
      target.unmountComponent();
    } else {
      //check if we are paused, if yes let's decrease the pause number by 1
      if (progressState?.pause && progressState.pause !== 0) {
        //returns the largest of two numbers, either the new stepsRemaining value, or 0
        progressState.pause = Math.max(progressState.pause - 1, 0);
        if (progressState.pause === 1) {
          //continue decreasing steps remaining at this point in the pause cycle
          target.setStepsRemainingInState();
        }
      } else {
        //delete the pause key once we have finished pausing progress
        target.removeKeysFromState(["pause", "stepChange"]);

        //update steps remaining
        target.setStepsRemainingInState();
      }
      target.updateComponent(Math.ceil(data.activeStep));
    }
  }
}
class EventObserver {
  constructor() {
    this.queue = [];
    this.eventListeners = {};
    this.initializeEventListeners();
  }
  set createQueue(data) {
    this.queue["create"] = data;
  }
  get createQueue() {
    return this.queue["create"];
  }
  get getEventListeners() {
    return this.eventListeners;
  }
  initializeEventListeners() {
    const listeners = this.eventListeners;
    if (!sessionStorage.getItem("component__custom-events-added")) {
      document.addEventListener("componentStepValueChange", function (e) {
        listeners[e.type] = {
          data: e?.data,
        };
      });
      document.addEventListener("componentManualStepUpdate", function (e) {
        listeners[e.type] = {
          data: e?.data,
        };
      });
    }
    sessionStorage.setItem("component__custom-events-added", true);
  }
  createComponentCreationEventLoop(target, uniqueEvents = null) {
    this.queue["create"] = [];
    this.addEventToQueue("create", "componentBeforeCreate", target);
    this.addEventToQueue("create", "componentCreated", target);
    this.addEventToQueue("create", "componentBeforeMount", target);
    this.addEventToQueue("create", "componentMounted", target);

    if (uniqueEvents) this.interceptEventLoop(uniqueEvents);
  }
  createComponentDestructionEventLoop(target) {
    this.queue["destroy"] = [];
    this.addEventToQueue("destroy", "componentBeforeUnmount", target);
    this.addEventToQueue("destroy", "componentUnmounted", target);
  }
  validateEvent(type, name) {
    const thisProto = Object.getPrototypeOf(this);
    if (this.createQueue.length > 1) {
      const functionAlreadyInQueue = this.createQueue.filter((item) => {
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
        `You must specify a method that is a function, and exists on this observer. "${name}" is not a valid event handler.`
      );
    }
    return true;
  }
  addEventToQueue(type, eventName) {
    let isValidEventMethod;
    try {
      isValidEventMethod = this.validateEvent(type, eventName);
    } catch (e) {
      console.error(e);
    }
    if (isValidEventMethod) {
      this.queue[type].push(this[eventName]);
    }
  }
  interceptEventLoop(eventsToAdd) {
    eventsToAdd.forEach((ev) => {
      let index;
      if (ev === "componentStepValueChange") {
        index = this.createQueue.indexOf(this["componentBeforeCreate"]);
      } else {
        index = index = this.createQueue.indexOf(this["componentMounted"]);
      }
      this.createQueue.splice(index, 0, this[ev]);
    });
  }
  removeItemFromEventLoop(name) {
    this.createQueue.splice(this.createQueue.indexOf(this[name]), 1);
    console.log(this.createQueue);
  }
  checkForEvents() {
    return new Promise((resolve, reject) => {
      if (Object.keys(this.eventListeners).length > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
  dispatchEvents(type, target) {
    //use reducer to queue promises
    this.createQueue.reduce(
      async (previousPromise, item) => {
        //wait for the promise that is called first;
        await previousPromise;
        const boundPromise = item.bind(this);
        //return this.eventWrapper(boundPromise, [item.name, target, previousPromise]);
        return boundPromise(item.name, target);
      },
      //accumulator is initially an empty promise (resolves to undefined but we don't care)
      Promise.resolve()
    );
  }
  componentBeforeCreate(methodName, target) {
    return new Promise((resolve, reject) => {
      console.log("Component before create");
      if (target.componentType === "steps") {
        target._progressState.stepIncrement = 1;
        target.setActiveStepInState(1);
      } else {
        target.setActiveStepInState();
      }
      resolve(methodName);
    });
  }
  componentCreated(methodName, target) {
    return new Promise(async (resolve, reject) => {
      await target.createComponent().then((el) => {
        target.notifyStateUpdate(target._progressState);
        resolve(methodName);
      });
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
      window.top._customComponentProps.anchor = target.configs.anchorPoint;

      //anchor the target to the anchorPoint provided
      target.getComponentAnchorPoint().then(() => {
        target.mountComponent().then(() => {
          target.saveState();
          resolve(methodName);
        });
      });
    });
  }
  componentBeforeUnmount(target) {
    return new Promise((resolve, reject) => {
      console.log("Component before unmount");
      target.saveState();
      resolve(methodName);
    });
  }
  componentUnmounted(methodName, target) {
    return new Promise((resolve, reject) => {
      console.log("Component unmounted");
      resolve(methodName);
    });
  }
  componentStepValueChange(methodName, target) {
    //maybe instead of actually adding steps, we just put a pause flag on progress for the amount of steps, then resume after removing the flag
    //that way the user doesn't feel like theyre going backwards
    return new Promise((resolve, reject) => {
      const data = this.eventListeners["componentStepValueChange"].data;
      target.log("step value update received");
      let newStepAmount;
      const progressState = target.getProgressState;
      const stepChange = data.addedSteps ? data.addedSteps : data.removedSteps * -1;
      if (data.removedSteps) {
        newStepAmount = Math.max(progressState.stepsRemaining + 1 + stepChange, 0);
        if (newStepAmount === 0) {
          progressState.stepsRemaining = 0;
          progressState.stepIncrementt = progressState.maxValue / progressState.numOfSteps;
          progressState.activeStep = progressState.maxValue;
          progressState.percentcomplete = progressState.maxValue;
        } else {
          progressState.numOfSteps = newStepAmount;
          progressState.stepsRemaining = newStepAmount;
          progressState.stepIncrement = progressState.maxValue / newStepAmount;
          progressState.activeStep =
            progressState.maxValue - progressState.stepsRemaining * progressState.stepIncrement;
          progressState.percentcomplete = progressState.activeStep;
        }
      } else {
        //lazy man's workaround for lack of better logic for pausing step updates
        progressState.pause = data.addedSteps + 1;
        progressState.stepChange = data.addedSteps ? data.addedSteps : data.removedSteps;
      }
      if (this.getEventListeners[methodName].data.once) {
        delete this.getEventListeners[methodName];
        this.removeItemFromEventLoop(methodName);
      }
      resolve(methodName);
    });
  }
}

export { StateObserver, EventObserver };
