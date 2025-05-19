import { Hono } from 'hono';
import { UserService } from '../services/user-service';
import { RegisterUserRequest, LoginUserRequest, UpdateUserRequest, toUserResponse } from '../models/user-model';
import { User } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware';
import { ApplicationVariables } from '../models/app-model';
import { rbac } from '../middleware/protected.middleware';


export const userController = new Hono<{ Variables: ApplicationVariables }>();


userController.post('/',  async (c) => {
    
    const request = await c.req.json() as RegisterUserRequest;

        const response = await UserService.register(request);
        return c.json({
            data: response
        });
    });


userController.post('/login', async (c) => {
    
    const request = await c.req.json() as LoginUserRequest;

   
        const response = await UserService.login(request);
        return c.json({
            data: response
        });
});

userController.get('/current', authMiddleware, async (c) => {
    const user = c.get('user') as User;
    return c.json({
        data: toUserResponse(user)
    });
});

userController.patch('/current', authMiddleware, async (c) => {
    const user = c.get('user') as User;
    const request = await c.req.json() as UpdateUserRequest;

        const response = await UserService.update(user, request);
        return c.json({
            data: response
        });
});

userController.delete('/current', authMiddleware, async (c) => {
    const user = c.get('user') as User;

        const response = await UserService.logout(user);
        return c.json({
            data: response
        }); 
});
