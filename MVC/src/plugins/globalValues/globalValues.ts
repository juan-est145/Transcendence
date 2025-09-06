import fp from "fastify-plugin";

interface IGlobals {
	avatarBucketName: "avatars",
	defaultAvatarName: "default-avatar.png",
	defaultcontentType: "image/png",
};

export default fp(async (fastify) => {
	const globals: IGlobals = {
		avatarBucketName: "avatars",
		defaultAvatarName: "default-avatar.png",
		defaultcontentType: "image/png",
	};
	fastify.decorate("globals", globals);
});

declare module "fastify" {
	interface FastifyInstance {
		globals: IGlobals;
	}
};