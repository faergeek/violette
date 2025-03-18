import { createFileRoute } from '@tanstack/react-router';

import { requireSubsonicCredentials } from '../_core/requireSubsonicCredentials';

export const Route = createFileRoute('/_layout')({
  beforeLoad: requireSubsonicCredentials,
});
