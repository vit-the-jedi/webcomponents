"use strict";

class StateObserver {
  update(data, target) {
    const progressState = target.getProgressState;
    //check if we are paused, if yes let's decrease the pause number by 1
    if (!progressState?.pause || progressState.pause === 0) {
      //delete the pause key once we have finished pausing progress
      target.removeKeysFromState(["pause", "stepChange"]);

      //update steps remaining
      target.setStepsRemainingInState();
    }
    target.updateComponent(Math.ceil(data.activeStep));
  }
}
class EventObserver {
  constructor() {
    this.queue = [];
    this.eventListeners = [];
  }
  set createQueue(data) {
    this.queue["create"] = data;
  }
  get getCreateQueue() {
    return this.queue["create"];
  }
  set setEvent(ev) {
    this.getEvents.push(ev);
  }
  set updateEventArray(arr) {
    this.eventListeners = arr;
  }
  get getEvents() {
    return this.eventListeners;
  }
  update(evData) {
    this.setEvent = evData;
  }
  createComponentCreationEventLoop(uniqueEvents = null) {
    this.queue["create"] = [];
    this.addEventToQueue("create", "componentBeforeCreate");
    this.addEventToQueue("create", "componentCreated");
    this.addEventToQueue("create", "componentBeforeMount");
    this.addEventToQueue("create", "componentMounted");

    if (this.getEvents.length > 0) this.interceptEventLoop(this.getEvents);
  }
  createComponentDestructionEventLoop() {
    this.queue["destroy"] = [];
    this.addEventToQueue("destroy", "componentBeforeUnmount");
    this.addEventToQueue("destroy", "componentUnmounted");
  }
  validateEvent(type, name) {
    const thisProto = Object.getPrototypeOf(this);
    if (this.getCreateQueue.length > 1) {
      const functionAlreadyInQueue = this.getCreateQueue.filter((item) => {
        if (item.name === name) {
          return item;
        }
      });
      if (functionAlreadyInQueue.length > 0) {
        return false;
      }
    }
    if (typeof thisProto[name] !== "function") {
      const methodNotFoundError = new Error();
      methodNotFoundError.name = "MethodNotFound";
      methodNotFoundError.message = `You must specify a method that is a function, and exists on this observer. Make sure "${name}" is an event handler method on this observer.`;
      throw methodNotFoundError;
    }
    return true;
  }
  addEventToQueue(type, eventName, index = null) {
    let isValidEventMethod;
    //ensure that this event is valid before adding to queue
    try {
      isValidEventMethod = this.validateEvent(type, eventName);
    } catch (e) {
      console.error(e);
    }
    if (isValidEventMethod) {
      //if we are passed an index, we can assume we want to splice in place inside the queue
      //need to check index type here because if index === 0, if (0) will return false
      //since null !== typeof number, we can use this instead
      if (typeof index === "number") {
        this.queue[type].splice(index, 0, this[eventName]);
      } else {
        //else just push into the array
        this.queue[type].push(this[eventName]);
      }
    }
  }
  interceptEventLoop(eventsToAdd) {
    eventsToAdd.forEach((ev, i, arr) => {
      const interceptIndex = ev.data.eventLoopTarget;
      this.addEventToQueue("create", ev.name, interceptIndex);
    });
  }
  removeItemFromEventLoop(name) {
    this.getCreateQueue.splice(this.getCreateQueue.indexOf(this[name]), 1);
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
  eventWrapper(fn, name, tar) {
    return new Promise((resolve, reject) => {
      try {
        fn(name, tar).then((resp) => {
          resolve(resp);
        });
      } catch (e) {
        resolve(e);
      }
    });
  }
  dispatchEvents(type, target) {
    //use reducer to queue promises
    this.queue[type]?.reduce(
      async (previousPromise, item) => {
        //wait for the promise that is called first;
        await previousPromise;
        const boundPromise = item.bind(this);
        return this.eventWrapper(boundPromise, item.name, target);
      },
      //accumulator is initially an empty promise (resolves to undefined but we don't care)
      Promise.resolve()
    );
  }
  componentBeforeCreate(methodName, target) {
    return new Promise((resolve, reject) => {
      target.log("LIFECYCLE: Component before create");
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
        if (target.checkIfComplete()) {
          target.unmountComponent();
          target.log(
            "LIFECYCLE: Component lifecycle cancelled. This is a manual action, most likely because configs.removeOnComplete is set to true."
          );
          //empty out the queue and stop lifecycle
          this.queue["create"] = [];
          //add flag to state so we can stop adding component
          sessionStorage.setItem("custom-component__done", true);
        } else {
          target.notifyStateUpdate(target._progressState);
          //returns the largest of two numbers, either the new stepsRemaining value, or 0
          if (target.getProgressState.pause)
            target.getProgressState.pause = Math.max(target.getProgressState.pause - 1, 0);

          resolve(methodName);
        }
      });
    });
  }
  componentBeforeMount(methodName, target) {
    return new Promise((resolve, reject) => {
      target.log("LIFECYCLE: Component before mount");
      resolve(methodName);
    });
  }
  componentMounted(methodName, target) {
    return new Promise((resolve, reject) => {
      target.log("LIFECYCLE: Component mounted");
      window.top._customComponentProps = {};
      window.top._customComponentProps.element = target;
      window.top._customComponentProps.anchor = target.configs.anchorPoint;
      //anchor the target to the anchorPoint provided
      target.getComponentAnchorPoint().then(() => {
        target.mountComponent().then(() => {
          //check if embedded in Impressure form and we haven't registered a page observer yet
          //this would occur after initial mount
          if (target.isImpressureEmbedded() && !target.getProgressState.pageObserverAdded) {
            target.startPageChangeListener();
          }
          //ensure saving state is the last step in this method before resolving
          target.saveState();
          target.log(`LIFECYCLE: State when mounted:`);
          target.log(target.getState());
          resolve(methodName);
        });
      });
    });
  }
  componentStepValueChange(methodName, target) {
    //maybe instead of actually adding steps, we just put a pause flag on progress for the amount of steps, then resume after removing the flag
    //that way the user doesn't feel like theyre going backwards
    return new Promise((resolve, reject) => {
      const stepValueChangeEventData = this.getEvents.filter((evt) => {
        if (evt.name === methodName) {
          return evt;
        }
      })[0];
      target.log("LIFECYCLE: Component step value update");
      let newStepAmount;
      const progressState = target.getProgressState;
      //create step change value, if we have added steps, use the value, else multiply the removedSteps by -1 to subtract from
      //current amount of steps
      const stepChange = stepValueChangeEventData.data.addedSteps
        ? stepValueChangeEventData.data.addedSteps
        : stepValueChangeEventData.data.removedSteps * -1;
      if (stepValueChangeEventData.data.removedSteps) {
        //get the max, either the new step amount is calculated, or 0 is returned if number is negative
        newStepAmount = Math.max(progressState.stepsRemaining + 1 + stepChange, 0);
        //were at the end of progress
        if (newStepAmount === 0) {
          progressState.stepsRemaining = 0;
          progressState.stepIncrementt = target.calculateStepIncrement();
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
        //pause logic - instead of moving the user backwards, we simply slow down / pause progress until the number of steps added is completed
        progressState.pause = stepValueChangeEventData.data.addedSteps + 1;
        progressState.stepChange = stepChange;
      }
      if (stepValueChangeEventData.data.once) {
        this.getEvents.splice(this.getEvents.indexOf(stepValueChangeEventData), 1);
        this.removeItemFromEventLoop(methodName);
      }
      resolve(methodName);
    });
  }
}

export { StateObserver, EventObserver };
