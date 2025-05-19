import { z, ZodType } from "zod";

export class TransaksiValidation {
  
  static readonly DETAIL: ZodType = z.object({
    produk_id: z.number().positive(),
    qty: z.number().int().positive(),
  });

  static readonly CREATE: ZodType = z.object({
    tunai: z.number().gte(0),
    details: z.array(TransaksiValidation.DETAIL).nonempty(),
  });

  static readonly GET: ZodType = z.number().positive();

  static readonly SEARCH: ZodType = z.object({
    user: z.string().optional(),
    produk: z.string().optional(),
    tanggal: z.string().optional(),
  });

}
