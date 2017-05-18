#!/usr/bin/python

import os
import socket

SERVER_ADDR = './.pp3d-test.sock'
CONNECT_ADDR = './.pp3d-core.sock'

try:
    os.unlink(SERVER_ADDR)
except OSError:
    if os.path.exists(SERVER_ADDR):
        raise

cli = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
cli.bind(SERVER_ADDR)  # address of the client
cli.connect(CONNECT_ADDR)  # address of Shadowsocks manager

cli.send(b'ping')
print(cli.recv(1506))  # You'll receive 'pong'
