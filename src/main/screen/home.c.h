const char HOME[] = "HOME";

static void homeCenter(IN char *query, OUT char *sendBuf)
{
    if (focusMenu)
    {
        focusMenu = false;
        renderScreen("/screen/render\n{\"type\": \"pet\"}", "");
    }
    else
    {
        focusMenu = true;
        renderScreen(menuTemplate, HOME);
    }
}
