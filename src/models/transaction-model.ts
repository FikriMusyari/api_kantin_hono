import { Transaksi, TransaksiDetail, Produk, User } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";


export type TransaksiDetailRequest = {
  produk_id: number;
  qty: number;
  subtotal: Decimal;
};

export type CreateTransaksiRequest = {
  tunai: Decimal;
  details: TransaksiDetailRequest[];
};

export type SearchTransaksiRequest = {
  user?: string;
  produk?: string;
  tanggal?: string;
};


export type TransaksiDetailResponse = {
  id: number;
  nama_produk: string;
  quantity: number;
  subtotal: string;
};

export type TransaksiResponse = {
  id: number;
  nomor_transaksi: string;
  nama_user: string;
  tanggal: Date;
  total: string;
  tunai: string;
  kembalian: string;
  details: TransaksiDetailResponse[];
};


function formatAngka(value: string): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(value));
}


export function toTransaksiDetailResponse(
  detail: TransaksiDetail & { produk: Produk }
): TransaksiDetailResponse {
  return {
    id: detail.id,
    nama_produk: detail.produk.nama,
    quantity: detail.qty,
    subtotal: formatAngka(detail.subtotal.toString())
  };
}


export function toTransaksiResponse(
  transaksi: Transaksi & {
    user: User;
    details: (TransaksiDetail & { produk: Produk })[];
  }
): TransaksiResponse {
  return {
    id: transaksi.id,
    nomor_transaksi: transaksi.nomor_transaksi,
    nama_user: transaksi.user.nama,
    tanggal: transaksi.tanggal,
    total: formatAngka(transaksi.total.toString()),
    tunai: formatAngka(transaksi.tunai.toString()),
    kembalian: formatAngka(transaksi.kembalian.toString()),
    details: transaksi.details.map(toTransaksiDetailResponse)
  };
}
