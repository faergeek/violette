import { AlertCircle } from 'lucide-react';

import type { SubsonicError } from '../api/types';
import { Alert, AlertDescription, AlertTitle } from './alert';

function formatSubsonicError(error: SubsonicError) {
  return error.type === 'api-error'
    ? `${error.code}: ${error.message}`
    : error.type === 'request-failed'
      ? `${error.status}: ${error.statusText}`
      : error.type === 'network-error'
        ? 'Network error occurred. Please check your network connection'
        : 'Unexpected API response';
}

export function SubsonicApiError({
  error,
  ...otherProps
}: React.ComponentProps<typeof Alert> & {
  error: SubsonicError;
}) {
  return (
    <Alert variant="destructive" {...otherProps}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>

      <AlertDescription>{formatSubsonicError(error)}</AlertDescription>
    </Alert>
  );
}
