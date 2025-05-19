// laporan.controller.ts
import { Hono } from "hono";
import { LaporanService } from "../services/laporan-service";
import { authMiddleware } from "../middleware/auth.middleware";
import { rbac } from "../middleware/protected.middleware";

export const laporanController = new Hono();

laporanController.get("/", authMiddleware, rbac(['admin']), async (c) => {
    const bulanRaw = c.req.query("bulan");
  const tahunRaw = c.req.query("tahun");

  const bulan = bulanRaw !== undefined ? Number(bulanRaw) : undefined;
  const tahun = tahunRaw !== undefined ? Number(tahunRaw) : undefined;

  const laporan = await LaporanService.getReports(bulan, tahun);
  return c.json(laporan);
});
