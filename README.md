# BigQuery Client for Cloudflare Workers

This is a BigQuery client library for Cloudflare Workers. It allows you to query BigQuery from within a Cloudflare Worker.

## Installation

```sh
npm install bg-cf-worker
```

## Configuration

You need to create a service account key in the Google Cloud Console and store it as a secret in Cloudflare Workers.

```sh
wrangler secret put GCP_SERVICE_ACCOUNT --env production
```

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

## Usage

```ts
import { BigQuery } from 'bg-cf-worker';

export interface Env {
	GCP_SERVICE_ACCOUNT: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const bq = new BigQuery(JSON.parse(env.GCP_SERVICE_ACCOUNT), projectId);
		const query = 'SELECT * FROM `your-project.your-dataset.your-table` LIMIT 10';
		const result = await bq.query(query);
		return new Response(JSON.stringify(result), { status: 200 });
	}
};
```

## API Coverage

This library is based on [BigQuery REST API v2](https://cloud.google.com/bigquery/docs/reference/rest). It currently supports the following methods:

- REST Resource: v2.datasets
  - [x] delete (⚠️ experimental) `new BigQuery().dataset('your-dataset').delete`
  - [x] get (⚠️ experimental) `new BigQuery().dataset('your-dataset').get`
  - [ ] insert
  - [x] list (⚠️ experimental) `new BigQuery().dataset().list`
  - [ ] patch
  - [ ] update
- REST Resource: v2.jobs
  - [ ] cancel
  - [ ] delete
  - [ ] get
  - [ ] getQueryResults
  - [ ] insert
  - [ ] list
  - [x] query `new BigQuery().query('your-query')`
- REST Resource: v2.tables
	- [x] delete (⚠️ experimental) `new BigQuery().dataset('your-dataset').table('your-table').delete`
	- [x] get (⚠️ experimental) `new BigQuery().dataset('your-dataset').table('your-table').get`
	- [ ] insert
	- [x] list (⚠️ experimental) `new BigQuery().dataset('your-dataset').table().list`
	- [ ] patch
	- [ ] update
- REST Resource: v2.tabledata
	- [ ] insertAll
	- [x] list (⚠️ experimental) `new BigQuery().dataset('your-dataset').table('your-table').tableData().list`
- REST Resource: v2.models
  - yet to be implemented
- REST Resource: v2.projects
	- yet to be implemented
- REST Resource: v2.routines
	- yet to be implemented
- REST Resource: v2.rowAccessPolicies
	- yet to be implemented

We look forward to your contributions to complete the API coverage.
