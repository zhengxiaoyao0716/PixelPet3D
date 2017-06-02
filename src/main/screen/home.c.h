const char HOME[] = "HOME";

static void homeCenter(IN char *query, OUT char *sendBuf)
{
    if (focusMenu)
    {
        focusMenu = false;
        renderScreen("{\"type\": \"pet\"}", "");
    }
    else
    {
        focusMenu = true;
        renderScreen(menuTemplate, HOME);
    }
}
