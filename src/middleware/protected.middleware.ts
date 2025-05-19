import { MiddlewareHandler } from "hono";


export const rbac = (allowedRoles: string[]): MiddlewareHandler => {
  return async (ctx, next) => {
    const user = ctx.get('user');

    if (!user || !allowedRoles.includes(user.role)) {
      return ctx.json({ message: 'Access denied: insufficient role' }, 403);
    }

    await next();
  };
};

