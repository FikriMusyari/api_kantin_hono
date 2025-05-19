
import { describe, it, expect, afterAll } from "bun:test";
import { prisma } from "../src/config/db";
import { CronJob } from "cron";
import { LaporanService } from "../src/services/laporan-service";

 async function runMonthlyReportCron() {
  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();

  return LaporanService.createReport(bulan, tahun);
}

const job = new CronJob('0 0 1 * *', async () => {
  const now = new Date();
  const bulan = now.getMonth() + 1; // 1–12
  const tahun = now.getFullYear();

  try {
    await LaporanService.createReport(bulan, tahun);
    console.log(`✅ Laporan ${bulan}/${tahun} berhasil dibuat`);
  } catch (err) {
    console.error("❌ Gagal membuat laporan:", err);
  }
});

job.start()

describe("Cron Monthly Report", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Test Laporan Cron Job", async () => {
    const laporan = await runMonthlyReportCron();

    expect(laporan).toHaveProperty("id");
    expect(laporan.bulan).toBe(new Date().getMonth() + 1);
    expect(laporan.tahun).toBe(new Date().getFullYear());
    expect(laporan.nomor_laporan).toMatch(/^RPT-\d{4}$/);
  });
});
