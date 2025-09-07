import z from "zod";

const avatarFieldName = "avatar";
const avatarType = "file";

export const avatarBody = z.object({
	fieldname: z.literal(avatarFieldName, { error: `The fieldname must have ${avatarFieldName} as it's name` }),
	type: z.literal(avatarType, { error: `The input type must be a ${avatarType}` }),
	mimetype: z.enum([
		"image/png",
		"image/jpeg",
		"image/gif",
	], { error: "The file must be either a png, jpeg or gif" }),
});