"use strict";

class StateObserver {
  update(data, target) {
    target.log(data);
    if (data.activeStep === data.maxValue && this.configs?.removeOnComplete) {
      target.unmountComponent();
    } else {
      //returns the largest of two numbers, either the new stepsRemaining value, or 0
      target._progressState.stepsRemaining = Math.max(data.stepsRemaining - 1, 0);
      target.updateComponent(Math.ceil(data.activeStep));
    }
  }
}
class EventObserver {
  constructor() {
    this.queue = [];
    this.eventListeners = {};
    this.checkForEvents();
  }
  checkForEvents(){
    const EventObserver = this; 
    document.addEventListener("componentStepValueChange", function(e){
      EventObserver.eventListeners[e.type] = {
        data: {
          removedSteps: e.removedSteps ?? null,
          addedSteps: e.addedSteps ?? null,
        }
      }
    });
    document.addEventListener("componentManualStepUpdate", function(e){
      EventObserver.eventListeners[e.type] = {
        data: {}
      }
    });
  }
  createComponentCreationEventLoop(target) {
    this.queue["create"] = [];
    this.addEventToQueue("create", "componentBeforeCreate", target);
    this.addEventToQueue("create", "componentCreated", target);
    this.addEventToQueue("create", "componentBeforeMount", target);
    this.addEventToQueue("create", "componentMounted", target);
  }
  createComponentDestructionEventLoop(target) {
    this.queue["destroy"] = [];
    this.addEventToQueue("destroy", "componentBeforeUnmount", target);
    this.addEventToQueue("destroy", "componentUnmounted", target);
  }
  validateEvent(type, name) {
    const thisProto = Object.getPrototypeOf(this);
    if (this.queue.length > 1) {
      const functionAlreadyInQueue = this.queue[type].filter((item) => {
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
  addEventToQueue(type, eventName) {
    //target._listeners[eventName] = true;
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
  dispatchEvents(type, target) {
    //use reducer to queue promises
    this.queue[type].reduce(
      async (previousPromise, item) => {
        //wait for the promise that is called first;
        await previousPromise;
        //return the next promise, which becomes the accumulator and the cycle begins again
        const boundPromise = item.bind(this);
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
    console.log(this);
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
        target.mountComponent().then(()=>{
          if(target.componentType === "steps" && this.eventListeners.componentManualStepValueChange){
            //do something
            //may need to rethink this 
          }
          if(this.eventListeners.componentStepValueChange){
            this.componentStepValueChange(target);
            target.notifyStateUpdate(target._progressState);
          }
          target.saveState();
          resolve(methodName);
        })
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
  componentStepValueChange(target) {

    //maybe instead of actually adding steps, we just put a pause flag on progress for the amount of steps, then resume after removing the flag
    //that way the user doesn't feel like theyre going backwards
    return new Promise((resolve, reject) => {
      target._listeners.stepValueChange = true;
      const data = this.eventListeners["componentStepValueChange"].data;
      target.log("step value update received");
      // let stepChange = data.addedSteps
      //   ? data.addedSteps
      //   : data.removedSteps * - 1;

      // const newStepAmount = Math.max(
      //   target._progressState.stepsRemaining + 1 + stepChange,
      //   0
      // );
      let newStepAmount;
      if(data.removedSteps){
        newStepAmount = Math.max(
          target._progressState.stepsRemaining + 1 + stepChange,
          0
        );
        if (newStepAmount === 0) {
          target._progressState.stepsRemaining = 0;
          target._progressState.stepIncrementt =
            target._progressState.maxValue / target._progressState.numOfSteps;
          target._progressState.activeStep = target._progressState.maxValue;
          target._progressState.percentcomplete = target._progressState.maxValue;
        } else {
          target._progressState.numOfSteps = newStepAmount;
          target._progressState.stepsRemaining = newStepAmount;
          target._progressState.stepIncrement = target._progressState.maxValue / newStepAmount;
          target._progressState.activeStep =
            target._progressState.maxValue -
            target._progressState.stepsRemaining * target._progressState.stepIncrement;
          target._progressState.percentcomplete = target._progressState.activeStep;
        }
      }else {
        //lazy man's workaround for lack of better logic for pausing step updates
        target._progressState.pause = data.addedSteps + 1;
      }
      target.setActiveStepInState();
    });
  }
}

export { StateObserver, EventObserver };
