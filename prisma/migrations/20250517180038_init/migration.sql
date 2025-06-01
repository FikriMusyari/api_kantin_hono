-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'kasir');

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "harga_jual" DECIMAL(10,2) NOT NULL,
    "harga_beli" DECIMAL(10,2) NOT NULL,
    "kategori" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "nomor_transaksi" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(10,2) NOT NULL,
    "tunai" DECIMAL(10,2) NOT NULL,
    "kembalian" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_transaction" (
    "id" SERIAL NOT NULL,
    "transaksi_id" INTEGER NOT NULL,
    "produk_id" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detail_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "nomor_laporan" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "total_pendapatan" DECIMAL(10,2) NOT NULL,
    "total_pengeluaran" DECIMAL(10,2) NOT NULL,
    "produk_terlaris_id" INTEGER NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_nomor_transaksi_key" ON "transactions"("nomor_transaksi");

-- CreateIndex
CREATE UNIQUE INDEX "reports_nomor_laporan_key" ON "reports"("nomor_laporan");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_transaction" ADD CONSTRAINT "detail_transaction_transaksi_id_fkey" FOREIGN KEY ("transaksi_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_transaction" ADD CONSTRAINT "detail_transaction_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_produk_terlaris_id_fkey" FOREIGN KEY ("produk_terlaris_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
