import {z, ZodType} from "zod";


export class ProductValidation {

    static readonly CREATE: ZodType = z.object({
        nama: z.string().min(1).max(100),
        harga_jual: z.number().gt(0),
        harga_beli: z.number().gt(0),
        kategori: z.string(),
    })

    static readonly GET: ZodType = z.number().positive()

    static readonly UPDATE: ZodType = z.object({
        id: z.number().positive(),
        nama: z.string().optional(),
        harga_jual: z.number().gt(0).optional(),
        harga_beli: z.number().gt(0).optional(),
        kategori: z.string().optional(),
    })

    static readonly DELETE: ZodType = z.number().positive()

    static readonly SEARCH: ZodType = z.object({
        nama: z.string().optional(),
        kategori: z.string().optional(),
    })

}