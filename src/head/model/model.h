#ifndef __PP3D_MODEL_H
#define __PP3D_MODEL_H

#include <stdio.h>
#include "public.h"

#define PP3DSideLen 16

typedef struct
{
    const int Cube[PP3DSideLen][PP3DSideLen][PP3DSideLen];
    void (*Load)(IN FILE *stream);
    void (*Dump)(OUT FILE *stream);
} __PP3D_MODEL;
extern __PP3D_MODEL PP3DModel;

#endif