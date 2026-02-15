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
### Front-end
The frontend uses vanilla javascript with server side generated html through the use of ejs in the backend. The reason we didn't use a frontend framework like React, Angular or Vue is because the previous subject did not allowed us to do so. However, despite that, it is also true that this approach simplifies development, as we do everything from a back-end perspective and the app really does not need interactivity, so the use of a framework is mostly unnecessary.

For styling we used Tailwindcss, which is a very nice option for keeping styles consistent between them and not having bloated css classes that may cause problems down the line. We also use Babylon for the 3D graphics that the game uses and Vite to bundle all the game dependencies and optimize the final bundle. As for the programming language of our choice, we used Typescript for bettle type safety and having object definition

### Back-end
Our backend uses mostly Fastify with Typescript. Again, as with the ejs pages, we were forced to use it by the previous subject. Despite that, the use of typescript in both our front-end and back-end, simplified a lot the development experience and sped up the project. The node js ecosystem is also huge, so that provided an advantage when we needed external libraries, like the minio js sdk for interacting with our s3 storage solution.

For storage, we used SQLite for the databse and Minio for storing images inside buckets for each user. We found more scalable to use this solution rather than storing images inside the filesystem of the container or inside a database and closer to good practices. Lastly, we use Nginx as a reverse proxy to provide accces to the website as an added feature of security. The only port that get's exposed during production mode is this one.

# Database Schema

```bash
// This table represents the basic login data of an user. At the application level, we must make sure that for every user created, a profile table is created

model Users {
  id       Int      @id @default(autoincrement())
  id42     String? @unique
  username String   @unique
  password String?
  email    String   @unique
  profile  Profile?
  twoFactorEnabled Boolean  @default(false)
  twoFactorSecret  String?
}

model Profile {
  id          Int                  @id
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt()
  avatar      Avatar?
  online      Boolean              @default(false)
  user        Users                @relation(fields: [id], references[id])
  friend1     Friends[]            @relation("Friend1")
  friend2     Friends[]            @relation("Friend2")
  gamesAsPlayer GameResult[]       @relation("PlayerGames")
  gamesAsOpponent GameResult[]     @relation("OpponentGames")
}

model Avatar {
  id Int @id
  name String @default("default-avatar.png")
  contentType String @default("image/png")
  profile Profile @relation(fields: [id], references: [id])
}

// It is imperative that user1Id is always the smallest index number to avoid duplicates. Need to enforce at the application level
model Friends {
  user1Id Int
  user2Id Int
  status  Friendship
  user1   Profile    @relation("Friend1", fields: [user1Id], references: [id])
  user2   Profile    @relation("Friend2", fields: [user2Id], references: [id])

  @@id([user1Id, user2Id])
}

enum Friendship {
  FIRST_PENDING
  SECOND_PENDING
  FRIENDS
}

// Game results for tracking wins/losses in matchmaking, rooms, and tournaments
model GameResult {
  id          Int      @id @default(autoincrement())
  playerId    Int
  opponentId  Int
  result      GameResultType
  gameType    GameType
  gameId      String   // Match ID, room ID, or tournament match ID
  createdAt   DateTime @default(now())
  
  player      Profile  @relation("PlayerGames", fields: [playerId], references: [id])
  opponent    Profile  @relation("OpponentGames", fields: [opponentId], references: [id])
}

enum GameResultType {
  WIN
  LOSS
}

enum GameType {
  MATCHMAKING
  ROOM
  TOURNAMENT
}

```

# Modules (Total of 16 points)
### Use a backend framework (Minor: 1 point)
*Team members: Everyone*

This module has been the backbone of our project. Almost the entirety of it has been built using Fastify, both for the MVC part, that handled the frontend and passed requests to the Minio store and the API as well as the back-end composed of the API, that created JWT's and performed CRUD operations on the database. Choosing this module was obvious, given that
most modern webapps need a backend for functioning. 

### Implement real-time features using WebSockets or similar technology (Major: 2 points)
*Team members: jcallejo*

This module was chosen because in order to have real time online players we required a solution that provided us with real-time bidirectional communication. This was necessary to handle the game logic of each online match and also to keep track of which users were online at the moment. That is the main reason we defaulted to using websockets. 

### Use an ORM for the database (Minor: 1 point)
*Team members: Everyone*

A pretty easy module. We chose Prisma as our solutin given it's popularity and ease of use. Also, an ORM speed's up the creation of queries and creates Typescript objects when returning results, so it makes working with the database data that much easier compared to handwritten queries. With hindsight, perhaps we could have used a different ORM like Drizzle, which is said to be more efficient, but alas, Prisma was enough for us.

### Server-Side Rendering (SSR) for improved performance and SEO (Minor: 1 point).
*Team members: Everyone*

Although it is true that we couldn't use a proper front-end framework like React at the time, we still believe that SSR with html templates was the best solution. They do not incurr in added complexities like learning a new framework, it allows us to stay close to the back-end at all times and allows us to pass data through those templates and inform the user's of the website of new information. For this kind of project, it provides the best of both worlds. Also the improved SEO for indexing bots is a nice bonus.

### Standard user management and authentication. (Major: 2 points)
*Team members: juestrel*

This is a basic feature of most modern websites, so of course it made sense that we implemented it as well. All features are working and the way it does so is that the MVC app receives the user commands and sends the data to the API, which it makes sure to store that information in the database and send the response back. Also, we needed this module in order to have logged in users and their information for creating online tournaments.

### Implement remote authentication with OAuth 2.0 (Google, GitHub, 42, etc.) (Minor: 1 point)
*Team members: yfang*

We wanted to provided members of the 42 network with an easy way to log into the website without the need of creating a new account on a service. That is why we decided to implement this module, to make easier the evaluation and because it is a modern feature of most websites.

### Implement a complete 2FA (Two-Factor Authentication) system for the users (Minor: 1 point)
*Team members: rguerrer*

Nowadays, cyberattacks are a constant in the online world and websites that have a logging system with personal data are a very lucrative target. We wanted to increase the security of our website and implement railguards against account hijacking. This is why we decided to implement this module. It works with all 2FA apps and solutions.

### Implement a complete web-based game where users can play against each other (Major: 2 points).
*Team members: jcallejo*

This module was kinda forced to us because we were still using the old Transcendence subject when we started, so we didn't have much of a choice in the matter. Nevertheless, it has proven to be a very interesting project and we would have chosen it anyway because it is a lot of fun to develop an online game that everyone can play.

### Remote players — Enable two players on separate computers to play the same game in real-time (Major: 2 points).
*Team members: jcallejo*

We chose this module because we thought that if we were going to create a web based game, it would be a good idea to allow people to play it from different parts of the world and without needing to use the same computer to do so. We view this module as non-negotiable to the core idea of our project.

### Implement advanced 3D graphics using a library like Three.js or Babylon.js (Major: 2 points).
*Team members: jcallejo*

This module was chosen because we wanted to make a game with physics and that it looked more modern that the original 2D Pong game of 1972. For this, Babylon.js seemed like a good choice and the fact that Fastify has good integration with tools like Vite.js, made this an obvious choice.

### Implement a tournament system (Minor: 1 point).
*Team members: jcallejo*

If we were to play a game with our friends, it seems only logical that we also allow for a more competitive playstyle. This is the main reason why we decided to create this module. It also allowed us to keep track of user statistics.