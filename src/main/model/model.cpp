#include "model/model.h"

#include "storage.c.h"
#include "projection.c.h"
// static void projection(OUT int rect[sideLen][sideLen]);

__PP3D_MODEL PP3DModel = {
    SideLen : sideLen,
    Cube : {{{0}}},
    Load: load,
    Dump: dump,
    Projection: projection,
};