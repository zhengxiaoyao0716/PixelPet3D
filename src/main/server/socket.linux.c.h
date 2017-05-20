#include <stdio.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/un.h>

static char SERVER_ADDR[] = "./../.pp3d-core.sock";
static const int SOCKADDR_LEN = sizeof(struct sockaddr_un);

static void server(PP3DHandler handler)
{
	unlink(SERVER_ADDR);

	// Create socket
	int sockfd = socket(AF_UNIX, SOCK_DGRAM, 0);
	if (sockfd < 0)
	{
		perror("create socket failed");
		exit(EXIT_FAILURE);
	}

	// Init serverAddr address
	struct sockaddr_un serverAddr;
	memset(&serverAddr, 0, SOCKADDR_LEN);
	serverAddr.sun_family = AF_UNIX;
	strcpy(serverAddr.sun_path, SERVER_ADDR);

	// Bind socket
	if (bind(sockfd, (struct sockaddr *)&serverAddr, SOCKADDR_LEN))
	{
		perror("bind socket failed");
		exit(EXIT_FAILURE);
	}

	printf("[ Listen %s ]\n", SERVER_ADDR);
	while (1)
	{
		fflush(stdout);

		struct sockaddr_un connectAddr;
		socklen_t connectAddrLen = SOCKADDR_LEN;
		char recvBuf[BUFSIZ] = {0}, sendBuf[BUFSIZ] = {0};

		if (recvfrom(sockfd, recvBuf, BUFSIZ, 0, (struct sockaddr *)&connectAddr, &connectAddrLen) == -1)
		{
			perror("recv failed\n");
			continue;
		}

		handler(recvBuf, sendBuf);

		if (sendto(sockfd, sendBuf, BUFSIZ, 0, (struct sockaddr *)&connectAddr, connectAddrLen) == -1)
		{
			perror("send failed\n");
			continue;
		}
	}

	close(sockfd);
}