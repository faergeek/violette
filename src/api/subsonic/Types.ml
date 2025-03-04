type deps = { credentials : Credentials.t option }

type error =
  | NoCredentials
  | NetworkError
  | RequestFailed of { status : int; statusText : string }
  | NonJsonContentType of { actual : string option }
  | ApiError of { code : int; message : string }
  | ValidationFailed of { issues : exn }
