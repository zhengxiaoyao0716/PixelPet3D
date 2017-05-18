#!/usr/bin/python
# -*- coding: utf-8 -*-

"""
Websocket server for PixelPet3D.
@author: zhengxiaoyao0716
"""

import os
import socket
import tornado.ioloop
import tornado.web
import tornado.websocket

SERVER_ADDR = './.pp3d-connect_core.sock'
CONNECT_ADDR = './../PixelPet3D-core/.pp3d-core.sock'
BUFSIZ = 2 ** 13

try:
    os.unlink(SERVER_ADDR)
except OSError:
    if os.path.exists(SERVER_ADDR):
        raise


class IndexHandler(tornado.web.RequestHandler):
    """Index"""

    def get(self):
        """get"""
        self.render('./../PixelPet3D-browser/index.html')


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    """WebSocket"""

    def __init__(self, *args, **kwargs):
        super(WebSocketHandler, self).__init__(*args, **kwargs)

        if 'AF_UNIX' in dir(socket):
            sock = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
            sock.bind(SERVER_ADDR)
            sock.connect(CONNECT_ADDR)

            def invoke_core(message, expect=None):
                """调用C模块"""
                sock.send(bytes(message))
                return sock.recv(BUFSIZ)
            self.invoke_core = invoke_core
            self.close_connect = lambda: sock.close()
        else:
            self.invoke_core = lambda message, expect=None: \
                expect if expect is not None else message
            self.close_connect = lambda: None

    # def __del__(self):
    #     self.close_connect()

    def open(self):
        """open"""
        self.write_message({
            "event": "/info/get",
            "data": self.invoke_core("/info/get", "%s: %s\nAuthor: %s\nAddress: %s")
        })

    def on_message(self, message):
        """on_message"""
        self.write_message({
            "event": "text",
            "data": {
                "message": "Hello",
            }
        })

    def on_close(self):
        """on_close"""
        # TODO clean
        pass


if __name__ == '__main__':
    app = tornado.web.Application([
        (r'/', IndexHandler),
        (r'/ws', WebSocketHandler),
        (r"^/static/(.*?)$", tornado.web.StaticFileHandler,
         dict(path='./../PixelPet3D-browser/static/')),
    ], debug=True)
    app.listen(5000, address="0.0.0.0")
    tornado.ioloop.IOLoop.instance().start()
