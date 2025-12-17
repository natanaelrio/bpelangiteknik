-- CreateTable
CREATE TABLE "categoryProduct" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "slugCategory" TEXT NOT NULL,
    "image" TEXT,
    "icon" TEXT,
    "urlYoutube" TEXT,
    "title" TEXT,
    "desc" TEXT,
    "tags" TEXT,

    CONSTRAINT "categoryProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listProduct" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3) NOT NULL,
    "slugProduct" TEXT NOT NULL,
    "saveDraf" BOOLEAN NOT NULL DEFAULT true,
    "descProduct" TEXT,
    "productName" TEXT,
    "stockProduct" INTEGER,
    "descMetaProduct" TEXT,
    "viewProduct" INTEGER DEFAULT 1,
    "subKategoriProduct" TEXT,
    "productType" TEXT,
    "tagProduct" TEXT,
    "productPrice" BIGINT,
    "productDiscount" INTEGER,
    "productPriceFinal" BIGINT,
    "urlYoutube" TEXT,
    "productKategori" INTEGER NOT NULL,

    CONSTRAINT "listProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specProduct" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3) NOT NULL,
    "phase_spec" TEXT,
    "frequency_spec" TEXT,
    "gensetPower_spec" TEXT,
    "ratedPower_spec" TEXT,
    "maxPower_spec" TEXT,
    "ratedACVoltage_spec" TEXT,
    "starting_spec" TEXT,
    "fuelConsumption_spec" TEXT,
    "weight_spec" INTEGER,
    "dimension_spec" TEXT,
    "IdProduct" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "imageProductUtama" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3) NOT NULL,
    "asset_id" TEXT,
    "public_id" TEXT,
    "version" INTEGER,
    "version_id" TEXT,
    "signature" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "resource_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pages" INTEGER,
    "tags" JSONB,
    "bytes" INTEGER,
    "type" TEXT,
    "etag" TEXT,
    "placeholder" BOOLEAN,
    "url" TEXT,
    "secure_url" TEXT,
    "asset_folder" TEXT,
    "display_name" TEXT,
    "original_filename" TEXT,
    "api_key" TEXT,
    "overwritten" BOOLEAN,
    "IdProduct" INTEGER NOT NULL,

    CONSTRAINT "imageProductUtama_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imageProduct" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3) NOT NULL,
    "asset_id" TEXT,
    "public_id" TEXT,
    "version" INTEGER,
    "version_id" TEXT,
    "signature" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "resource_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pages" INTEGER,
    "tags" JSONB,
    "bytes" INTEGER,
    "type" TEXT,
    "etag" TEXT,
    "placeholder" BOOLEAN,
    "url" TEXT,
    "secure_url" TEXT,
    "asset_folder" TEXT,
    "display_name" TEXT,
    "original_filename" TEXT,
    "api_key" TEXT,
    "overwritten" BOOLEAN,
    "IdProduct" INTEGER NOT NULL,

    CONSTRAINT "imageProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart" (
    "IDCart" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3),

    CONSTRAINT "cart_pkey" PRIMARY KEY ("IDCart")
);

-- CreateTable
CREATE TABLE "cartItem" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3),
    "cartId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "checkList" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,

    CONSTRAINT "cartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formPembelian" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3),
    "nama_lengkap_user" VARCHAR(200),
    "alamat_lengkap_user" VARCHAR(200),
    "kode_pos_user" INTEGER,
    "no_hp_user" BIGINT,
    "catatan_pengiriman" VARCHAR(200),
    "cartID" TEXT NOT NULL,

    CONSTRAINT "formPembelian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ongkosKirim" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3),
    "productName" TEXT,
    "price" BIGINT,
    "quantity" INTEGER,
    "cartID" TEXT NOT NULL,

    CONSTRAINT "ongkosKirim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataPesananItem" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3),
    "note" TEXT,
    "productName" TEXT,
    "price" BIGINT,
    "priceOriginal" BIGINT,
    "quantity" INTEGER,
    "methodPayment" TEXT,
    "image" TEXT,
    "slugProduct" TEXT,
    "merchantOrderId" TEXT,
    "status" TEXT,
    "noResi" TEXT,
    "dataPesananId" INTEGER,

    CONSTRAINT "dataPesananItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataPesanan" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3),
    "payment" BOOLEAN NOT NULL DEFAULT false,
    "reference" TEXT NOT NULL,
    "merchantOrderId" TEXT NOT NULL,
    "cartID" TEXT NOT NULL,

    CONSTRAINT "dataPesanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postArtikel" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "viewArtikel" INTEGER DEFAULT 1,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "saveDraf" BOOLEAN NOT NULL DEFAULT true,
    "categoryArtikelId" INTEGER NOT NULL,

    CONSTRAINT "postArtikel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imageProductArtikel" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3) NOT NULL,
    "asset_id" TEXT,
    "public_id" TEXT,
    "version" INTEGER,
    "version_id" TEXT,
    "signature" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "resource_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pages" INTEGER,
    "tags" JSONB,
    "bytes" INTEGER,
    "type" TEXT,
    "etag" TEXT,
    "placeholder" BOOLEAN,
    "url" TEXT,
    "secure_url" TEXT,
    "asset_folder" TEXT,
    "display_name" TEXT,
    "original_filename" TEXT,
    "api_key" TEXT,
    "overwritten" BOOLEAN,
    "IdProductArtikel" INTEGER NOT NULL,

    CONSTRAINT "imageProductArtikel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoryArtikel" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "slugCategory" TEXT NOT NULL,
    "image" TEXT,
    "icon" TEXT,
    "urlYoutube" TEXT,
    "title" TEXT,
    "desc" TEXT,
    "tags" TEXT,

    CONSTRAINT "categoryArtikel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoryProduct_category_key" ON "categoryProduct"("category");

-- CreateIndex
CREATE UNIQUE INDEX "categoryProduct_slugCategory_key" ON "categoryProduct"("slugCategory");

-- CreateIndex
CREATE UNIQUE INDEX "listProduct_slugProduct_key" ON "listProduct"("slugProduct");

-- CreateIndex
CREATE INDEX "listProduct_productKategori_idx" ON "listProduct"("productKategori");

-- CreateIndex
CREATE UNIQUE INDEX "specProduct_IdProduct_key" ON "specProduct"("IdProduct");

-- CreateIndex
CREATE UNIQUE INDEX "imageProductUtama_asset_id_key" ON "imageProductUtama"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "imageProductUtama_public_id_key" ON "imageProductUtama"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "imageProductUtama_IdProduct_key" ON "imageProductUtama"("IdProduct");

-- CreateIndex
CREATE UNIQUE INDEX "imageProduct_asset_id_key" ON "imageProduct"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "imageProduct_public_id_key" ON "imageProduct"("public_id");

-- CreateIndex
CREATE INDEX "imageProduct_IdProduct_idx" ON "imageProduct"("IdProduct");

-- CreateIndex
CREATE UNIQUE INDEX "cart_email_key" ON "cart"("email");

-- CreateIndex
CREATE UNIQUE INDEX "formPembelian_cartID_key" ON "formPembelian"("cartID");

-- CreateIndex
CREATE UNIQUE INDEX "ongkosKirim_cartID_key" ON "ongkosKirim"("cartID");

-- CreateIndex
CREATE UNIQUE INDEX "dataPesanan_reference_key" ON "dataPesanan"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "dataPesanan_merchantOrderId_key" ON "dataPesanan"("merchantOrderId");

-- CreateIndex
CREATE INDEX "dataPesanan_cartID_idx" ON "dataPesanan"("cartID");

-- CreateIndex
CREATE UNIQUE INDEX "postArtikel_slug_key" ON "postArtikel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "imageProductArtikel_asset_id_key" ON "imageProductArtikel"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "imageProductArtikel_public_id_key" ON "imageProductArtikel"("public_id");

-- CreateIndex
CREATE INDEX "imageProductArtikel_IdProductArtikel_idx" ON "imageProductArtikel"("IdProductArtikel");

-- CreateIndex
CREATE UNIQUE INDEX "categoryArtikel_category_key" ON "categoryArtikel"("category");

-- CreateIndex
CREATE UNIQUE INDEX "categoryArtikel_slugCategory_key" ON "categoryArtikel"("slugCategory");

-- AddForeignKey
ALTER TABLE "listProduct" ADD CONSTRAINT "listProduct_productKategori_fkey" FOREIGN KEY ("productKategori") REFERENCES "categoryProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specProduct" ADD CONSTRAINT "specProduct_IdProduct_fkey" FOREIGN KEY ("IdProduct") REFERENCES "listProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imageProductUtama" ADD CONSTRAINT "imageProductUtama_IdProduct_fkey" FOREIGN KEY ("IdProduct") REFERENCES "listProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imageProduct" ADD CONSTRAINT "imageProduct_IdProduct_fkey" FOREIGN KEY ("IdProduct") REFERENCES "listProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartItem" ADD CONSTRAINT "cartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "cart"("IDCart") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartItem" ADD CONSTRAINT "cartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "listProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formPembelian" ADD CONSTRAINT "formPembelian_cartID_fkey" FOREIGN KEY ("cartID") REFERENCES "cart"("IDCart") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ongkosKirim" ADD CONSTRAINT "ongkosKirim_cartID_fkey" FOREIGN KEY ("cartID") REFERENCES "cart"("IDCart") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataPesananItem" ADD CONSTRAINT "dataPesananItem_dataPesananId_fkey" FOREIGN KEY ("dataPesananId") REFERENCES "dataPesanan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataPesanan" ADD CONSTRAINT "dataPesanan_cartID_fkey" FOREIGN KEY ("cartID") REFERENCES "cart"("IDCart") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postArtikel" ADD CONSTRAINT "postArtikel_categoryArtikelId_fkey" FOREIGN KEY ("categoryArtikelId") REFERENCES "categoryArtikel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imageProductArtikel" ADD CONSTRAINT "imageProductArtikel_IdProductArtikel_fkey" FOREIGN KEY ("IdProductArtikel") REFERENCES "postArtikel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
