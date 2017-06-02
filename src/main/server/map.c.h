#include <string.h>
#include "uthash.h"

typedef struct
{
    char Path[1024]; /* we'll use this field as the key */
    PP3DHandler Handler;
    UT_hash_handle hh; /* makes this structure hashable */
} Iter, *Map;

static Map handlers;

static void addHandler(const char *path, PP3DHandler handler)
{
    Iter *iter = (Iter *)malloc(sizeof(Iter));
    strcpy(iter->Path, path);
    iter->Handler = handler;
    HASH_ADD_STR(handlers, Path, iter);
}
static PP3DHandler findHandler(char *path)
{
    Iter *iter;
    HASH_FIND_STR(handlers, path, iter);
    if (iter != NULL)
    {
        return iter->Handler;
    };
    return NULL;
}
static PP3DHandler printHandlers()
{
    Iter *iter, *tmp;
    HASH_ITER(hh, handlers, iter, tmp)
    {
        printf("%s\n", (*iter).Path);
    }
}
static void freeHandlers()
{
    Iter *iter, *tmp;
    HASH_ITER(hh, handlers, iter, tmp)
    {
        HASH_DEL(handlers, iter); /* delete; users advances to next */
        free(iter);               /* optional- if you want to free  */
    }
    handlers = NULL;
}
