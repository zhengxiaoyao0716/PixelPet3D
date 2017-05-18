#ifndef __PP3D_SERVER_H
#define __PP3D_SERVER_H

#include "public.h"

typedef void (*PP3DHandler)(IN char *recvBuf, OUT char *sendBuf);

typedef struct
{
    void (*Run)(PP3DHandler);
} __PP3D_SERVER;
extern __PP3D_SERVER PP3DServer;

#endif