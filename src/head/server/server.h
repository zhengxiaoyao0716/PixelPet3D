#ifndef __PP3D_SERVER_H
#define __PP3D_SERVER_H

#include "public.h"

typedef void (*PP3DHandler)(IN char *recvBuf, OUT char *sendBuf);

typedef struct
{
    void (*Push)(const char *path, PP3DHandler handler);
    void (*Run)();
    void (*Free)();
} __PP3D_SERVER;
extern __PP3D_SERVER PP3DServer;

#endif