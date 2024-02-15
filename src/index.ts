import GoogleAuth, { GoogleKey } from 'cloudflare-workers-and-google-oauth';
import { QueryResponse } from './types';

export interface Env {
	GCP_SERVICE_ACCOUNT: string;
	ACCESS_TOKEN: KVNamespace;
}

const projectId = 'shopify-322306';
const queryEndpoint = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`;

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		let token = await env.ACCESS_TOKEN.get('token');
		if (!token) {
			console.log('Fetching token');
			const scopes: string[] = ['https://www.googleapis.com/auth/bigquery'];
			const googleAuth: GoogleKey = JSON.parse(env.GCP_SERVICE_ACCOUNT);

			const oauth = new GoogleAuth(googleAuth, scopes);
			token = (await oauth.getGoogleAuthToken()) ?? null;
			if (!token) return new Response('Failed to get token', { status: 500 });

			ctx.waitUntil(env.ACCESS_TOKEN.put('token', token, { expirationTtl: 60 * 60 }));
		}

		const datasetId = 'shopify';
		const tableId = 'orders';

		const query = {
			query: `SELECT * FROM \`${datasetId}.${tableId}\` LIMIT 10`,
			useLegacySql: false,
		};

		const res = await fetch(queryEndpoint, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(query),
		});
		if (!res.ok) return new Response('Failed to fetch data', { status: 500 });

		const data: QueryResponse = await res.json();
		const rows = data.rows.map((row) => {
			return row.f.reduce<Record<string, unknown>>((acc, field, index) => {
				acc[data.schema.fields[index].name] = field.v;
				return acc;
			}, {});
		});

		return new Response(JSON.stringify(rows), { headers: { 'content-type': 'application/json' } });
	},
};
