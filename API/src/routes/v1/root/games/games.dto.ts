import { Type } from '@sinclair/typebox';

export const saveGameResultBody = Type.Object({
	winnerEmail: Type.String({ format: 'email' }),
	loserEmail: Type.String({ format: 'email' }),
	gameType: Type.Union([
		Type.Literal('MATCHMAKING'),
		Type.Literal('ROOM'),
		Type.Literal('TOURNAMENT')
	]),
	gameId: Type.String(),
});

export const saveGameResultResponse = Type.Object({
	success: Type.Boolean(),
	message: Type.String(),
});
