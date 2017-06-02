#ifndef __PP3D_SCREEN_H
#define __PP3D_SCREEN_H

#include "server/server.h"

typedef struct
{
    PP3DHandler Center;
    PP3DHandler Up;
    PP3DHandler Down;
    PP3DHandler Left;
    PP3DHandler Right;
} PP3DScreenHandlers;

/**
 * 浮在相机前的屏幕，16x16像素正交投影范围内
 */
typedef struct
{
    PP3DScreenHandlers Handlers;
} __PP3D_SCREEN;
extern __PP3D_SCREEN PP3DScreen;

#endif