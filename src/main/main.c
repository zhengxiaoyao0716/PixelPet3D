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
	Server.Push("/screen/active", Screen.Active);
	Server.Push("/control/center", Screen.Controller.Center);
	Server.Push("/control/up", Screen.Controller.Up);
	Server.Push("/control/down", Screen.Controller.Down);
	Server.Push("/control/left", Screen.Controller.Left);
	Server.Push("/control/right", Screen.Controller.Right);
	Server.Run();
	Server.Free();
	return 0;
}