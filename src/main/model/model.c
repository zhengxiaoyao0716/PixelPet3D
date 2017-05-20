#include "model/model.h"

#include "storage.c.h"
// static void projection(OUT int rect[sideLen][sideLen]);

__PP3D_MODEL PP3DModel = {
    Cube : {{{0}}},
    Load : load,
    Dump : dump,
};