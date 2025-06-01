import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";
import { kasirOnly, ownerOnly } from "../middleware/protected.middleware";
import { CreateTransaksiRequest, SearchTransaksiRequest } from "../models/transaction-model";
import { TransaksiService } from "../services/transaction-service";
import type { User } from "@prisma/client";
import { ApplicationVariables } from "../models/app-model";

export const transaksiController = new Hono<{ Variables: ApplicationVariables }>();


transaksiController.post('/', authMiddleware, kasirOnly, async (c) => {
  const user = c.get('user') as User;

  const request = await c.req.json() as CreateTransaksiRequest;
  const response = await TransaksiService.create(user, request);

  return c.json({ data: response });
});


transaksiController.get('/', authMiddleware,  async (c) => {
  const user = c.get('user') as User;

  const response = await TransaksiService.getAll(user);
  return c.json({ data: response });
});


transaksiController.delete('/:id', authMiddleware, ownerOnly, async (c) => {
  const user = c.get('user') as User;

  const id = Number(c.req.param('id'));
  const success = await TransaksiService.delete(user, id);

  return c.json({ data: success });
});


transaksiController.get('/search', authMiddleware, async (c) => {
  const user = c.get('user') as User;

  const query = {
    user: c.req.query('user'),
    produk: c.req.query('produk'),
    tanggal: c.req.query('tanggal'),
  } as SearchTransaksiRequest;

  const response = await TransaksiService.search(query, user);

  return c.json({ 
    data: response 
  });
});
