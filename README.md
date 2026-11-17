# KlipKomen

Studio desain kartu komentar & kutipan sosial media dengan ekspor PNG transparan resolusi tinggi (1x–3x), dukungan multi-bahasa (`id` & `en`), 12 gaya kartu, dan efek estetis (kemiringan, washi tape, pushpin, depth stack).

---

## 1. Struktur Folder Proyek

```text
├── index.html                  # Entry HTML + Google Fonts (Plus Jakarta Sans & Fraunces)
├── package.json                # Dependensi & script build/deploy
├── tsconfig.json               # Konfigurasi TypeScript
├── vite.config.ts              # Konfigurasi Vite + Tailwind CSS v4
├── wrangler.jsonc              # Konfigurasi deploy Cloudflare (Workers Static Assets)
├── .env                        # Environment variable channel (beta / publish)
└── src/
    ├── main.tsx                # Entry React + I18nProvider
    ├── App.tsx                 # Orkestrasi state utama studio
    ├── index.css               # Tailwind CSS v4 & dark mode variant
    ├── types/index.ts          # Definisi tipe TypeScript
    ├── locales/                # File bahasa (Indonesian & English)
    │   ├── id.json
    │   ├── en.json
    │   └── index.ts
    ├── hooks/useI18n.tsx       # Hook & Context pengubah bahasa
    ├── constants/presets.ts    # Konstanta warna, preset template, & default state
    ├── utils/
    │   ├── richText.ts         # Parser format **bold**, *italic*, __underline__, ==highlight==
    │   ├── surfaceTokens.ts    # Token tema, border, bayangan, & tilt
    │   └── canvasExport.ts     # Engine ekspor PNG (Live DOM + Canvas fallback)
    └── components/
        ├── HeaderBar.tsx
        ├── StageViewport.tsx
        ├── CommentCardPreview.tsx
        ├── RichTextRenderer.tsx
        ├── RichCommentEditor.tsx
        ├── Modals.tsx
        ├── ToastStack.tsx
        └── inspector/
            ├── InspectorPanel.tsx
            ├── ContentTab.tsx
            ├── StyleTab.tsx
            └── ExportTab.tsx
```

---

## 2. Cara Membuka & Menjalankan di VS Code

1. Buka **VS Code**.
2. Klik **File > Open Folder...** lalu pilih folder ini (`D:\Koding\klipkomen-beta` atau `D:\Koding\klipkomen-publish`).
3. Buka terminal di VS Code (`Ctrl + ~` atau menu **Terminal > New Terminal**).
4. Install dependensi (cukup sekali):
   ```bash
   npm install
   ```
5. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
6. Buka link `http://localhost:5173` yang muncul di terminal.

---

## 3. Cara Push ke GitHub

1. Buat repository baru di [GitHub](https://github.com/new) (misal: `klipkomen-beta` atau `klipkomen`).
2. Di terminal VS Code, jalankan:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: KlipKomen modular studio"
   git branch -M main
   git remote add origin https://github.com/USERNAME_KAMU/NAMA_REPO.git
   git push -u origin main
   ```

---

## 4. Cara Hosting di Cloudflare

Karena KlipKomen adalah aplikasi Vite + React (Static SPA), kamu bisa hosting gratis di **Cloudflare Pages** maupun **Cloudflare Workers (Static Assets)**.

### Opsi A: Cloudflare Pages (Terhubung Otomatis dengan GitHub — Direkomendasikan)
1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Masuk ke menu **Workers & Pages** > **Create** > tab **Pages** > **Connect to Git**.
3. Pilih repository GitHub `klipkomen` / `klipkomen-beta`.
4. Isi pengaturan build:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. (Opsional) Tambahkan Environment Variable di tab **Variables and Secrets**:
   - `VITE_APP_CHANNEL` = `beta` (untuk versi Beta) atau `publish` (untuk versi Publish).
6. Klik **Save and Deploy**. Setiap kali kamu `git push`, Cloudflare akan otomatis build & update situsmu.

### Opsi B: Cloudflare Workers (Static Assets via CLI `wrangler`)
File `wrangler.jsonc` sudah disiapkan di proyek ini.
1. Install Wrangler CLI (jika belum ada):
   ```bash
   npm install -D wrangler
   ```
2. Login ke akun Cloudflare:
   ```bash
   npx wrangler login
   ```
3. Build dan deploy langsung dari terminal:
   ```bash
   npm run build
   npx wrangler deploy
   ```
   Atau cukup jalankan:
   ```bash
   npm run deploy:cf
   ```
4. Situs akan langsung aktif di URL `https://klipkomen-beta.<subdomain>.workers.dev` (atau `klipkomen.<subdomain>.workers.dev`).
