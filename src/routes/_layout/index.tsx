import { createFileRoute } from '@tanstack/react-router';

import { requireSubsonicCredentials } from '../../_core/requireSubsonicCredentials';
import { subsonicGetArtists } from '../../api/subsonic';

export const Route = createFileRoute('/_layout/')({
  async loader({ context, location }) {
    const credentials = requireSubsonicCredentials(context, location);
    const artists = await subsonicGetArtists().runAsync({ credentials });

    return {
      artists: artists.assertOk(),
      credentials,
    };
  },
});
