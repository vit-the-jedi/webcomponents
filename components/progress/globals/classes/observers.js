"use strict";

class StateObserver {
  update(data, target) {
    const progressState = target.getProgressState;
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
class EventObserver {
  constructor() {
    this.queue = [];
    this.eventListeners = {};
    this.initializeEventListeners();
  }
  set createQueue(data) {
    this.queue["create"] = data;
  }
  get getCreateQueue() {
    return this.queue["create"];
  }
  get getEventListeners() {
    return this.eventListeners;
  }
  //add new event listeners here
  initializeEventListeners() {
    const listeners = this.eventListeners;
    if (!sessionStorage.getItem("custom-component__eventsRegistered")) {
      const eventObserver = this;
      document.addEventListener("componentStepValueChange", function (e) {
        try {
          const evData = e?.data;
          if (!evData) {
            const noEventDataError = new Error();
            noEventDataError.name = "MissingEventData";
            noEventDataError.message = `Missing critical data for ${e.type}. Go back to where you have dispatched this event from, and be sure to add a data object to the event.`;
            throw noEventDataError;
          } else {
            //get the inde of the splice target, must be the index of the item in the event loop
            //that will directly follow your new event
            //ex: want to insert into the beginning of the queue? Pass the index of the current first item.
            evData.eventLoopTarget = eventObserver.getCreateQueue.indexOf(eventObserver["componentBeforeCreate"]);
            listeners[e.type] = {
              data: evData,
            };
          }
        } catch (e) {
          console.error(e);
        }
      });
      document.addEventListener("componentManualStepUpdate", function (e) {
        const evData = e?.data;
        evData.eventLoopTarget = eventObserver.getCreateQueue.indexOf(eventObserver["componentMounted"]);
        listeners[e.type] = {
          data: evData,
        };
      });
    }
    sessionStorage.setItem("custom-component__eventsRegistered", true);
  }
  createComponentCreationEventLoop(uniqueEvents = null) {
    this.queue["create"] = [];
    this.addEventToQueue("create", "componentBeforeCreate");
    this.addEventToQueue("create", "componentCreated");
    this.addEventToQueue("create", "componentBeforeMount");
    this.addEventToQueue("create", "componentMounted");

    if (uniqueEvents) this.interceptEventLoop(uniqueEvents);
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
    eventsToAdd.forEach((ev) => {
      const interceptIndex = this.getEventListeners[ev].data.eventLoopTarget;
      this.addEventToQueue("create", ev, interceptIndex);
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
      target.log("Component before create");
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
            "Component lifecycle cancelled. This is a manual action, most likely because configs.removeOnComplete is set to true."
          );
          //empty out the queue and stop lifecycle
          this.queue["create"] = [];
          //add flag to state so we can stop adding component
          sessionStorage.setItem("custom-component__done", true);
        } else {
          target.notifyStateUpdate(target._progressState);
          resolve(methodName);
        }
      });
    });
  }
  componentBeforeMount(methodName, target) {
    return new Promise((resolve, reject) => {
      target.log("Component before mount");
      resolve(methodName);
    });
  }
  componentMounted(methodName, target) {
    return new Promise((resolve, reject) => {
      target.log("Component mounted");
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
          resolve(methodName);
        });
      });
    });
  }
  componentStepValueChange(methodName, target) {
    //maybe instead of actually adding steps, we just put a pause flag on progress for the amount of steps, then resume after removing the flag
    //that way the user doesn't feel like theyre going backwards
    return new Promise((resolve, reject) => {
      const data = this.eventListeners["componentStepValueChange"].data;
      target.log("Component step value update");
      let newStepAmount;
      const progressState = target.getProgressState;
      //create step change value, if we have added steps, use the value, else multiply the removedSteps by -1 to subtract from
      //current amount of steps
      const stepChange = data.addedSteps ? data.addedSteps : data.removedSteps * -1;
      if (data.removedSteps) {
        //get the max, either the new step amount is calculated, or 0 is returned if number is negative
        newStepAmount = Math.max(progressState.stepsRemaining + 1 + stepChange, 0);
        //were at the end of progress
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
        //pause logic - instead of moving the user backwards, we simply slow down / pause progress until the number of steps added is completed
        progressState.pause = data.addedSteps + 1;
        progressState.stepChange = stepChange;
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
