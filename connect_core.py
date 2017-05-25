#!/usr/bin/python
# -*- coding: utf-8 -*-

"""
Connect with core module.
@author: zhengxiaoyao0716
"""

import os
import socket

from tornado import gen
from tornado.ioloop import IOLoop
from tornado.queues import Queue


class CoreConnector(object):
    """连接器"""

    def __init__(self,
                 server_sock='./../.pp3d-server.sock',
                 core_sock='./../.pp3d-core.sock',
                 bufsize=2 ** 13):
        super(CoreConnector, self).__init__()

        self.sock = None
        """接收socket发来的消息"""
        recv_sock_message = None
        handlers = {}

        def on(path, handler):
            """注册监听控制器"""
            handlers[path] = handler
        self.on = on

        @gen.coroutine
        def listen():
            """监听core发来的消息"""
            while True:
                item = yield recv_sock_message()
                path, message = item.split('\n', 1)
                if path in handlers:
                    if handlers[path](message) is True:
                        handlers.pop(path)

        @gen.coroutine
        def invoke(path, message):
            """调用core模块"""
            self.emit(path, message)
            q = Queue(maxsize=1)

            def _handler(message):
                q.put(message)
                return True
            self.on(path, _handler)
            message = yield q.get()
            raise gen.Return(message)

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

            def emit(path, message):
                """向core发送消息"""
                try:
                    self.sock.send(path + '?' + message)
                except socket.error:
                    init_sock()
                    return emit(path, message)
            self.emit = emit
            self.close = self.sock.close

            @gen.coroutine
            def _recv_sock_message():
                raise gen.Return(self.sock.recv(bufsize).strip('\0'))
            recv_sock_message = _recv_sock_message
            self.invoke = invoke
        else:
            self.emit = lambda path, message: None
            self.close = lambda: None
            q = Queue(maxsize=1)
            recv_sock_message = q.get

            @gen.coroutine
            def _invoke(path, message):
                q.put(path + '\n' + message)
                message = yield invoke(path, message)
                raise gen.Return(message)
            self.invoke = _invoke

        IOLoop.current().spawn_callback(listen)

    def __del__(self):
        self.close()

if __name__ == '__main__':
    core_conn = CoreConnector()

    @gen.coroutine
    def test():
        """测试socket"""
        r = yield core_conn.invoke("/info/get", "%s: %s\nAuthor: %s\nAddress: %s")
        print(r)
    IOLoop.current().run_sync(test)
