# Kiro Agentic - Web Dashboard

Kiro Agentic adalah Agentic AI profesional dengan antarmuka dashboard web. Proyek ini didesain untuk berjalan di VPS (Ubuntu/Debian) atau Termux, dengan akses penuh ke terminal untuk koding, analisa, pencarian, dan debugging secara otonom.

## Fitur
- 🖥️ **Web Dashboard**: Antarmuka manajemen modern berbasis web.
- 🤖 **Multi-Agent Workflow**: Menjalankan agen otonom untuk menyelesaikan instruksi dan rencana kerja yang kompleks.
- ⚙️ **Konfigurasi API Fleksibel**: Dukungan untuk API Key, Custom Base URL (kompatibel dengan OpenAI format), dan model pilihan Anda.
- 🔄 **Auto Update**: Tombol "Check for Updates" di menu Settings untuk langsung melakukan *git pull* dari repositori GitHub secara otomatis.
- 💻 **Akses CLI Penuh**: Agen di backend secara langsung menjalankan perintah pada shell server host.

## Cara Instalasi (Sangat Mudah untuk VPS Ubuntu/Debian & Termux Android)

Kami telah menyiapkan script instalasi otomatis (`install.sh`) yang akan mengatur Node.js, menginstal dependensi, mem-build aplikasi, membuka port di Firewall (jika VPS), dan menjalankan Kiro Agentic di background menggunakan PM2 secara otomatis!

Jalankan perintah berikut secara berurutan di terminal VPS atau Termux Anda:

```bash
git clone https://github.com/2026musik-code/kiroagent.git
cd kiroagent
chmod +x install.sh
./install.sh
```

Tunggu prosesnya hingga selesai. Setelah selesai, web akan otomatis berjalan di port `3000` di IP server Anda, dan akan tetap online di background (menggunakan `pm2`).

---

## Cara Update Aplikasi

Karena aplikasi sedang dalam masa perkembangan aktif, Anda tidak perlu pusing melakukan pull & build manual.
Cukup buka **Dashboard Web Kiro Agentic -> Settings -> Klik tombol "Check for Updates"**.
Aplikasi akan secara otomatis mendownload pembaruan terbaru dari Github, melakukan build, dan merestart server (membutuhkan waktu 1-3 menit).

---

## Troubleshooting (Masalah Umum)

### 1. Web tidak bisa diakses (ERR_CONNECTION_ABORTED / Site can't be reached)
Script `install.sh` sudah otomatis membuka port 3000 pada Firewall (UFW) internal VPS Ubuntu.
**Penting:** Jika Anda menggunakan VPS dari provider seperti AWS, Google Cloud, Azure, Hostinger, IdCloudHost, atau DigitalOcean, **pastikan juga Anda sudah membuka Port 3000 di bagian pengaturan Security Groups / Firewall** melalui dashboard provider VPS Anda tersebut.

### 2. Error Node.js / NPM saat build
Jika Anda tidak menggunakan `install.sh` dan mengalami error build `Cannot find native binding` terkait Tailwind CSS, gunakan perintah:
```bash
rm -rf node_modules package-lock.json dist
npm install --unsafe-perm --force
npm run build
```

---

## Memulai Penggunaan
1. Arahkan browser Anda ke dashboard web Kiro Agentic.
2. Buka menu **Settings**.
3. Masukkan **OpenAI Compatible API Key**, **API Base URL** (misalnya `https://autoapp.biz.id/v1`), dan **Model Name** (misalnya `kiro/qwen3-coder-next`). Jangan lupa klik **Save Configuration**.
4. Pindah ke halaman **Workflows**.
5. Berikan instruksi (prompt) ke Terminal input, misalnya: `"Buatkan script python untuk download video youtube, dan jalankan scriptnya"`.
6. Tonton Agent menyusun rencana dan mengeksekusi bash command satu demi satu langsung dari layar Anda!
