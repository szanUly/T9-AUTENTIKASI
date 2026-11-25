# Tugas 9 - Autentikasi & Otorisasi

## Identitas
- Nama : Sri Zulaini Ulya
- NIM  : F1D02410096
- Kasus ETS : Products API (tabel `products` dan `orders`)

## Cara Menjalankan

Prasyarat: Node.js terpasang dan MySQL sedang berjalan (misalnya lewat Laragon, klik **Start All**).

1. Kloning repository, lalu masuk ke folder proyek.

   ```bash
   git clone https://github.com/szanuly/T9-AUTENTIKASI.git
   cd T9-AUTENTIKASI
   ```

2. Pasang dependensi.

   ```bash
   npm install
   ```

3. Salin `.env.example` menjadi `.env`, lalu isi nilainya.

   ```bash
   copy .env.example .env      # Windows
   # cp .env.example .env      # macOS/Linux
   ```

   ```env
   DATABASE_URL="mysql://root:@localhost:3306/pwl26_mini_project"
   PORT=3000
   JWT_SECRET="isi_dengan_string_acak_buatan_sendiri"
   ```

   Secret JWT dibuat sendiri, misalnya dengan perintah berikut, lalu hasilnya ditempel ke `JWT_SECRET`. Nilai asli hanya berada di `.env` yang tidak di-commit.

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Buat tabel lewat migrasi. Perintah ini membuat database bila belum ada, menerapkan migrasi ETS (`init`) dan migrasi baru `tambah_user`, lalu membuat Prisma Client.

   ```bash
   npx prisma migrate dev
   ```

5. Isi data produk awal (seed dapat diulang).

   ```bash
   npx prisma db seed
   ```

6. Jalankan server di `http://localhost:3000`.

   ```bash
   npm run dev
   ```

Tabel `users` dibuat lewat model Prisma dan migrasi `tambah_user`, jadi tidak ada SQL manual. Strukturnya:

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT, PK, auto increment | Identitas pengguna |
| email | VARCHAR(100), UNIQUE | Email pengguna |
| passwordHash | VARCHAR(255) | Hash bcrypt (cost 10), bukan password asli |
| createdAt | DATETIME, default `now()` | Waktu akun dibuat |

## Akun Uji

Akun dibuat lewat `POST /auth/register` (tanpa seeder). Password di bawah adalah password sembarang untuk keperluan tugas.

| Email | Password |
|---|---|
| srizulainiulya@gmail.com | f1d02410096 |

## Struktur Proyek

```
T9-AUTENTIKASI/
├── prisma/
│   ├── migrations/
│   │   ├── ..._init/                 (lama: tabel products dan orders)
│   │   └── ..._tambah_user/          (BARU: tabel users)
│   ├── schema.prisma                 (DIUBAH)
│   └── seed.js
├── screenshot/
├── src/
│   ├── routes/        auth.routes.js (BARU), product.routes.js (DIUBAH), order.routes.js (DIUBAH)
│   ├── controllers/   auth.controller.js (BARU), product.controller.js, order.controller.js
│   ├── services/      auth.service.js (BARU), product.service.js, order.service.js
│   ├── data/          user.data.js (BARU), prisma.js, product.data.js, order.data.js
│   ├── middleware/    auth.js (BARU), errorHandler.js (DIUBAH), validate.js (DIUBAH), logger.js
│   ├── validators/    auth.validator.js (BARU), product.validator.js, order.validator.js
│   ├── utils/         AppError.js
│   ├── app.js         (DIUBAH)
│   └── server.js
├── .env.example       (DIUBAH)
├── requests.http      (BARU)
└── README.md
```

| File | Status | Tugas |
|---|---|---|
| `prisma/schema.prisma` | Diubah | Menambah model `User` yang dipetakan ke tabel `users`. |
| `prisma/migrations/..._tambah_user/` | Baru | Menyimpan migrasi yang membuat tabel `users`. |
| `src/routes/auth.routes.js` | Baru | Mendefinisikan `POST /auth/register`, `POST /auth/login`, dan `GET /auth/saya`. |
| `src/controllers/auth.controller.js` | Baru | Menerima request autentikasi dan mengirim response. |
| `src/services/auth.service.js` | Baru | Menjalankan logika register (hash bcrypt, deteksi email duplikat) dan login (bandingkan hash, buat token JWT). |
| `src/data/user.data.js` | Baru | Menjalankan query tabel `users`; `select` mencegah `passwordHash` ikut dikembalikan. |
| `src/validators/auth.validator.js` | Baru | Memuat skema Joi untuk register dan login. |
| `src/middleware/auth.js` | Baru | Berisi `butuhLogin` yang memeriksa header Bearer dengan `jwt.verify` dan meneruskan error ke `errorHandler`. |
| `src/middleware/errorHandler.js` | Diubah | Mengubah format jawaban error menjadi `{ error: { pesan, kode } }`. |
| `src/middleware/validate.js` | Diubah | Menambah kode `VALIDATION_ERROR` dan memeriksa body kosong lewat Joi (jawaban 422). |
| `src/routes/product.routes.js`, `order.routes.js` | Diubah | Memasang `butuhLogin` pada endpoint wajib login, sebelum validasi. |
| `src/app.js` | Diubah | Mendaftarkan route `/auth`. |
| `.env.example` | Diubah | Menambah contoh `JWT_SECRET` tanpa nilai asli. |
| `requests.http` | Baru | Memuat kasus uji untuk REST Client dengan variabel `@token`. |

Urutan middleware pada endpoint wajib login: `butuhLogin` -> validasi -> controller -> service -> data.

## Endpoint

| Method | URL | Akses | Status |
|---|---|---|---|
| POST | `/auth/register` | Publik | 201, 409 `EMAIL_DUPLIKAT`, 422 `VALIDATION_ERROR` |
| POST | `/auth/login` | Publik | 200, 401 `LOGIN_GAGAL`, 422 `VALIDATION_ERROR` |
| GET | `/auth/saya` | Wajib login | 200, 401 |
| GET | `/products` (daftar, paginasi, filter) | Publik | 200 |
| GET | `/products/:id` | Publik | 200, 404 |
| POST | `/products` | Wajib login | 201, 401, 409, 422 |
| PUT | `/products/:id` | Wajib login | 200, 401, 404, 409, 422 |
| DELETE | `/products/:id` | Wajib login | 204, 401, 404 |
| GET | `/orders` (tabel kedua dengan `include`) | Publik | 200 |
| POST | `/orders` (transaksi dua tabel) | Wajib login | 201, 401, 404, 409, 422 |

Kode error autentikasi:

| Situasi | Status | Kode |
|---|---|---|
| Header `Authorization` tidak ada atau bukan Bearer | 401 | `TOKEN_DIPERLUKAN` |
| Token rusak, signature salah, atau expired | 401 | `TOKEN_TIDAK_VALID` |
| Email tidak terdaftar atau password salah | 401 | `LOGIN_GAGAL` ("Email atau password salah") |

Format error yang seragam:

```json
{ "error": { "pesan": "Email atau password salah", "kode": "LOGIN_GAGAL" } }
```

Ringkasan aturan: password disimpan sebagai hash bcrypt (cost 10) di kolom `passwordHash` dan tidak pernah dikirim ke client; token JWT berisi `{ id }`, berlaku `2h`, dan ditandatangani dengan `JWT_SECRET` buatan sendiri; email divalidasi berformat valid maksimal 100 karakter, sedangkan password berupa string 8 sampai 72 karakter (bcrypt memotong input yang lebih panjang dari 72).

## Pengujian

Pengujian dijalankan di Postman, dan kasus yang sama tersedia di `requests.http`. Setiap gambar memperlihatkan identitas saya pada email akun uji atau nama produk.

**Tabel `users`**

Kolom `passwordHash` berisi hash bcrypt berawalan `$2b$10$`, bukan password asli.

![Tabel users di phpMyAdmin](screenshot/01.png)

**Register dan login**

`POST /auth/register` berhasil dengan status 201 dan respons hanya `{ id, email }`.

![Register 201](screenshot/07.png)

Register ulang dengan email yang sama dijawab 409 `EMAIL_DUPLIKAT`.

![Register duplikat 409](screenshot/08.png)

Register dengan data yang tidak valid dijawab 422 `VALIDATION_ERROR`.

![Register validasi 422](screenshot/09.png)

`POST /auth/login` berhasil dengan status 200 dan respons berisi `token`.

![Login 200](screenshot/10.png)

Login dengan password salah dijawab 401 `LOGIN_GAGAL`.

![Login password salah 401](screenshot/11.png)

Login dengan email tidak terdaftar dijawab 401 `LOGIN_GAGAL` dengan pesan yang sama persis.

![Login email tidak terdaftar 401](screenshot/12.png)

**Halaman publik dan wajib login**

Request 3 (halaman publik tanpa token, 200) dan request 4 (wajib login tanpa token, 401) ditampilkan berdampingan.

![Publik](screenshot/02.png)

![wajib login](screenshot/02a.png)

Request 5, yaitu `POST /products` dengan header `Authorization: Bearer ...`, berhasil dengan status 201.

![POST products dengan token 201](screenshot/03.png)

`GET /auth/saya` tanpa token dijawab 401 `TOKEN_DIPERLUKAN`.

![Auth saya tanpa token 401](screenshot/13.png)

`GET /auth/saya` dengan token dijawab 200 dan memuat `id`.

![Auth saya dengan token 200](screenshot/14.png)

`PUT` atau `DELETE` produk tanpa token dijawab 401.

![PUT DELETE tanpa token 401](screenshot/15.png)

`GET /orders` (endpoint tabel kedua dengan `include`) tetap publik dan dijawab 200 tanpa token.

![GET orders publik 200](screenshot/16.png)

`POST /orders` (endpoint transaksi) tanpa token dijawab 401.

![POST orders tanpa token 401](screenshot/17.png)

`POST /orders` dengan token berhasil dengan status 201.

![POST orders dengan token 201](screenshot/18.png)

**requests.http**

Berkas `requests.http` di VS Code memperlihatkan variabel `@token` dan seluruh kasus uji, termasuk dua percobaan.

![requests.http di VS Code](screenshot/06.png)

## Dua Percobaan

### Percobaan 1: Token Dipalsukan

**Hasil.** Setelah login, payload token saya ubah (misalnya `id` menjadi angka lain) tanpa mengetahui `JWT_SECRET`, lalu token itu dikirim ke endpoint wajib login. Jawabannya 401 `TOKEN_TIDAK_VALID`.

Payload token terbaca tanpa secret apa pun:

![Payload token dibaca](screenshot/04a.png)

![Payload token diubah](screenshot/04b.png)

Token hasil ubahan ditolak:

![Percobaan 1: token dipalsukan](screenshot/04.png)

**Penjelasan.** Payload JWT hanya di-encode dengan Base64, bukan dienkripsi, sehingga siapa pun dapat membaca dan mengubahnya. Namun signature dihitung dari header dan payload memakai `JWT_SECRET`, jadi setelah payload berubah signature lama tidak lagi cocok. `jwt.verify` di server menemukan ketidakcocokan itu dan menolak token.

### Percobaan 2: Token Expired

**Hasil.** `expiresIn` di `auth.service.js` saya ubah sementara menjadi `'5s'`, lalu login, menunggu 6 detik, dan mengirim request ke endpoint wajib login. Jawabannya 401 `TOKEN_TIDAK_VALID`. Nilai sudah dikembalikan ke `'2h'` sebelum commit.

Pengaturan sementara `expiresIn: '5s'`:

![expiresIn 5s](screenshot/05a.png)

Token yang sudah lewat 6 detik ditolak:

![Percobaan 2: token expired](screenshot/05.png)

**Penjelasan.** Saat token dibuat, waktu kedaluwarsanya disimpan sebagai klaim `exp` di dalam payload yang ikut ditandatangani. Setiap kali `jwt.verify` dijalankan, server membandingkan `exp` dengan waktu saat itu dan menolak token yang sudah lewat. Karena informasinya berada di dalam token itu sendiri, server tidak perlu menyimpan catatan apa pun.

## Deklarasi Penggunaan AI

| Bagian | Alat AI | Dipakai untuk apa | Cara saya memeriksa hasilnya |
|--------|---------|-------------------|------------------------------|
| Dua percobaan | Claude | Penjelasan konsep payload JWT dan klaim `exp` | Mencoba sendiri token yang diubah dan token expired, lalu menjelaskannya dengan kata-kata sendiri |
| Debugging | Claude | Membantu menelusuri kesalahan, yaitu `@prisma/client did not initialize`, `P1001` karena MySQL belum menyala, database yang belum muncul di phpMyAdmin, route `/auth` yang dijawab 404, dan `ECONNREFUSED` | Membaca pesan error di terminal dan mencoba perbaikan satu per satu sampai hasilnya sesuai |
| Dokumentasi | Claude | Kerangka dan teks README ini serta daftar screenshot | Membaca ulang seluruh isi dan menyesuaikannya dengan hasil pengerjaan saya |

**Contoh prompt:**

- "list apa saja yang harus di ss untuk dimasukkan ke file screenshot"

**Pernyataan:** Saya menggunakan AI pada bagian yang tertulis di tabel. Bagian lain saya kerjakan sendiri, yaitu pembuatan tabel users, contoh errorHandler, register dan login, pengujian di Postman, pengambilan screenshot, penyesuaian kode saat terjadi error, serta penjelasan dan kesimpulan di README ini.

## Kesimpulan & Kendala

**1. Mengapa password di-hash, bukan dienkripsi?**

Hash itu cuma jalan satu arah. Jadi password asli tidak bisa dihitung balik dari hash. Kalau database bocor, penyerang cuma dapat hash-nya saja. Enkripsi bisa dua arah. Artinya, siapa pun yang pegang kunci bisa membuka semua password sekaligus. Waktu login, server tinggal mencocokkan password yang diketik dengan hash yang tersimpan pakai `bcrypt.compare`. Bcrypt juga memakai salt dan cost 10, jadi lambat kalau dicoba berulang kali.

**2. Mengapa pesan login gagal dibuat sama untuk email tidak terdaftar dan password salah?**

Kalau pesannya beda, penyerang bisa menebak email mana yang terdaftar. Caranya dengan mencoba banyak email lalu melihat pesan yang muncul. Dengan satu pesan yang sama ("Email atau password salah"), kedua kasus itu tidak bisa dibedakan.

**3. Apa bedanya halaman publik dan halaman wajib login pada proyek ini, dan dari mana server tahu token sah tanpa menyimpannya?**

Halaman publik adalah endpoint yang cuma membaca atau membuka akses: register, login, daftar dan detail produk, serta daftar pesanan. Halaman wajib login adalah endpoint yang mengubah data atau memerlukan identitas: tambah, ubah, dan hapus produk, endpoint transaksi `POST /orders`, serta `GET /auth/saya`. Server tahu token sah lewat `jwt.verify`. Caranya dengan menghitung ulang signature pakai `JWT_SECRET` miliknya, lalu mencocokkannya dan memeriksa waktu `exp`. Semua informasi itu ada di dalam token, jadi server tidak menyimpan daftar token.

**Kendala dan solusi:**

| Kendala | Solusi |
|---|---|
| Server tidak mau jalan dengan pesan `@prisma/client did not initialize yet` setelah proyek ETS disalin ke folder baru | Menjalankan `npx prisma generate` karena Prisma Client belum dibuat di folder baru |
| Migrasi gagal dengan `P1001: Can't reach database server` | Menyalakan MySQL lewat Laragon (**Start All**), lalu menjalankan ulang migrasi |
| Database tidak muncul di phpMyAdmin | Menjalankan ulang `npx prisma migrate dev` dan `npx prisma db seed` agar database dan tabel dibuat lagi dari folder migrasi |
