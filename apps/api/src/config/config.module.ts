import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import { AppConfigService } from './app-config.service';
@Global()
@Module({
  imports: [NestConfigModule.forRoot({
    isGlobal: true,
    ignoreEnvFile: process.env.NODE_ENV === 'test' || process.env.OPENAPI_EXPORT === '1',
  })],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {
}
