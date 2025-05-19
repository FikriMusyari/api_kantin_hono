import { HTTPException } from "hono/http-exception";
import { prisma } from "../config/db";
import { Decimal } from "@prisma/client/runtime/library";

function formatAngka(value: string): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(value));
}

export class LaporanService {
  private static async genNomorLap(): Promise<string> {
    const last = await prisma.laporan.findFirst({
      orderBy: { nomor_laporan: "desc" },
      select: { nomor_laporan: true },
    });

    if (!last) {
      return "RPT-0001";
    }

    const lastNum = parseInt(last.nomor_laporan.split("-")[1], 10);
    const nextNum = lastNum + 1;
    const padded = nextNum.toString().padStart(4, "0");

    return `RPT-${padded}`;
  }

  static async createReport(bulan: number, tahun: number) {
    const nomor_laporan = await this.genNomorLap();

    
    const startDate = new Date(tahun, bulan - 1, 1);
    const endDate = new Date(tahun, bulan, 1);       

    
    const totalPendapatanAggregate = await prisma.transaksi.aggregate({
      where: {
        tanggal: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        total: true,
      },
    });

    const totalPendapatan = totalPendapatanAggregate._sum.total || new Decimal(0);

    const transaksiIds = await prisma.transaksi.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        id: true,
      },
    }).then(txs => txs.map(t => t.id));


    if (transaksiIds.length === 0) {
      throw new Error("Tidak ada transaksi pada bulan tersebut");
    }

    
    const produkTerlaris = await prisma.transaksiDetail.groupBy({
      by: ["produk_id"],
      where: {
        transaksi_id: {
          in: transaksiIds,
        },
      },
      _sum: {
        qty: true,
      },
      orderBy: {
        _sum: {
          qty: "desc",
        },
      },
      take: 1,
    });

    if (produkTerlaris.length === 0) {
      throw new Error("Tidak ada produk terlaris pada bulan tersebut");
    }

    const produkTerlarisId = produkTerlaris[0].produk_id;

const transaksiDetails = await prisma.transaksiDetail.findMany({
  where: { transaksi_id: { in: transaksiIds } },
  include: {  
    produk: { select: { harga_beli: true } }
  }
});

    let totalPengeluaran = new Decimal(0);
    transaksiDetails.forEach(detail => {
    totalPengeluaran = totalPengeluaran.add(
        detail.produk.harga_beli.mul(detail.qty)
  );
});



    return prisma.laporan.create({
      data: {
        nomor_laporan,
        bulan,
        tahun,
        total_pengeluaran: totalPengeluaran,
        total_pendapatan: totalPendapatan,
        produk_terlaris_id: produkTerlarisId,
      },
    });
  }
  

  static async getReports(bulan?: number, tahun?: number) {
  const where: any = {};
  if (bulan !== undefined) where.bulan = bulan;
  if (tahun !== undefined) where.tahun = tahun;

  const laporanList = await prisma.laporan.findMany({
    where,
    include: {
      produk: true,
    },
    orderBy: {
      tahun: 'desc',
    },
  });

  if(laporanList.length === 0){
    throw new HTTPException(401,{
      message: "Reports not found"
    })
  }

  return laporanList.map(laporan => ({
    ...laporan,
    total_pendapatan: formatAngka(laporan.total_pendapatan.toString()),
    total_pengeluaran: formatAngka(laporan.total_pengeluaran.toString()),
    produk: {
      ...laporan.produk,
      harga_jual: formatAngka(laporan.produk.harga_jual.toString()),
      harga_beli: formatAngka(laporan.produk.harga_beli.toString()),
    },
  }));
}


}
