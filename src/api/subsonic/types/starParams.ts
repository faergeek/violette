export type StarParams =
  | { albumId: string; artistId?: never; id?: never }
  | { albumId?: never; artistId: string; id?: never }
  | { albumId?: never; artistId?: never; id: string };
