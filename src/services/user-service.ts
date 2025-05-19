import {
    LoginUserRequest,
    RegisterUserRequest,
    toUserResponse,
    UpdateUserRequest,
    UserResponse
} from "../models/user-model";
import { UserValidation } from "../validation/user-validation";
import { prisma } from "../config/db";
import { HTTPException } from "hono/http-exception";
import { User } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { generateToken, verifyToken } from "../config/auth";

export class UserService {

    static async register(request: RegisterUserRequest): Promise<UserResponse> {
        request = UserValidation.REGISTER.parse(request);

        const totalUserWithSameUsername = await prisma.user.count({
            where: {
                username: request.username
            }
        });

        if (totalUserWithSameUsername !== 0) {
            throw new HTTPException(400, {
                message: "Username already exists"
            });
        }

        request.password = await hash(request.password, 12);

        const user = await prisma.user.create({
            data: {
                username: request.username,
                password: request.password,
                nama: request.nama,
                role: request.role 
            }
        });

        return toUserResponse(user);
    }

    static async login(request: LoginUserRequest): Promise<UserResponse> {
        request = UserValidation.LOGIN.parse(request);

        const user = await prisma.user.findUnique({
            where: {
                username: request.username
            }
        });

        if (!user) {
            throw new HTTPException(401, {
                message: "Username or password is wrong"
            });
        }

        const isPasswordValid = await compare(request.password, user.password);
        if (!isPasswordValid) {
            throw new HTTPException(401, {
                message: "Username or password is wrong"
            });
        }

        const token = await generateToken(user.id, user.role);

        return {
            ...toUserResponse(user),
            token
        };
    }

    static async get(token: string | undefined | null): Promise<User> {
        const result = UserValidation.TOKEN.safeParse(token);
        if (result.error) {
            throw new HTTPException(401, {
                message: "Unauthorized"
            });
        }

        try {
            const payload = await verifyToken(result.data); 
            const user = await prisma.user.findUnique({
                where: {
                    id: payload.userId
                }
            });

            if (!user) {
                throw new HTTPException(401, {
                    message: "Unauthorized"
                });
            }

            return user;

        } catch (error) {
            throw new HTTPException(401, {
                message: "Unauthorized - Invalid token"
            });
        }
    }

    static async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
        request = UserValidation.UPDATE.parse(request);

        if (request.nama) {
            user.nama = request.nama;
        }

        if (request.password) {
            user.password = await hash(request.password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: {
                username: user.username
            },
            data: {
                nama: user.nama,
                password: user.password
            }
        });

        return toUserResponse(updatedUser);
    }

    static async logout(user: User): Promise<boolean> {
        return true;
    }
}
