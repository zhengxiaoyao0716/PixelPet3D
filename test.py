from tornado import gen
from tornado.httpclient import HTTPClient
from tornado.httpclient import AsyncHTTPClient
from tornado.ioloop import IOLoop


@gen.coroutine
def fetch_coroutine(url):
    http_client = AsyncHTTPClient()
    response = yield http_client.fetch(url)
    # In Python versions prior to 3.3, returning a value from
    # a generator is not allowed and you must use
    #   raise gen.Return(response.body)
    # instead.
    # python2.7
    raise gen.Return(123)
    # python 3.3
    # return response.body


@gen.coroutine
def test():
    r = yield fetch_coroutine('https://www.baidu.com')
    print(r)

if __name__ == '__main__':
    IOLoop.current().run_sync(test)
