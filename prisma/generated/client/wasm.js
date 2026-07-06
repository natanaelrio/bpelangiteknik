
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.19.1
 * Query Engine version: 69d742ee20b815d88e17e54db4a2a7a3b30324e3
 */
Prisma.prismaVersion = {
  client: "5.19.1",
  engine: "69d742ee20b815d88e17e54db4a2a7a3b30324e3"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.CategoryProductUtamaScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  category: 'category',
  slugCategory: 'slugCategory',
  image: 'image',
  icon: 'icon',
  urlYoutube: 'urlYoutube',
  title: 'title',
  desc: 'desc',
  tags: 'tags'
};

exports.Prisma.CategoryProductScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  category: 'category',
  slugCategory: 'slugCategory',
  image: 'image',
  icon: 'icon',
  urlYoutube: 'urlYoutube',
  title: 'title',
  desc: 'desc',
  tags: 'tags',
  categoryProductUtamaId: 'categoryProductUtamaId'
};

exports.Prisma.ListProductScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  slugProduct: 'slugProduct',
  saveDraf: 'saveDraf',
  descProduct: 'descProduct',
  productName: 'productName',
  stockProduct: 'stockProduct',
  descMetaProduct: 'descMetaProduct',
  viewProduct: 'viewProduct',
  subKategoriProduct: 'subKategoriProduct',
  productType: 'productType',
  tagProduct: 'tagProduct',
  productPrice: 'productPrice',
  productDiscount: 'productDiscount',
  productPriceFinal: 'productPriceFinal',
  urlYoutube: 'urlYoutube',
  productKategori: 'productKategori',
  sold: 'sold',
  username: 'username',
  spekNew: 'spekNew',
  weightProduct: 'weightProduct',
  heightProduct: 'heightProduct',
  lengthProduct: 'lengthProduct',
  widthProduct: 'widthProduct',
  updateDate: 'updateDate'
};

exports.Prisma.FMerekScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SpecProductScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  phase_spec: 'phase_spec',
  frequency_spec: 'frequency_spec',
  gensetPower_spec: 'gensetPower_spec',
  ratedPower_spec: 'ratedPower_spec',
  maxPower_spec: 'maxPower_spec',
  ratedACVoltage_spec: 'ratedACVoltage_spec',
  starting_spec: 'starting_spec',
  fuelConsumption_spec: 'fuelConsumption_spec',
  weight_spec: 'weight_spec',
  dimension_spec: 'dimension_spec',
  IdProduct: 'IdProduct'
};

exports.Prisma.ImageProductUtamaScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  asset_id: 'asset_id',
  public_id: 'public_id',
  version: 'version',
  version_id: 'version_id',
  signature: 'signature',
  width: 'width',
  height: 'height',
  format: 'format',
  resource_type: 'resource_type',
  created_at: 'created_at',
  pages: 'pages',
  tags: 'tags',
  bytes: 'bytes',
  type: 'type',
  etag: 'etag',
  placeholder: 'placeholder',
  url: 'url',
  secure_url: 'secure_url',
  asset_folder: 'asset_folder',
  display_name: 'display_name',
  original_filename: 'original_filename',
  api_key: 'api_key',
  overwritten: 'overwritten',
  IdProduct: 'IdProduct'
};

exports.Prisma.ImageProductScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  asset_id: 'asset_id',
  public_id: 'public_id',
  version: 'version',
  version_id: 'version_id',
  signature: 'signature',
  width: 'width',
  height: 'height',
  format: 'format',
  resource_type: 'resource_type',
  created_at: 'created_at',
  pages: 'pages',
  tags: 'tags',
  bytes: 'bytes',
  type: 'type',
  etag: 'etag',
  placeholder: 'placeholder',
  url: 'url',
  secure_url: 'secure_url',
  asset_folder: 'asset_folder',
  display_name: 'display_name',
  original_filename: 'original_filename',
  api_key: 'api_key',
  overwritten: 'overwritten',
  IdProduct: 'IdProduct'
};

exports.Prisma.VoucherScalarFieldEnum = {
  id: 'id',
  kode: 'kode',
  diskon: 'diskon',
  expiredAt: 'expiredAt',
  nominal: 'nominal',
  tipe: 'tipe',
  harga: 'harga'
};

exports.Prisma.CartScalarFieldEnum = {
  IDCart: 'IDCart',
  email: 'email',
  name: 'name',
  avatar: 'avatar',
  id: 'id',
  start: 'start',
  end: 'end',
  voucherId: 'voucherId'
};

exports.Prisma.CartItemScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  cartId: 'cartId',
  productId: 'productId',
  quantity: 'quantity',
  checkList: 'checkList',
  note: 'note'
};

exports.Prisma.FormPembelianScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  nama_lengkap_user: 'nama_lengkap_user',
  alamat_lengkap_user: 'alamat_lengkap_user',
  kode_pos_user: 'kode_pos_user',
  no_hp_user: 'no_hp_user',
  catatan_pengiriman: 'catatan_pengiriman',
  cartID: 'cartID',
  city: 'city',
  province: 'province',
  alamat_detail: 'alamat_detail'
};

exports.Prisma.OngkosKirimScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  productName: 'productName',
  price: 'price',
  quantity: 'quantity',
  cartID: 'cartID'
};

exports.Prisma.DataPesananItemScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  note: 'note',
  productName: 'productName',
  price: 'price',
  priceOriginal: 'priceOriginal',
  quantity: 'quantity',
  methodPayment: 'methodPayment',
  image: 'image',
  slugProduct: 'slugProduct',
  merchantOrderId: 'merchantOrderId',
  status: 'status',
  noResi: 'noResi',
  dataPesananId: 'dataPesananId'
};

exports.Prisma.DataPesananScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  payment: 'payment',
  reference: 'reference',
  merchantOrderId: 'merchantOrderId',
  cartID: 'cartID',
  alamat_lengkap_user: 'alamat_lengkap_user',
  catatan_pengiriman: 'catatan_pengiriman',
  kode_pos_user: 'kode_pos_user',
  nama_lengkap_user: 'nama_lengkap_user',
  no_hp_user: 'no_hp_user',
  diskon: 'diskon',
  kode: 'kode',
  alamat_detail: 'alamat_detail',
  nota_url: 'nota_url',
  payment_info: 'payment_info',
  diskon_nominal: 'diskon_nominal'
};

exports.Prisma.SuratPenawaranScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  name: 'name',
  email: 'email',
  noHP: 'noHP',
  nameProduct: 'nameProduct',
  note: 'note',
  slugProduct: 'slugProduct',
  sales: 'sales'
};

exports.Prisma.PostArtikelScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  viewArtikel: 'viewArtikel',
  content: 'content',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  saveDraf: 'saveDraf',
  categoryArtikelId: 'categoryArtikelId',
  end: 'end',
  start: 'start'
};

exports.Prisma.TagArtikelScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ImageProductArtikelScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  asset_id: 'asset_id',
  public_id: 'public_id',
  version: 'version',
  version_id: 'version_id',
  signature: 'signature',
  width: 'width',
  height: 'height',
  format: 'format',
  resource_type: 'resource_type',
  created_at: 'created_at',
  pages: 'pages',
  tags: 'tags',
  bytes: 'bytes',
  type: 'type',
  etag: 'etag',
  placeholder: 'placeholder',
  url: 'url',
  secure_url: 'secure_url',
  asset_folder: 'asset_folder',
  display_name: 'display_name',
  original_filename: 'original_filename',
  api_key: 'api_key',
  overwritten: 'overwritten',
  IdProductArtikel: 'IdProductArtikel'
};

exports.Prisma.CategoryArtikelScalarFieldEnum = {
  id: 'id',
  start: 'start',
  end: 'end',
  category: 'category',
  slugCategory: 'slugCategory',
  image: 'image',
  icon: 'icon',
  urlYoutube: 'urlYoutube',
  title: 'title',
  desc: 'desc',
  tags: 'tags'
};

exports.Prisma.SalesScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  numberForm: 'numberForm',
  numberWA: 'numberWA',
  clickCountForm: 'clickCountForm',
  clickCountWA: 'clickCountWA',
  percentWA: 'percentWA',
  percentForm: 'percentForm'
};

exports.Prisma.SalesPenawaranScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  invoiceNumber: 'invoiceNumber',
  customerName: 'customerName',
  customerPhone: 'customerPhone',
  PICcustomerName: 'PICcustomerName',
  salesName: 'salesName',
  salesPhone: 'salesPhone',
  selectedBank: 'selectedBank',
  notes: 'notes',
  includePPN: 'includePPN',
  totalHargaSatuan: 'totalHargaSatuan',
  totalKeseluruhan: 'totalKeseluruhan',
  totalQty: 'totalQty',
  ppn: 'ppn',
  grandTotal: 'grandTotal'
};

exports.Prisma.SalesPenawaranItemScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  productName: 'productName',
  qty: 'qty',
  productPriceFinal: 'productPriceFinal',
  salesPenawaranId: 'salesPenawaranId'
};

exports.Prisma.SalesProgressScalarFieldEnum = {
  id: 'id',
  salesName: 'salesName',
  salesCompany: 'salesCompany',
  nama: 'nama',
  alamatLengkap: 'alamatLengkap',
  alamatKota: 'alamatKota',
  nomorHp: 'nomorHp',
  sumber: 'sumber',
  status: 'status',
  statusCatatan: 'statusCatatan',
  nomorInvoice: 'nomorInvoice',
  notesInvoice: 'notesInvoice',
  invoiceCreatedAt: 'invoiceCreatedAt',
  dpNumber: 'dpNumber',
  notesDP: 'notesDP',
  dpCreatedAt: 'dpCreatedAt',
  spbb: 'spbb',
  spbbCreatedAt: 'spbbCreatedAt',
  crosscheck: 'crosscheck',
  crosscheckStatus: 'crosscheckStatus',
  crosscheckNotes: 'crosscheckNotes',
  fakturPajak: 'fakturPajak',
  totalUnit: 'totalUnit',
  totalDeal: 'totalDeal',
  dpp: 'dpp',
  ppn: 'ppn',
  totalPayment: 'totalPayment',
  sisaPayment: 'sisaPayment',
  paymentStatus: 'paymentStatus',
  RekeningName: 'RekeningName',
  remarks: 'remarks',
  remarksPajak: 'remarksPajak',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalesProgressItemScalarFieldEnum = {
  id: 'id',
  salesProgressId: 'salesProgressId',
  brand: 'brand',
  namaBarang: 'namaBarang',
  kodeBarang: 'kodeBarang',
  kategoriBarang: 'kategoriBarang',
  qty: 'qty',
  hargaUnit: 'hargaUnit',
  subtotalUnit: 'subtotalUnit',
  hargaDeal: 'hargaDeal',
  subtotalDeal: 'subtotalDeal',
  note: 'note',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalesLogScalarFieldEnum = {
  id: 'id',
  salesProgressId: 'salesProgressId',
  actorName: 'actorName',
  actorRole: 'actorRole',
  action: 'action',
  fieldName: 'fieldName',
  oldValue: 'oldValue',
  newValue: 'newValue',
  note: 'note',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  categoryProductUtama: 'categoryProductUtama',
  categoryProduct: 'categoryProduct',
  listProduct: 'listProduct',
  fMerek: 'fMerek',
  specProduct: 'specProduct',
  imageProductUtama: 'imageProductUtama',
  imageProduct: 'imageProduct',
  voucher: 'voucher',
  cart: 'cart',
  cartItem: 'cartItem',
  formPembelian: 'formPembelian',
  ongkosKirim: 'ongkosKirim',
  dataPesananItem: 'dataPesananItem',
  dataPesanan: 'dataPesanan',
  suratPenawaran: 'suratPenawaran',
  postArtikel: 'postArtikel',
  tagArtikel: 'tagArtikel',
  imageProductArtikel: 'imageProductArtikel',
  categoryArtikel: 'categoryArtikel',
  sales: 'sales',
  salesPenawaran: 'salesPenawaran',
  salesPenawaranItem: 'salesPenawaranItem',
  SalesProgress: 'SalesProgress',
  SalesProgressItem: 'SalesProgressItem',
  SalesLog: 'SalesLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
