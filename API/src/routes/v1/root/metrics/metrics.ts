import { FastifyInstance } from 'fastify'

export default async function metricsRoute(fastify: FastifyInstance) {
    fastify.get('/metrics', {
        schema: {
            tags: ['Metrics'],
            summary: 'Prometheus metrics endpoint',
            description: 'Returns metrics in Prometheus format',
            response: {
                200: {
                    description: 'Metrics in Prometheus format',
                    type: 'string',
                }
            }
        }
    }, async (request, reply) => {
        try {
            const metrics = await fastify.metrics.register.metrics();
            reply.header('Content-Type', fastify.metrics.register.contentType);
            return metrics;
        } catch (error) {
            fastify.log.error('Error generating metrics:', error);
            reply.code(500).send({ error: 'Failed to generate metrics' });
        }
    });
}