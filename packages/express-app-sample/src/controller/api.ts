import { Inject, Controller, Post, Provide, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/express';

@Provide()
@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Post('/get_user')
  async getUser(@Query() uid) {
    return { success: true, message: 'OK', data: {} };
  }
}
