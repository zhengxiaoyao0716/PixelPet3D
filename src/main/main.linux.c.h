#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/un.h>

static char SERVER_ADDR[] = "./.pp3d-core.sock";
static const int SOCKADDR_LEN = sizeof(struct sockaddr_un);

void server()
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

	while (true)
	{
		struct sockaddr_un connectAddr;
		socklen_t connectAddrLen = SOCKADDR_LEN;

		// Recv
		char recvBuf[BUFSIZ] = {0};
		if (recvfrom(sockfd, recvBuf, BUFSIZ, 0, (sockaddr*)&connectAddr, &connectAddrLen) > 0)
		{
			printf("recv: %s\n", recvBuf);
		}
		else
		{
			perror("recv failed\n");
			exit(EXIT_FAILURE);
		}

		// Send
		char sendBuf[BUFSIZ] = "pong";
		if (sendto(sockfd, sendBuf, BUFSIZ, 0, (sockaddr*)&connectAddr, connectAddrLen) > 0)
		{
			printf("send: %s\n", sendBuf);
		}
		else
		{
			perror("send failed\n");
			exit(EXIT_FAILURE);
		}
	}

	close(sockfd);
}