import { type Static } from "@sinclair/typebox";
import { saveGameResultBody, saveGameResultResponse } from "./games.dto";

export type SaveGameResultBody = Static<typeof saveGameResultBody>;
export type SaveGameResultResponse = Static<typeof saveGameResultResponse>;
