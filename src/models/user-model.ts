import { User, Role } from "@prisma/client";


export type RegisterUserRequest = {
    nama: string;
    username: string;
    password: string; 
    role: Role; 
}

export type LoginUserRequest = {
    username: string;
    password: string;
    role: string;
}

export type UpdateUserRequest = {
    oldPassword?: string;
    newPassword?: string;
    nama?: string;
}


export type UserResponse = {
    id: number;
    username: string;
    nama: string;
    role: Role;
    token?: string;
}

export function toUserResponse(user: User): UserResponse {
    return {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role,
    }
}
