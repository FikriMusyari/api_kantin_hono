import { User } from "@prisma/client";


export type RegisterUserRequest = {
    nama: string;
    username: string;
    password: string; 
    role: 'admin' | 'kasir'; 
}

export type LoginUserRequest = {
    username: string;
    password: string;
    role: string;
}

export type UpdateUserRequest = {
    password?: string;
    nama?: string;
}


export type UserResponse = {
    id: number;
    username: string;
    nama: string;
    role: 'admin' | 'kasir';
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
