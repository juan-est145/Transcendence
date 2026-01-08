import { Static } from '@sinclair/typebox';
import { Generate2FASecretDto, Enable2FADto, Verify2FADto, Disable2FADto } from './2fa.dto';

export type Generate2FASecretType = Static<typeof Generate2FASecretDto>;
export type Enable2FAType = Static<typeof Enable2FADto>;
export type Verify2FAType = Static<typeof Verify2FADto>;
export type Disable2FAType = Static<typeof Disable2FADto>;