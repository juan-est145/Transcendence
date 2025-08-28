import fastify from "fastify";
import fp from "fastify-plugin";
import App, { options } from "../src/app";

export function build() {
  const app = fastify();

  beforeAll(async () => {
    void app.register(fp(App), options);
    await app.ready();
  });

  afterAll(() => app.close());

  return app;
}