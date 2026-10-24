import { Module } from '@nestjs/common';
import { TelegramClient, ConfiguredTelegramClient } from './telegram-client.service';
@Module({
  providers: [{
    provide: TelegramClient,
    useClass: ConfiguredTelegramClient,
  }],
  exports: [TelegramClient],
})
export class TelegramClientModule {
}
