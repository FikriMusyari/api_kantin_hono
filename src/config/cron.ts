import { CronJob } from 'cron';
import { LaporanService } from "../services/laporan-service";

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


job.start();
