# BigQuery Client for Cloudflare Workers

This is a BigQuery client library for Cloudflare Workers. It allows you to query BigQuery from within a Cloudflare Worker.

## Installation

```sh
npm install cfw-bq
```

## Configuration

You need to provide the service account credentials as a secret in Cloudflare Workers.

```json
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account-email",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

Set the secret in Cloudflare Workers:

```sh
wrangler secret put MY_CREDENTIALS
```

The secret name `MY_CREDENTIALS` is just an example. You can use any name you like.


## Usage

```ts
import { BigQuery } from 'cfw-bq';

export interface Env {
  MY_CREDENTIALS: string;
}

const project = '{your-project-id}';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const bq = new BigQuery(JSON.parse(env.MY_CREDENTIALS), project);
    const query = 'SELECT * FROM `your-project.your-dataset.your-table` LIMIT 10';
    const result = await bq.query(query);

    return Response.json(result);
  }
};
```

### for TypeScript

You can specify the schema of the result by providing a generic type argument to the `query` method.

```ts
interface Row {
  id: number;
  name: string;
}

const result = await bq.query<Row>(query);
// result is of type Row[]
```

## License

MIT (see: [LICENSE](LICENSE))
