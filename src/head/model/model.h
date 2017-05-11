#ifndef __PP3D_MODEL_H
#define __PP3D_MODEL_H

#include <stdio.h>
#include "public.h"

static const int sideLen = 16;

typedef struct
{
    const int SideLen;
    const int Cube[sideLen][sideLen][sideLen];
    void (*Load)(IN FILE *stream);
    void (*Dump)(OUT FILE *stream);
    void (*Projection)(OUT int rect[sideLen][sideLen]);
} __PP3D_MODEL;
extern __PP3D_MODEL PP3DModel;

#endif