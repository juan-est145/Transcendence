import z from "zod";

export const relationShipBody = z.object({
	action: z.enum([ "ACCEPT", "DELETE" ]),
});