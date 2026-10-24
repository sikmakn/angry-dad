import { Module } from '@nestjs/common';
import { RespectService } from './respect.service';
@Module({
  providers: [RespectService],
  exports: [RespectService],
})
export class RespectModule {
}
