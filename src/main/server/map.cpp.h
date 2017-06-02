#include <string.h>
#include <map>
#include <string>
#include <iostream>

typedef std::map<std::string, PP3DHandler> Map;
typedef Map::iterator Iter;

static Map handlers;

static void addHandler(const char *path, PP3DHandler handler)
{
    handlers[path] = handler;
}
static PP3DHandler findHandler(char *path)
{
    Iter iter = handlers.find(path);
    if (iter != handlers.end())
    {
        return iter->second;
    }
    return NULL;
}
static PP3DHandler printHandlers()
{
    Iter iter;
    for (iter = handlers.begin(); iter != handlers.end(); iter++)
    {
        std::cout << iter->first << std::endl;
    }
}
static void freeHandlers()
{
    // delete handlers;
    // handlers = NULL;
}
