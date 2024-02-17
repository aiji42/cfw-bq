import { BigQuery } from './libs/bigquery';

export interface Env {
	GCP_SERVICE_ACCOUNT: string;
	ACCESS_TOKEN: KVNamespace;
}

const projectId = 'shopify-322306';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const bq = new BigQuery(JSON.parse(env.GCP_SERVICE_ACCOUNT), projectId);
		return new Response(
			JSON.stringify(
				await bq.dataset('shopify').table('orders').tableData().list({ startIndex: 2, maxResults: 10, selectedFields: 'id,name' }),
			),
		);
	},
};
