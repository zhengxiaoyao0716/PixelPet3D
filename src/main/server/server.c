#include "server/server.h"

#include <stdio.h>
#include <string.h>

#include "map.c.h"
#ifdef __linux
#include "socket.linux.c.h"
#else
#include "socket.mock.c.h"
#endif

static void serverHandler(IN char *recvBuf, OUT char *sendBuf)
{
    char *query = strchr(recvBuf, '?');
    if (query)
    {
        *query = '\0';
        query++;
    }
    printf("recv: %s\n", recvBuf);
    PP3DHandler handler = findHandler(recvBuf);
    if (handler)
    {
        handler(query, sendBuf);
        if (*sendBuf == '\0') {
            sprintf(sendBuf, "/warn\nNo response from '%s'.", recvBuf);
        }
        return;
    }
    sprintf(sendBuf, "/error\nNo handler for '%s'.", recvBuf);
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