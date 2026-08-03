# Kiro Agentic - Web Dashboard

Kiro Agentic adalah Agentic AI profesional dengan antarmuka dashboard web. Proyek ini didesain untuk berjalan di VPS (Ubuntu/Debian) atau Termux, dengan akses penuh ke terminal untuk koding, analisa, pencarian, dan debugging secara otonom.

## Fitur
- 🖥️ **Web Dashboard**: Antarmuka manajemen modern berbasis web.
- 🤖 **Multi-Agent Workflow**: Menjalankan agen otonom untuk menyelesaikan instruksi dan rencana kerja yang kompleks.
- ⚙️ **Konfigurasi API Fleksibel**: Dukungan untuk API Key, Custom Base URL (kompatibel dengan OpenAI format), dan model pilihan Anda.
- 🔄 **Auto Update**: Tombol "Check for Updates" di menu Settings untuk langsung melakukan *git pull* dari repositori GitHub secara otomatis.
- 💻 **Akses CLI Penuh**: Agen di backend secara langsung menjalankan perintah pada shell server host.

## Cara Instalasi (VPS atau Termux)

### 1. Persiapan Sistem
Pastikan Anda sudah menginstal Git dan Node.js di server VPS atau perangkat Android (Termux) Anda.

**Untuk VPS (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install git nodejs npm -y
```

**Untuk Termux:**
```bash
pkg update
pkg install git nodejs -y
```

### 2. Clone Repositori
Clone repositori Kiro Agentic ke dalam sistem Anda:
```bash
git clone https://github.com/2026musik-code/kiroagent.git
cd kiroagent
```

### 3. Instalasi Dependensi
Instal semua module Node.js yang dibutuhkan aplikasi (Express, React, Vite, dll):
```bash
npm install
```

### 4. Build Proyek (Wajib)
Proyek ini menggabungkan frontend React (Vite) dan backend Express. Anda harus melakukan build terlebih dahulu:
```bash
npm run build
```

### 5. Menjalankan Server
Setelah proses build selesai tanpa error, jalankan production server:
```bash
npm start
```
*(Catatan: Anda bisa menggunakan manajer proses seperti `pm2` jika ingin menjalankannya di background pada VPS, misalnya: `pm2 start npm --name "kiroagent" -- start`)*

### 6. Akses Dashboard
Buka browser dan kunjungi:
```
http://<IP_VPS_ANDA>:3000
```
*(Gunakan `http://localhost:3000` atau `http://127.0.0.1:3000` jika Anda menjalankannya secara lokal/Termux).*

---

## Troubleshooting (Masalah Umum)

### Error `Cannot find native binding` saat menjalankan `npm run build`
Error ini kadang terjadi karena versi NPM gagal mendownload modul *native* (Rust/C++) milik Tailwind CSS v4 secara otomatis. Solusinya:

1. Hapus `node_modules` dan `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   ```
2. Instal ulang *dependencies* dan paksa download arsitektur yang benar:
   ```bash
   npm install --force
   ```
3. (Opsional) Jika masih gagal, cobalah update Node.js Anda ke versi yang lebih baru (versi 20+) menggunakan [nvm](https://github.com/nvm-sh/nvm):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.bashrc
   nvm install 20
   nvm use 20
   npm install
   ```

---

## Memulai Penggunaan
1. Arahkan browser Anda ke dashboard web Kiro Agentic.
2. Buka menu **Settings**.
3. Masukkan **OpenAI Compatible API Key**, **API Base URL** (misalnya `https://autoapp.biz.id/v1`), dan **Model Name** (misalnya `kiro/qwen3-coder-next`). Jangan lupa klik **Save Configuration**.
4. Pindah ke halaman **Workflows**.
5. Berikan instruksi (prompt) ke Terminal input, misalnya: `"Buatkan script python untuk download video youtube, dan jalankan scriptnya"`.
6. Tonton Agent menyusun rencana dan mengeksekusi bash command satu demi satu langsung dari layar Anda!
