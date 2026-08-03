#!/bin/bash
# Kiro Agentic - Auto Installation Script untuk VPS (Ubuntu/Debian) & Termux (Android)

echo "======================================================"
echo "Memulai instalasi Kiro Agentic..."
echo "======================================================"

# Deteksi lingkungan Termux atau Linux standar
IS_TERMUX=false
if [ -n "$PREFIX" ] && [[ "$PREFIX" == *"/com.termux/"* ]]; then
  IS_TERMUX=true
fi

# 1. Update sistem dan install paket yang dibutuhkan
if [ "$IS_TERMUX" = true ]; then
  echo "[1/7] Menjalankan di Termux Android. Menginstal dependensi dasar..."
  pkg update -y
  pkg install -y curl git nodejs build-essential
else
  echo "[1/7] Menjalankan di VPS/Linux. Mengupdate sistem dan menginstal dependensi dasar..."
  sudo apt-get update
  sudo apt-get install -y curl git ufw build-essential
fi

# 2. Setup Firewall (Membuka port 3000)
if [ "$IS_TERMUX" = false ]; then
  echo "[2/7] Mengkonfigurasi Firewall (Membuka Port 3000)..."
  sudo ufw allow 3000/tcp
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw --force enable || echo "UFW tidak tersedia, melewati pengaturan firewall."
else
  echo "[2/7] Melewati konfigurasi Firewall (Tidak diperlukan di Termux)."
fi

# 3. Instalasi NVM dan Node.js versi 20
if [ "$IS_TERMUX" = false ]; then
  echo "[3/7] Menginstal NVM dan Node.js v20..."
  export NVM_DIR="$HOME/.nvm"
  if [ ! -d "$NVM_DIR" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  fi
  # Load NVM
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
  nvm alias default 20
else
  echo "[3/7] Menggunakan Node.js bawaan Termux..."
fi

# 4. Bersihkan modul dan install dependensi npm
echo "[4/7] Menginstal modul NPM..."
rm -rf node_modules package-lock.json dist
if [ "$IS_TERMUX" = false ]; then
  # Gunakan --unsafe-perm agar paket yang memerlukan build C++/Rust (esbuild, tailwind) bisa terinstall dengan baik oleh root
  npm install --unsafe-perm --force
else
  npm install --force
fi

# 5. Build Aplikasi
echo "[5/7] Melakukan build aplikasi (Frontend & Backend)..."
npm run build

# Pastikan file build server ada
if [ ! -f "dist/server.cjs" ]; then
    echo "ERROR: Build gagal, dist/server.cjs tidak ditemukan!"
    exit 1
fi

# 6. Instalasi PM2 (Process Manager)
echo "[6/7] Menginstal PM2 untuk proses background..."
npm install -g pm2

# 7. Menjalankan Server
echo "[7/7] Menjalankan server Kiro Agentic via PM2..."
pm2 stop kiroagent 2>/dev/null || true
pm2 start npm --name "kiroagent" -- start
pm2 save

echo "======================================================"
echo "INSTALASI SELESAI DAN BERHASIL!"
echo "Web Dashboard Kiro Agentic telah berjalan di background."
echo ""
if [ "$IS_TERMUX" = true ]; then
  echo "Silakan buka browser Anda di HP dan akses:"
  echo "http://localhost:3000"
else
  PUBLIC_IP=$(curl -s ifconfig.me || echo "IP_VPS_ANDA")
  echo "Silakan buka browser Anda dan akses:"
  echo "http://${PUBLIC_IP}:3000"
fi
echo "======================================================"
