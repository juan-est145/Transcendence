import fp from 'fastify-plugin'
import fastify, { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client'

//colecta las informacions básicas del computador. register es un objeto para registrar dados
collectDefaultMetrics( {register} );

//contador de cuantas requisiciones fueran hechas
const httpRequestsTotal = new Counter ({ 
	name: 'http_requests_total',
	help: 'Total number of HTTP request',
	labelNames: ['method', 'route', 'status_code'],
});

//Histogram mide la distribución de los valores durante x tiempo. Cuenta los valores en cada bucket
const httpRequestDuration = new Histogram({
	name: 'http_request_duration_seconds',
	help: 'Duration of HTTP requests in seconds',
	labelNames: ['method', 'route'],
	buckets: [0.1, 0.5, 1, 2, 5],
});

//Gauge mide el estado actual de algo, puede subir a lo largo del tiempo
const activeConnections = new Gauge ({
	name: 'active_connections',
	help: 'Number of active connections',
});

const authAttempts = new Counter ({
	name: 'auth_attempts_total',
	help: 'Total authentication attempts',
	labelNames: ['type', 'status'],
});

const dbOperations = new Counter ({
	name: 'db_operations_total',
	help: 'Total database operations',
	labelNames: ['operation', 'table'],
});

const metricsPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	fastify.decorate( 'metrics', {
		httpRequestsTotal,
		httpRequestDuration,
		activeConnections,
		authAttempts,
		dbOperations,
	});

	fastify.addHook('onRequest', async (req, res) => {
		(req as any).startTime = Date.now();
		activeConnections.inc()
	});

	fastify.addHook('onResponse', async (req, res) => {
		const duration = (Date.now() - (req as any).startTime) / 1000;
		const route = req.routerPath || req.url;
		//const route = (req as any).routeConfig?.url || req.url || 'unknown';

		
	});
};