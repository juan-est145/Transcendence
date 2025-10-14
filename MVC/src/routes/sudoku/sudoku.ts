import { FastifyPluginAsync } from "fastify"

const sudokuRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (_req, reply) => reply.view("sudoku.ejs"))
}

export default sudokuRoute