#ifndef __PP3D_STORAGE_H
#define __PP3D_STORAGE_H

#include <stdio.h>
#include "public.h"
#include "model/model.h"

static void load(IN FILE *stream)
{
    // // fscanf(stream, "\"%s\",\"%s\"", *column1, *column2);
    // int index = 0, length = 8;
    // char* strBuilder = (char*)malloc(length * sizeof(char));
    // char ch;
    // while((ch = fgetc(stream)) != EOF) {
    //     if (ch == ',') {
    //         *(strBuilder + index) = 0;
    //         *column1 = strBuilder;
    //         index = 0;
    //         length = 8;
    //         strBuilder = (char*)malloc(length * sizeof(char));
    //         continue;
    //     }
    //     else if (ch == '\n') {
    //         *(strBuilder + index) = 0;
    //         *column2 = strBuilder;
    //         return true;
    //     }
    //     else if (ch == '\"') continue;

    //     *(strBuilder + index) = ch;
    //     if (++index >= length) {
    //         length <<= 1;
    //         char* newStr = (char*)realloc(strBuilder, length * sizeof(char));
    //         if (newStr == NULL) Finish("加载备份时分配字符串内存失败，可能内存不足\n");
    //         strBuilder = newStr;
    //     }
    // }
    // free(strBuilder);
    // return false;
}
static void dump(OUT FILE *stream)
{
    // fprintf(stream, "\"%s\",\"%s\"\n", column1, column2);
}

#endif