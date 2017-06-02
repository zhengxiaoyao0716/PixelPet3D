#include <time.h>

const char CLOCK[] = "CLOCK";

static char *getTime(char *timeStr)
{
    time_t timep;
    struct tm *p;
    time(&timep);
    p = localtime(&timep);

    sprintf(timeStr, "%04d-%02d-%02d %02d:%02d:%02d\0",
            1900 + p->tm_year,
            1 + p->tm_mon,
            p->tm_mday,
            p->tm_hour,
            p->tm_min,
            p->tm_sec);
    return timeStr;
}

static void clockActive(IN char *query, OUT char *sendBuf)
{
    char timeStr[20];
    renderScreen("{\"type\": \"clock\", \"value\": \"%s\"}", getTime(timeStr));
}
