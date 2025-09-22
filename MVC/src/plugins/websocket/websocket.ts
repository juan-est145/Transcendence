import { FastifyPluginAsync } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';

const websocketPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyWebsocket);

  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', message => {
      // Echo the message back
      connection.socket.send(`You said: ${message}`);
    });
  });
};

export default websocketPlugin;