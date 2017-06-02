#include <stdio.h>

#include "screen/screen.h"

#define renderScreen(template, ...) sprintf(sendBuf, "/screen/render\n" template, __VA_ARGS__)
#define menuTemplate "{\"type\": \"menu\", \"name\": \"%s\"}"
#define _INTERCEPT_(handler) if (handler != NULL) { return handler(query, sendBuf); }

typedef struct
{
    char *name;
    PP3DHandler active;
    PP3DScreenController controller;
} MenuItem;

static bool focusMenu = false;

#include "home.c.h"
#include "clock.c.h"

static void emptyHandler(IN char *query, OUT char *sendBuf) {}
static MenuItem menus[] = {
    {HOME, homeActive, {}},
    {CLOCK, clockActive, {}},
};
static int menusSize = sizeof(menus) / sizeof(MenuItem);
static MenuItem *cursor = menus;

static void active(IN char *query, OUT char *sendBuf)
{
    if (focusMenu)
    {
        return renderScreen(menuTemplate, (*cursor).name);
    }
    _INTERCEPT_((*cursor).active)
}
static void center(IN char *query, OUT char *sendBuf)
{
    if (focusMenu)
    {
        focusMenu = false;
        _INTERCEPT_((*cursor).active)
        return;
    }
    _INTERCEPT_((*cursor).controller.Center)
    focusMenu = true;
    return renderScreen(menuTemplate, (*cursor).name);
}
static void up(IN char *query, OUT char *sendBuf)
{
    if (focusMenu)
    {
        cursor = menus;
        return renderScreen(menuTemplate, (*cursor).name);
    }
    _INTERCEPT_((*cursor).controller.Up)
}
static void down(IN char *query, OUT char *sendBuf)
{
    if (focusMenu)
    {
        cursor = menus + menusSize - 1;
        return renderScreen(menuTemplate, (*cursor).name);
    }
    _INTERCEPT_((*cursor).controller.Down)
}
static void left(IN char *query, OUT char *sendBuf)
{
    if (focusMenu)
    {
        if (cursor == menus)
        {
            cursor = menus + menusSize - 1;
        }
        else
        {
            cursor--;
        }
        return renderScreen(menuTemplate, (*cursor).name);
    }
    _INTERCEPT_((*cursor).controller.Left)
}
static void right(IN char *query, OUT char *sendBuf)
{
    if (focusMenu)
    {
        if (cursor == menus + menusSize - 1)
        {
            cursor = menus;
        }
        else
        {
            cursor++;
        }
        return renderScreen(menuTemplate, (*cursor).name);
    }
    _INTERCEPT_((*cursor).controller.Right)
}

__PP3D_SCREEN PP3DScreen = {
    Active: active,
    Controller : {
        Center : center,
        Up : up,
        Down : down,
        Left : left,
        Right : right,
    },
};
