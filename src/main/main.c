#include <stdio.h>

#include "pp3d_g.h"

static void getInfoHandler(IN char *query, OUT char *sendBuf)
{
	InfoType Info = Config.Info;
	sprintf(sendBuf, "/info/get\n%s: %s\nAuthor: %s\nAddress: %s", Info.Name, Info.Vers, Info.Auth, Info.Addr);
}
static void controlCenterHandler(IN char *query, OUT char *sendBuf)
{
}

int main(int argc, char **argv)
{
	Server.Push("/info/get", getInfoHandler);
	// Server.Push("/control/up", controlUpHandler);
	// Server.Push("/control/down", controlDownHandler);
	// Server.Push("/control/left", controlLeftHandler);
	// Server.Push("/control/right", controlRightHandler);
	Server.Push("/control/center", controlCenterHandler);
	Server.Run();
	Server.Free();
	return 0;
}