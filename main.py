#!/usr/bin/python
# -*- coding: utf-8 -*-

"""
Websocket server for PixelPet3D.
@author: zhengxiaoyao0716
"""

import tornado.ioloop
import tornado.web
import tornado.websocket

from connect_core import CoreConnector
core_conn = CoreConnector()


class IndexHandler(tornado.web.RequestHandler):
    """Index"""

    def get(self):
        """get"""
        self.render('./../PixelPet3D-browser/index.html')


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    """WebSocket"""

    def check_origin(self, origin):
        return True

    def open(self):
        """open"""
        self.write_message({
            "event": "/info/get",
            "data": core_conn.invoke_core("/info/get", "%s: %s\nAuthor: %s\nAddress: %s")
        })

    def on_message(self, message):
        self.write_message({
            "event": "text",
            "data": {
                "message": "pong",
            }
        })

    def on_close(self):
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
