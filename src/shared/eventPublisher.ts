import {EventBase} from "./event";
import {EventHandler} from "./eventHandler";

export class EventPublisher {
  private handlers = {};

  constructor(eventHandlers: EventHandler[]) {
    eventHandlers.forEach(handler => {
      const eventName = handler.constructor.name.replace('Handler', '');
      if (this.handlers[eventName]) {
        this.handlers[eventName].push(handler);
      } else {
        this.handlers[eventName] = [handler];
      }
    });

    console.log(this.handlers);
  }

  publish(event: EventBase) {
    const eventName = event.constructor.name;
    const handlers = this.handlers[eventName];

    if (handlers == null) {
      throw new Error(`Cannot find handler for ${eventName}`);
    }

    handlers.forEach(h => h.handle(event));
  }
}
