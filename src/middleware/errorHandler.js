const AppError = require('../utils/AppError');

const KODE_DEFAULT = {
  400: 'PERMINTAAN_TIDAK_VALID',
  401: 'TIDAK_DIIZINKAN',
  404: 'TIDAK_DITEMUKAN',
  409: 'KONFLIK',
  422: 'VALIDATION_ERROR',
  500: 'KESALAHAN_SERVER',
};

module.exports = (err, req, res, next) => {
  let status = 500;
  let pesan = 'Terjadi kesalahan pada server';
  let kode;

  if (err instanceof AppError) {
    status = err.status;
    pesan = err.message;
    kode = err.code;
  } else if (err.code === 'P2002') {
    status = 409; pesan = 'Data sudah ada (nilai unik duplikat)'; kode = 'DATA_DUPLIKAT';
  } else if (err.code === 'P2025') {
    status = 404; pesan = 'Data tidak ditemukan';
  } else if (err.code === 'P2003') {
    status = 409; pesan = 'Data masih dipakai oleh data lain'; kode = 'DATA_DIPAKAI';
  } else if (err.type === 'entity.parse.failed') {
    status = 400; pesan = 'Format JSON tidak valid'; kode = 'JSON_TIDAK_VALID';
  }

  if (status === 500) console.error(err); // detail hanya di log server

  res.status(status).json({
    error: { pesan, kode: kode || KODE_DEFAULT[status] || 'KESALAHAN' },
  });
};