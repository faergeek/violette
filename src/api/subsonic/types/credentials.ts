import * as v from 'valibot';

export const SubsonicCredentials = v.object({
  salt: v.string(),
  serverBaseUrl: v.string(),
  token: v.string(),
  username: v.string(),
});

export type SubsonicCredentials = v.InferInput<typeof SubsonicCredentials>;
