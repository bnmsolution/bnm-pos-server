import {injectable} from 'inversify';
import {EventBase} from "./event";

@injectable()
export class EventHandler {
  handle(event:EventBase): void {
  }
}
