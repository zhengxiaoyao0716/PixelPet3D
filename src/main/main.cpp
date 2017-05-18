#include <stdio.h>
#include <time.h>
#include <stdlib.h>

#ifdef __linux
#include <conio4linux.h>
#include "main.linux.c.h"
#else
#include <conio.h>
#include "main.c.h"
#endif

// ================================
// #include "pp3d_g.h"
// ================================
// 临时散装导入，方便添加与修改模块代码
// 工程结构基本确定后应整理到头文件里去
#include "config/config.h"
#include "model/model.h"

__PP3D_CONFIG Config = PP3DConfig;
typedef PP3DInfoType InfoType;

__PP3D_MODEL Model = PP3DModel;
// ================================

int main(int argc, char **argv)
{
	//'clc' for windows, 'clear' for linux
	if (system("cls") != 0)
	{
		system("clear");
	}
	server();

	InfoType Info = Config.Info;
	printf("%s: %s\nAuthor: %s\nAddress: %s\n", Info.Name, Info.Vers, Info.Auth, Info.Addr);

	fflush(stdin);
	printf("\n\t按下任意键退出\n");
	getch();
	return 0;
}