import fp from 'fastify-plugin'
import { FastifyInstance} from 'fastify'
import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client'

//colecta las informacions básicas del computador. register es un objeto para registrar dados
collectDefaultMetrics();

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

//Gauge mide el estado actual de algo, puede cambiar a lo largo del tiempo
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


export default fp(async function (fastify: FastifyInstance) {
  // Hook para capturar métricas de todas as requisições
    if (!fastify.hasDecorator('metrics'))
    {

      fastify.addHook('onRequest', async (request) => {
        activeConnections.inc();
        request.startTime = Date.now();
    });

    fastify.addHook('onResponse', async (request, reply) => {
      const duration = (Date.now() - (request.startTime || Date.now())) / 1000;
      const route = request.routeOptions?.url || request.url;

      httpRequestsTotal.inc({
        method: request.method,
        route: route,
        status_code: reply.statusCode.toString(),
      });

      httpRequestDuration.observe(
        {
          method: request.method,
          route: route,
        },
        duration
      );

      activeConnections.dec();
    });

    // Decorar fastify com métricas customizadas
    fastify.decorate('metrics', {
      httpRequestsTotal,
      httpRequestDuration,
      activeConnections,
      authAttempts,
      register,
      dbOperations,
    });
  }
});

// Adicionar tipos TypeScript
declare module 'fastify' {
  interface FastifyRequest {
    startTime?: number;
  }
  
  interface FastifyInstance {
    metrics: {
      httpRequestsTotal: Counter<string>;
      httpRequestDuration: Histogram<string>;
      activeConnections: Counter<string>;
      authAttempts: Counter<string>;
      dbOperations: Counter<string>;
      register: typeof register;
    };
  }
}