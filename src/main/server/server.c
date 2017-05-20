#include "server/server.h"

#include <string.h>

#include "map.c.h"
#ifdef __linux
#include "socket.linux.c.h"
#else
#include "socket.mock.c.h"
#endif

static void serverHandler(IN char *recvBuf, OUT char *sendBuf)
{
    printf("recv: %s\n", recvBuf);
    char *query = strchr(recvBuf, '?');
    if (query)
    {
        *query = '\0';
        query++;
    }
    PP3DHandler handler = findHandler(recvBuf);
    if (handler)
    {
        handler(query, sendBuf);
        return;
    }
    printf("No handler for '%s'\n", recvBuf);
}
static void runServer()
{
    server(serverHandler);
}

__PP3D_SERVER PP3DServer = {
    Push : addHandler,
    Run : runServer,
    Free : freeHandlers,
};