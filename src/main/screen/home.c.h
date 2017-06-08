#include "config/config.h"

static void homeActive(IN char *query, OUT char *sendBuf)
{
    renderScreen("{\"type\": \"pet\", \"name\": \"%s\"}", PP3DConfig.Pet);
}
