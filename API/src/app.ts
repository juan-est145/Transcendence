import { join } from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import fs from 'node:fs'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {
  https: {
    key: NonSharedBuffer;
    cert: NonSharedBuffer;
  }
}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
  https: {
    key: fs.readFileSync("/etc/ssl/private/cert.key"),
    cert: fs.readFileSync("/etc/ssl/certs/selfsigned.crt"),
  }
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })
}

export default app
export { app, options }
