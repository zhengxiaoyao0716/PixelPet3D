#include <stdio.h>
#include <map>
#include <string>

// ================================
// #include "pp3d_g.h"
// ================================
// 临时散装导入，方便添加与修改模块代码
// 工程结构基本确定后应整理到头文件里去
#include "config/config.h"
#include "model/model.h"
#include "server/server.h"

__PP3D_CONFIG Config = PP3DConfig;
typedef PP3DInfoType InfoType;

__PP3D_MODEL Model = PP3DModel;

__PP3D_SERVER Server = PP3DServer;
typedef PP3DHandler Handler;
// ================================

typedef std::map<std::string, Handler> Map;
typedef Map::iterator Iter;
static Map handlers;

static void getInfoHandler(IN char *recvBuf, OUT char *sendBuf)
{
	InfoType Info = Config.Info;
	sprintf(sendBuf, "%s: %s\nAuthor: %s\nAddress: %s", Info.Name, Info.Vers, Info.Auth, Info.Addr);
}

static void mainHandler(IN char *recvBuf, OUT char *sendBuf)
{
	printf("recv: %s\n", recvBuf);
	Iter iter = handlers.find(recvBuf);
	if (iter != handlers.end()){
		(iter -> second)("", sendBuf);
	}else{
		printf("No handler for %s", recvBuf);
	}
}

int main(int argc, char **argv)
{
	handlers["/info/get"] = getInfoHandler;
	Server.Run(mainHandler);
	return 0;
}