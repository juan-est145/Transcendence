import { FastifyPluginAsync } from 'fastify'

const pongRoutes: FastifyPluginAsync = async (fastify, opts) => {

		fastify.get('/pong/2d', async (request, reply) => {
			return reply.sendFile('pong/2d/index.html')
		})
		fastify.get('/pong/3d', async (request, reply) => {
			return reply.sendFile('pong/3d/index.html')
		})
}

export default pongRoutes