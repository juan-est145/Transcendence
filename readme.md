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
The main developer of the project. His functions were creating the API that interacts with the database and provides information to the MVC app when it requests it, integrating swagger in order to have schema definitions always available to the API responses and request parameters and implemented the S3 store minio solution for storing user's avatars. He was also responsible for creating the basic auth system by using jwt's, refresh tokens and session based management.

### jcallejo (architect and developer)
His main responsabilities were designing the logic of the pong game, setting up the 3D graphics for it, creating the networking of the game through the use of websockets for bidirectional and instant comunication between server and client and the implementation of the pong tournaments.

### rguerrer (developer)
This developer was in charge of using front-end tools to design many of the webpage layouts, implementing 2FA for secure loggin into the website and he also securing the webapp by encrypting the 2FA secret of the user's of the webpage.

### yfang (developer)
His main role was the implementation of an Oauth system that allows users to log in with their 42 network account if they do not wish to create their own.

# Technical stack
### Frontend
The frontend uses vanilla javascript with server side generated html through the use of ejs in the backend. The reason we didn't use a frontend framework like React, Angular or Vue is because the previous subject did not allowed us to do so. However, despite that, it is also true that this approach simplifies development, as we do everything from a back-end perspective and the app really does not need interactivity, so the use of a framework is mostly unnecessary.

For styling we used Tailwindcss, which is a very nice option for keeping styles consistent between them and not having bloated css classes that may cause problems down the line. We also use Babylon for the 3D graphics that the game uses and Vite to bundle all the game dependencies and optimize the final bundle. As for the programming language of our choice, we used Typescript for bettle type safety and having object definition

### Backend
Our backend uses mostly Fastify with Typescript. Again, as with the ejs pages, we were forced to use it by the previous subject. Despite that, the use of typescript in both our front-end and back-end, simplified a lot the development experience and sped up the project. The node js ecosystem is also huge, so that provided an advantage when we needed external libraries, like the minio js sdk for interacting with our s3 storage solution.

For storage, we used SQLite for the databse and Minio for storing images inside buckets for each user. We found more scalable to use this solution rather than storing images inside the filesystem of the container or inside a database and closer to good practices. Lastly, we use Nginx as a reverse proxy to provide accces to the website as an added feature of security. The only port that get's exposed during production mode is this one.