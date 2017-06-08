#ifndef __PP3D_CONFIG_H
#define __PP3D_CONFIG_H

typedef struct
{
	const char *Name;
	const char *Vers;
	const char *Auth;
	const char *Addr;
} PP3DInfoType;

typedef struct
{
	PP3DInfoType Info;
	const char *Pet;
} __PP3D_CONFIG;
extern __PP3D_CONFIG PP3DConfig;

#endif