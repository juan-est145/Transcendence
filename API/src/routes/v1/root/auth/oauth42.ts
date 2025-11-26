import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service';

export default async function (fastify: FastifyInstance) {
  const authService = new AuthService(fastify);

  fastify.post('/oauth42', async (request, reply) => {
    const { id42, email, username } = request.body as { 
      id42: string, 
      email: string, 
      username: string
    };
    
    const user = await authService.findOrCreateUser({ id42, email, username });
    const { jwt, refreshJwt } = authService.signJwt({ 
      id: user.id,
      email: user.email, 
      username: user.username 
    });

    return { jwt, refreshJwt, user };
  });
}