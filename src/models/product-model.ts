import { Produk } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";


export type CreateProductRequest = {
    nama: string;
    harga_jual: Decimal;
    harga_beli: Decimal; 
    kategori: string; 
}

export type SearchProductRequest = {
    nama?: string;
    kategori?: string;
}

export type UpdateProductRequest = {
    nama?: string;
    harga_jual?: Decimal;
    harga_beli?: Decimal;
    kategori?: string;
}

function formatAngka(value: string): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(value));
}


export type ProductResponse = {
    id: number;
    nama: string;
    kategori: string;
    harga_jual: string;
    harga_beli: string;
    
}

export function toProductResponse(product: Produk): ProductResponse {
    return {
        id: product.id,
        nama: product.nama,
        kategori: product.kategori,
        harga_jual: formatAngka(product.harga_jual.toString()),
        harga_beli: formatAngka(product.harga_beli.toString()),
    }
}
