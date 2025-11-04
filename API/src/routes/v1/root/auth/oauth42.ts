import { FastifyInstance } from 'fastify';
import { findOrCreateUser, signJwt } from './auth.service';

export default async function (fastify: FastifyInstance) {
  fastify.post('/oauth42', async (request, reply) => {
    const { id42, email, username } = request.body as { 
      id42: string, 
      email: string, 
      username: string 
    };
    
    const user = await findOrCreateUser(fastify, { id42, email, username });
    const { jwt, refreshJwt } = signJwt(fastify, { 
      email: user.email, 
      username: user.username 
    });

    return { jwt, refreshJwt, user };
  });
}