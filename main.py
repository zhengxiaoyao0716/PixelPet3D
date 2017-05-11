#!/usr/bin/python
# -*- coding: utf-8 -*-

"""
Websocket server for PixelPet3D.
@author: zhengxiaoyao0716
"""


import tornado.ioloop
import tornado.web
import tornado.websocket


class IndexHandler(tornado.web.RequestHandler):
    """Index"""

    def get(self):
        """get"""
        self.render('../PixelPet3D-browser/index.html', info={
            "name": "PixelPet3D",
            "version": "v0.0.1",
            "author": "zhengxiaoyao0716",
            "address": "github.com/zhengxiaoyao0716",
        })


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    """WebSocket"""

    def open(self):
        """open"""
        self.write_message({
            "event": "init",
            "data": {
                "name": "Pix",
                # ...
            }
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
        self.write_message({
            "event": "action",
            "data": {
                "name": "bye",
            }
        })


if __name__ == '__main__':
    app = tornado.web.Application([
        (r'/', IndexHandler),
        (r'/ws', WebSocketHandler),
    ], debug=True)
    app.listen(5000, address="0.0.0.0")
    tornado.ioloop.IOLoop.instance().start()
