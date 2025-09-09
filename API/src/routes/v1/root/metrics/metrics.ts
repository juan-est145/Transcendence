import { FastifyInstance } from 'fastify'

export default async function metricsRoute(fastify: FastifyInstance) {
    fastify.get('/metrics', async (request, reply) => {
        try {
            const metrics = await fastify.metrics.register.metrics();
            reply
                .header('Content-Type', fastify.metrics.register.contentType)
                .send(await fastify.metrics.register.metrics())
            return metrics;
        } catch (error) {
            fastify.log.error('Error generating metrics:', error);
            reply.code(500).send({ error: 'Failed to generate metrics' });
        }
    });
}