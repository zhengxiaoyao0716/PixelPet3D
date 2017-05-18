#include "server/server.h"

#ifdef __linux
#include "linux.c.h"
#else
#include "mock.c.h"
#endif

__PP3D_SERVER PP3DServer = {
    Run : server,
};