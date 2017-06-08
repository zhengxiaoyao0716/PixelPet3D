#!/usr/bin/python
# -*- coding: utf-8 -*-

"""
Websocket server for PixelPet3D.
@author: zhengxiaoyao0716
"""

from tornado import gen
from tornado.ioloop import IOLoop
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
    waiters = set()

    @classmethod
    def join_waiters(cls, self):
        """加入一个连接客户端"""
        cls.waiters.add(self)

    @classmethod
    def remove_waiters(cls, self):
        """加入一个连接客户端"""
        cls.waiters.remove(self)

    @classmethod
    def broadcast(cls, event, data):
        """向所有人广播"""
        for waiter in cls.waiters:
            waiter.write_message({'event': event, 'data': data})

    def check_origin(self, origin):
        return True

    def open(self, *args, **kwargs):
        self.join_waiters(self)
        for path in [
                '/screen/render',
                '/warn',
                '/error',
        ]:
            (lambda path: core_conn.on(
                path,
                lambda data: self.broadcast(path, data)))(path)

        @gen.coroutine
        def get_info():
            """获取信息"""
            data = yield core_conn.invoke(
                "/info/get", '%s: %s\nAuthor: %s\nAddress: %s\n{"pet": "PiPi"}')
            self.broadcast("/info/get", data)
            core_conn.emit('/screen/active')
        IOLoop.current().spawn_callback(get_info)

    def on_message(self, message):
        path, message = message.split('?', 1) \
            if '?' in message else [message, '']
        if path.startswith("invoke://"):
            path = path[9:]

            @gen.coroutine
            def invoke():
                """获取信息"""
                data = yield core_conn.invoke(path, message)
                self.broadcast(path, data)
            IOLoop.current().spawn_callback(invoke)
        else:
            if path.startswith('emit://'):
                path = path[7:]
            core_conn.emit(path, message)
            self.broadcast(path + '/emit', 'fin')

    def on_close(self):
        self.remove_waiters(self)


if __name__ == '__main__':
    app = tornado.web.Application([
        (r'/', IndexHandler),
        (r'/ws', WebSocketHandler),
        (r"^/static/(.*?)$", tornado.web.StaticFileHandler,
         dict(path='./../PixelPet3D-browser/static/')),
    ], debug=True)
    app.listen(5000, address="0.0.0.0")
    IOLoop.instance().start()
