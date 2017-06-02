#include <stdio.h>

#include "pp3d_g.h"

static void getInfoHandler(IN char *query, OUT char *sendBuf)
{
	InfoType Info = Config.Info;
	sprintf(sendBuf, "/info/get\n%s: %s\nAuthor: %s\nAddress: %s", Info.Name, Info.Vers, Info.Auth, Info.Addr);
}

int main(int argc, char **argv)
{
	Server.Push("/info/get", getInfoHandler);
	Server.Push("/control/center", Screen.Handlers.Center);
	Server.Push("/control/up", Screen.Handlers.Up);
	Server.Push("/control/down", Screen.Handlers.Down);
	Server.Push("/control/left", Screen.Handlers.Left);
	Server.Push("/control/right", Screen.Handlers.Right);
	Server.Run();
	Server.Free();
	return 0;
}