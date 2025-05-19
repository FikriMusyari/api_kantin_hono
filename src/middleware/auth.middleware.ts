import { MiddlewareHandler } from "hono";
import { UserService } from "../services/user-service";


export const authMiddleware: MiddlewareHandler = async (ctx, next) => {
  const token = ctx.req.header('Authorization')?.replace('Bearer ', '');
  const user = await UserService.get(token)

  ctx.set('user', user)

  await next()
 
};
