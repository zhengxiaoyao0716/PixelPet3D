#include <stdio.h>

#include "pp3d_g.h"

static void getInfoHandler(IN char *query, OUT char *sendBuf)
{
	InfoType Info = Config.Info;
	sprintf(sendBuf, "%s: %s\nAuthor: %s\nAddress: %s", Info.Name, Info.Vers, Info.Auth, Info.Addr);
}

int main(int argc, char **argv)
{
	Server.Push("/info/get", getInfoHandler);
	Server.Run();
	Server.Free();
	return 0;
}