import { Hono } from 'hono';
import { ProductService } from '../services/product-service';
import {
  CreateProductRequest,
  UpdateProductRequest,
  SearchProductRequest
} from '../models/product-model';
import { rbac } from '../middleware/protected.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

export const productController = new Hono();


productController.post('/', authMiddleware, rbac(['admin']), async (c) => {
  const request = await c.req.json() as CreateProductRequest;
  const response = await ProductService.create(request);

  return c.json({
    data: response
  });
});


productController.get('/', authMiddleware, async (c) => {
  const response = await ProductService.getAll();

  return c.json({
    data: response
  });
});


productController.get('/search', authMiddleware, async (c) => {
  const query = {
    nama: c.req.query('nama'),
    kategori: c.req.query('kategori'),
  } as SearchProductRequest;

  const response = await ProductService.search(query);

  return c.json({
    data: response
  });
});

productController.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const response = await ProductService.get(id);

  return c.json({
    data: response
  });
});


productController.patch('/:id', authMiddleware, rbac(['admin']), async (c) => {
  const id = Number(c.req.param('id'));
  const request = await c.req.json() as UpdateProductRequest;

  const response = await ProductService.update(id, request);

  return c.json({
    data: response
  });
});


productController.delete('/:id', authMiddleware, rbac(['admin']), async (c) => {
  const id = Number(c.req.param('id'));

  const success = await ProductService.delete(id);

  return c.json({
    data: success
  });
});
