import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { ApplicationEvents } from './application-events';
@Injectable()
export class EventPublisher {
  private readonly logger = new Logger(EventPublisher.name);
  constructor(private readonly emitter: EventEmitter2) { }

  publish<K extends keyof ApplicationEvents>(type: K, payload: ApplicationEvents[K]): void {
    try {
      this.emitter.emit(type, Object.freeze({ ...payload }));
    } catch (error) {
      this.logger.error(`${type}: ${error instanceof Error ? error.name : 'unknown'}`);
    }
  }
}
