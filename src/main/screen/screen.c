#include <stdio.h>

#include "screen/screen.h"

#define renderScreen(template, ...) sprintf(sendBuf, "/screen/render\n" template "", __VA_ARGS__)
#define menuTemplate "{\"type\": \"menu\", \"name\": \"%s\"}"

typedef struct
{
    char *name;
    PP3DScreenHandlers handlers;
} MenuItem;

static bool focusMenu = false;

#include "home.c.h"
#include "clock.c.h"

static MenuItem menus[] = {
    {HOME, {homeCenter}},
    {CLOCK, {clockCenter}},
};
const int menusSize = sizeof(menus) / sizeof(MenuItem);
static MenuItem *cursor = menus;

static void center(IN char *query, OUT char *sendBuf)
{
    return (*cursor).handlers.Center(query, sendBuf);
}
static void up(IN char *query, OUT char *sendBuf)
{
    return (*cursor).handlers.Up(query, sendBuf);
}
static void down(IN char *query, OUT char *sendBuf)
{
    return (*cursor).handlers.Down(query, sendBuf);
}
static void left(IN char *query, OUT char *sendBuf)
{
    if (focusMenu)
    {
        if (cursor == menus)
        {
            cursor = menus + menusSize - 1;
        }
        else {
            cursor--;
        }
        renderScreen(menuTemplate, (*cursor).name);
    }
}
static void right(IN char *query, OUT char *sendBuf)
{
    if (focusMenu)
    {
        if (cursor == menus + menusSize - 1)
        {
            cursor = menus;
        }
        else {
            cursor++;
        }
        renderScreen(menuTemplate, (*cursor).name);
    }
}

__PP3D_SCREEN PP3DScreen = {
    Handlers : {
        Center : center,
        Up : up,
        Down : down,
        Left : left,
        Right : right,
    },
};
