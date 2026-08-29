#!/bin/bash
# user-data for new proxy instance
yum install -y 3proxy 2>/dev/null || true
cat > /usr/local/3proxy/3proxy.cfg <<'CFG'
log /dev/null
socks -p8443 -i0.0.0.0
CFG
# start via systemd if available, else nohup foreground-less
cat > /etc/systemd/system/3proxy.service <<'SV'
[Unit]
Description=3proxy SOCKS5
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/3proxy/3proxy /usr/local/3proxy/3proxy.cfg
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SV
systemctl daemon-reload 2>/dev/null
systemctl enable 3proxy 2>/dev/null
systemctl start 3proxy 2>/dev/null || (nohup /usr/local/3proxy/3proxy /usr/local/3proxy/3proxy.cfg >/tmp/3p.log 2>&1 &)
