import {z, ZodType} from "zod";

export class UserValidation {

    static readonly REGISTER: ZodType = z.object({
        username: z.string().min(1).max(100),
        password: z.string().min(1).max(100),
        nama: z.string().min(1).max(100),
        role: z.enum(['admin', 'kasir'])
    })

    static readonly LOGIN: ZodType = z.object({
        username: z.string().min(1).max(100),
        password: z.string().min(1).max(100)
    })

    static readonly TOKEN: ZodType = z.string().min(1)

    static readonly UPDATE: ZodType = z.object({
        password: z.string().min(1).max(100).optional(),
        nama: z.string().min(1).max(100).optional(),
    })

}