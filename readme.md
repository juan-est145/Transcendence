*This project has been created as part of the 42 curriculum by juestrel, jcallejo, rguerrer and yfang*

# Description
The following project is called Pong-game, and it is a ssr webapp made with fastify in the backend, sqlite as the RDBM for the data and Minio for storing images. This webapp allows user's to log in and play pong online and locally against other users, as well as sending friend requests to each other. They can also create tournaments that track the user's score.

# Instructions
In order to deploy this project, you first have to create at the root of the directory a .env file with the following keys:

```bash
DATABASE_URL=
PRIVATE_JWT_KEY=
PUBLIC_JWT_KEY=
TEST_USER_PASSWD=
NODE_TLS_REJECT_UNAUTHORIZED=0
COOKIE_SECRET=
MINIO_ROOT_USER=
MINIO_ROOT_PASSWORD=
MINIO_NODE_USER=
MINIO_NODE_PASSWORD=
NODE_EXTRA_CA_CERTS=
ENCRYPTION_KEY=
OAUTH42_CLIENT_ID=
OAUTH42_CLIENT_SECRET=
OAUTH42_REDIRECT_URI=
```

After that has been done, you should run make at the root at the project if you want to use the production version or make dev if you want to run the dev version. To stop all containers from running, use make clean.

In order to run this project, you need to be using a Linux distro and to have installed the Makefile tool, Nodejs if you want to use the dev mode and most importantly, Docker to be able to run the containers.

# Resources
For this specific project, AI was used mainly as a chatbot to validate certain ideas on how to handle parts of the project. For example, we knew from the beggining that storing user's avatars inside an SQL database was a really bad idea and one that brought really bad performance, so we tried to find better solutions, which brought us to s3 stores solutions. However the implementation of those ideas was entirely our own, for better and for worse. Some links that we found useful are presented here:

https://fastify.dev/docs/latest/ This allowed us to understand how to use the backend framework.

https://blog.logrocket.com/implement-oauth-2-0-node-js/ We used this website to understand the basics of omniauth logging and how did it work.

https://github.com/minio/minio-js The documentation for interacting with the minio instance programatically through Javascript on the server.

# Team information

### juestrel (product owner, project manager and developer) 

