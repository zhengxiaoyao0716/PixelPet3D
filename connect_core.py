#!/usr/bin/python
# -*- coding: utf-8 -*-

"""
Connect with core module.
@author: zhengxiaoyao0716
"""

import os
import socket


class CoreConnector(object):
    """连接器"""

    def __init__(self,
                 server_sock='./../.pp3d-server.sock',
                 core_sock='./../.pp3d-core.sock',
                 bufsize=2 ** 13):
        super(CoreConnector, self).__init__()

        def init_sock():
            """初始化sock"""
            try:
                os.unlink(server_sock)
            except OSError:
                if os.path.exists(server_sock):
                    raise
            self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
            self.sock.bind(server_sock)
            self.sock.connect(core_sock)

        if 'AF_UNIX' in dir(socket):
            init_sock()

            def invoke_core(message, expect=None):
                """调用C模块"""
                try:
                    self.sock.send(message)
                except socket.error:
                    init_sock()
                    return invoke_core(message, expect)
                return self.sock.recv(bufsize).strip('\0')
            self.invoke_core = invoke_core
            self.close_connect = self.sock.close
        else:
            self.invoke_core = lambda message, expect=None: \
                expect if expect is not None else message
            self.close_connect = lambda: None

    def __del__(self):
        self.close_connect()

if __name__ == '__main__':
    core_conn = CoreConnector()
    print(core_conn.invoke_core("/info/get", "%s: %s\nAuthor: %s\nAddress: %s"))
