import * as v from 'valibot';

export const DiscTitle = v.object({ disc: v.number(), title: v.string() });
export type DiscTitle = v.InferInput<typeof DiscTitle>;
