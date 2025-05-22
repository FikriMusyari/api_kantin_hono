import {Produk} from "@prisma/client";
import {
    ProductResponse,
    CreateProductRequest,
    SearchProductRequest,
    toProductResponse,
    UpdateProductRequest
} from "../models/product-model";
import { ProductValidation } from "../validation/product-validation";
import { prisma } from "../config/db";
import {HTTPException} from "hono/http-exception";
import { Decimal } from "@prisma/client/runtime/library";


export class ProductService {

    static async create(request: CreateProductRequest): Promise<ProductResponse> {
        request = ProductValidation.CREATE.parse(request)

        const existing = await prisma.produk.findFirst({
    where: {
      nama: {
        equals: request.nama,
        mode: 'insensitive',
      }
    }
  });


  if (existing) {
    throw new HTTPException(400,{
      message: "Product with the same name already exists"
    });
  }

         const product = await prisma.produk.create({
      data: {
        nama: request.nama,
        kategori: request.kategori,
        harga_jual: new Decimal(request.harga_jual),
        harga_beli: new Decimal(request.harga_beli),
      },
    });

        return toProductResponse(product)
    }

    static async get(id: number): Promise<ProductResponse> {
    ProductValidation.GET.parse(id);

    const product = await prisma.produk.findUnique({
      where: { id },
    });

    if (!product) {
      throw new HTTPException(404, {
        message: "Product not found",
      });
    }

    return toProductResponse(product);
  }

  static async getAll(): Promise<ProductResponse[]> {
    const products: Produk[] = await prisma.produk.findMany();
    if(products.length === 0){
      throw new HTTPException(404,{
        message: "Product Unavailable"
      })
    }
  return products.map(toProductResponse);
  }

    static async update(id: number, request: UpdateProductRequest): Promise<ProductResponse> {
    request = ProductValidation.UPDATE.parse({ id, ...request });

    const updateData: any = {};
    if (request.nama !== undefined) updateData.nama = request.nama;
    if (request.kategori !== undefined) updateData.kategori = request.kategori;
    if (request.harga_jual !== undefined) updateData.harga_jual = new Decimal(request.harga_jual);
    if (request.harga_beli !== undefined) updateData.harga_beli = new Decimal(request.harga_beli);

    try {
      const updatedProduct = await prisma.produk.update({
        where: { id },
        data: updateData,
      });

      return toProductResponse(updatedProduct);
    } catch (error) {
      throw new HTTPException(404, {
        message: "Product not found",
      });
    }
  }
  
   static async delete(id: number): Promise<boolean> {
    ProductValidation.DELETE.parse(id);

    try {
      await prisma.produk.delete({ where: { id } });
      return true;
    } catch (error) {
      throw new HTTPException(404, {
        message: "Product not found",
      });
    }
  }

    static async search(filter: SearchProductRequest): Promise<ProductResponse[]> {
        filter = ProductValidation.SEARCH.parse(filter);

        const products = await prisma.produk.findMany({
        where: {
            nama: filter.nama ? { contains: filter.nama, mode: "insensitive" } : undefined,
            kategori: filter.kategori ? { equals: filter.kategori } : undefined,
        },
        });

        if (products.length === 0) {
      throw new HTTPException(404, {
        message: "Product not found",
      });
    }

        return products.map(toProductResponse);
    }

}