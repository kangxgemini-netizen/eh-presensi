#!/bin/bash
# start-proxy-tunnel.sh
# Buka SOCKS5 lokal lewat SSH tunnel ke AWS Jakarta (ap-southeast-3).
# Proxy keluar: socks5://127.0.0.1:1080
# Traffic browser lewat port 22 (SSH) -> anti-DPI ISP yang blokir port proxy.
#
# Instance: i-0c86dec9fd612a9f1 (ec2-user@43.218.127.193) - t3.micro free tier
# Catatan: instance lama (16.78.6.181) rusak egress TCP, ini instance baru yg egress OK.
#
# Cara pakai:
#   bash start-proxy-tunnel.sh          # foreground (Ctrl+C untuk stop)
#   bash start-proxy-tunnel.sh &        # background
# Lalu di extension eh-Presensi -> Proxy Config -> Manual -> isi socks5://127.0.0.1:1080

set -e
KEY="$HOME/.ssh/eh-presensi-key.pem"
HOST="ec2-user@43.218.127.193"
PORT=1080

chmod 400 "$KEY" 2>/dev/null || true

if [ ! -f "$KEY" ]; then
  echo "[ERR] Key tidak ditemukan: $KEY"
  exit 1
fi

echo "Membuka SOCKS5 tunnel di 127.0.0.1:$PORT -> $HOST (via port 22)..."
echo "Tekan Ctrl+C untuk menghentikan."

while true; do
  ssh -i "$KEY" \
    -D "$PORT" \
    -N \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    -o ExitOnForwardFailure=yes \
    -o StrictHostKeyChecking=no \
    "$HOST"
  echo "[tunnel] koneksi putus, reconnect dalam 3s..."
  sleep 3
done
