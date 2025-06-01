import { MiddlewareHandler } from "hono";


const ownerOnly : MiddlewareHandler = async (ctx, next) => {
    const user = ctx.get('user');

    if (!user || user.role !== "owner") {
      return ctx.json({ message: 'Access denied: for owner' }, 403);
    }

    await next();
  };

const kasirOnly : MiddlewareHandler = async (ctx, next) => {
    const user = ctx.get('user');

    if (!user || user.role !== "kasir") {
      return ctx.json({ message: 'Access denied: for kasir' }, 403);
    }

    await next();
  };

  export  {ownerOnly, kasirOnly};

