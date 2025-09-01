import fp from "fastify-plugin";

interface IGlobals {
	avatarBucketName: string,
	defaultAvatarName: string,
};

export default fp(async (fastify) => {
	const globals: IGlobals = {
		avatarBucketName: "avatars",
		defaultAvatarName: "default-avatar.png",
	};
	fastify.decorate("globals", globals);
});

declare module "fastify" {
	interface FastifyInstance {
		globals: IGlobals;
	}
};