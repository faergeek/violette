export type SkeletonProps<T extends Record<string, unknown>> =
  | ({ [K in keyof T]: T[K] } & { skeleton?: false })
  | ({ [K in keyof T]?: never } & { skeleton: true });
