#include <stdlib.h>
#include <time.h>

static char *actions;
static int actionSize;
static int actionIndex;

static void makeActions()
{
    srand(time(NULL));

    if (actions != NULL)
    {
        free(actions);
    }
    actions = (char *)malloc(actionSize * sizeof(char) + 1);

    for (actionIndex = 0; actionIndex < actionSize; actionIndex++)
    {
        char action;
        switch (rand() % 4)
        {
        case 0:
            action = 'U';
            break;
        case 1:
            action = 'D';
            break;
        case 2:
            action = 'L';
            break;
        case 3:
            action = 'R';
            break;
        }
        *(actions + actionIndex) = action;
    }
    *(actions + actionIndex) = '\0';
    actionIndex = 0;
}

static void gameActive(IN char *query, OUT char *sendBuf)
{
    actionSize = 4;
    makeActions();
    renderScreen("{\"type\": \"game\", \"name\": \"%s\", \"value\": \"%s\"}", "begin", actions);
}

static void gameAction(char action, IN char *query, OUT char *sendBuf)
{
    if (action == *(actions + actionIndex))
    {
        actionIndex++;
        if (*(actions + actionIndex) == '\0')
        {
            actionSize += 2;
            makeActions();
            renderScreen("{\"type\": \"game\", \"name\": \"%s\", \"value\": \"%s\"}", "win", actions);
        }
        else
        {
            renderScreen("{\"type\": \"game\", \"name\": \"%s\", \"value\": \"%d\"}", "pass", actionIndex);
        }
    }
    else
    {
        actionSize = 4;
        makeActions();
        renderScreen("{\"type\": \"game\", \"name\": \"%s\", \"value\": \"%s\"}", "lose", actions);
    }
}
static void gameUp(IN char *query, OUT char *sendBuf) { gameAction('U', query, sendBuf); }
static void gameDown(IN char *query, OUT char *sendBuf) { gameAction('D', query, sendBuf); }
static void gameLeft(IN char *query, OUT char *sendBuf) { gameAction('L', query, sendBuf); }
static void gameRight(IN char *query, OUT char *sendBuf) { gameAction('R', query, sendBuf); }
