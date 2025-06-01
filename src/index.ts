import {Hono} from 'hono';
import { cors } from 'hono/cors';
import {logger} from 'hono/logger'
import { serve } from 'bun';
import "../src/config/cron"
import {userController} from "./controllers/user.controller";
import {HTTPException} from "hono/http-exception";
import {ZodError} from "zod";
import { productController } from './controllers/product.controller';
import { transaksiController } from './controllers/transaction.controller';
import { laporanController } from './controllers/laporan.controller';

const app = new Hono()
const { APP_PORT }: NodeJS.ProcessEnv = process.env;

app.use("*", logger()).use("*", cors());

app.get('/', (c) => {
    return c.text('Error 404 URL Not Found')
})

app.route('/api/users', userController)
app.route('/api/products', productController)
app.route('/api/transactions', transaksiController)
app.route('/api/reports', laporanController)

app.onError(async (err, c) => {
    if (err instanceof HTTPException) {
        c.status(err.status)
        return c.json({
            errors: err.message
        })
    } else if (err instanceof ZodError) {
        c.status(400)
        return c.json({
            errors: err.message
        })
    } else {
        c.status(500)
        return c.json({
            errors: err.message
        })
    }
})


serve({
  fetch: app.fetch,
  port: APP_PORT || 4000,      
});