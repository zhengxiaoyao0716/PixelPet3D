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

    for (
        char recvBuf[BUFSIZ], sendBuf[BUFSIZ] = {0};
        fflush(stdin), printf("\n请求："), gets(recvBuf);
        printf("===========【 响应 】===========\n%s\n================================\n", sendBuf))
    {
        handler(recvBuf, sendBuf);
    }

    fflush(stdin);
    printf("\n\t按下任意键退出\n");
    getch();
};