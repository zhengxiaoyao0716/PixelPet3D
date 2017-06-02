#include <stdio.h>
#include <stdlib.h>

#ifdef __linux
#include <conio4linux.h>
#else
#include <conio.h>
#endif

#include "public.h"

static void server(PP3DHandler handler)
{
    system("cls") == 0 || system("clear");
    printf("[ Listen standard input ]\n");
    printf("===========【 帮助 】===========\n"
           "/info/get\n"
           "/control/center\n"
           "/control/up\n"
           "/control/down\n"
           "/control/left\n"
           "/control/right\n"
           "================================\n");

    for (
        char recvBuf[BUFSIZ], sendBuf[BUFSIZ];
        fflush(stdin), printf("\n请求："), gets(recvBuf);
        printf("===========【 响应 】===========\n%s\n================================\n", sendBuf))
    {
        *sendBuf = '\0';
        handler(recvBuf, sendBuf);
    }

    fflush(stdin);
    printf("\n\t按下任意键退出\n");
    getch();
};