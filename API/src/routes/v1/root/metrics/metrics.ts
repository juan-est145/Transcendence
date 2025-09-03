import { FastifyInstance } from 'fastify'
import { register } from 'prom-client'


export async function metrics(fastify: FastifyInstance) {
	fastify.get('/metrics', async (req, res) => {
		res.type('text/plain');
		return register.metrics();
	});
}
