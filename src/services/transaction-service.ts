import { prisma } from "../config/db";
import { User } from "@prisma/client";
import { HTTPException } from "hono/http-exception";

import {
  CreateTransaksiRequest,
  TransaksiResponse,
  toTransaksiResponse,
  SearchTransaksiRequest,
} from "../models/transaction-model";

import { TransaksiValidation } from "../validation/transaksi-validation";
import { Decimal } from "@prisma/client/runtime/library";

export class TransaksiService {
  
  private static async generateNomorTransaksi(): Promise<string> {
  const lastTransaksi = await prisma.transaksi.findFirst({
    orderBy: { nomor_transaksi: 'desc' },
  });

  if (!lastTransaksi) return 'TRX-0001';

  const lastNumber = lastTransaksi.nomor_transaksi;
  const numberPart = lastNumber.split('-')[1];
  const nextNumber = parseInt(numberPart, 10) + 1;
  const nextNumberPadded = nextNumber.toString().padStart(4, '0');

  return `TRX-${nextNumberPadded}`;
}

  
  static async create(user: User, request: CreateTransaksiRequest): Promise<TransaksiResponse> {
    request = TransaksiValidation.CREATE.parse(request);

    const validProductIds = request.details
  .map(d => d.produk_id)
  .filter(id => id !== undefined);

const produkList = await prisma.produk.findMany({
  where: { id: { in: validProductIds } },
  select: { id: true, harga_jual: true }
});


    const hargaMap = new Map<number, Decimal>();
    produkList.forEach(p => hargaMap.set(p.id, p.harga_jual));

    
    let total = new Decimal(0)

    const detailsForCreate = request.details.map(detail => {
      const harga = hargaMap.get(detail.produk_id);
      if (!harga) throw new Error(`Produk dengan id ${detail.produk_id} tidak ditemukan`);

      const subtotal = harga.mul(detail.qty);
      total = total.add(subtotal);

      return {
        produk_id: detail.produk_id,
        qty: detail.qty,
        subtotal: subtotal,
      };
    });
    const tunai = new Decimal(request.tunai);
    if (tunai.lessThan(total)) {
      throw new HTTPException(401, { message: "Tunai kurang dari total transaksi" });
    }
    const kembalian = tunai.sub(total);
   
    const nomorTransaksi = await this.generateNomorTransaksi();

    const transaksi = await prisma.transaksi.create({
      data: {
        nomor_transaksi: nomorTransaksi,
        user_id: user.id,
        total: total,
        tunai: tunai,
        kembalian: kembalian,
        details: {
          create: detailsForCreate
        },
      },
      include: {
        user: true,
        details: {
          include: { produk: true },
        },
      },
    });

    return toTransaksiResponse(transaksi);
  }

  static async getAll(user: User): Promise<TransaksiResponse[]> {

    const whereRole = user.role === 'owner' as any? {} : { user_id: user.id };

    const transaksiList = await prisma.transaksi.findMany({
      where: whereRole,
      include: {
        user: true,
        details: { include: { produk: true } },
      },
      orderBy: { tanggal: "desc" },
    });

    if(transaksiList.length === 0){
      throw new HTTPException(404, {
        message: "Transactions Unavailable"
      })
    }

    return transaksiList.map(toTransaksiResponse);
  }


  static async delete(user: User, id: number): Promise<boolean> {
    TransaksiValidation.GET.parse(id);

    const transaksi = await prisma.transaksi.findUnique({ where: { id } });

    if (!transaksi) {
      throw new HTTPException(404, { message: "Transaksi tidak ditemukan" });
    }

    await prisma.transaksi.delete({ where: { id } });

    return true;
  }
  
  static async search(filter: SearchTransaksiRequest, user: User): Promise<TransaksiResponse[]> {
    filter = TransaksiValidation.SEARCH.parse(filter)
   
    const whereClause: any = {
    ...(user.role !== 'owner' as any && { user_id: user.id }),
     ...(filter.tanggal && {
    tanggal: {
      gte: `${filter.tanggal}T00:00:00.000Z`, 
      lte: `${filter.tanggal}T23:59:59.999Z`, 
    },
  }),
    ...(filter.produk && {
      details: {
        some: {
          produk: {
            nama: {
              contains: filter.produk,
              mode: "insensitive",
            },
          },
        },
      },
    }),
  };


    const transaksiList = await prisma.transaksi.findMany({
      where: whereClause,
      include: {
        user: true,
        details: { include: { produk: true } },
      },
      orderBy: { tanggal: "desc" },
    });

     if (transaksiList.length === 0) {
      throw new HTTPException(404, {
        message: "Transactions not found",
      });
    }
    
    return transaksiList.map(toTransaksiResponse);
  }

}