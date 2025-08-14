import '@fastify/session';

declare module 'fastify' {
  interface Session {
    jwt?: string;
  }
}