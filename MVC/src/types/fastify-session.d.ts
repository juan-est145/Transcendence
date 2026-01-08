import '@fastify/session';

declare module 'fastify' {
  interface Session {
    jwt?: string;
    refreshJwt?: string,
    user?: {
      id: number;
      id42?: string;
      username: string;
      email: string;
      password?: string;
      profile?: any;
    };
  }
}