import { BigQuery } from '../src';

export interface Env {
	GCP_SERVICE_ACCOUNT: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const query = new URL(request.url).searchParams.get('query');
		const project = new URL(request.url).searchParams.get('project');
		if (query && project) {
			const bq = new BigQuery(JSON.parse(env.GCP_SERVICE_ACCOUNT), project);
			const res = await bq.query(query);
			return Response.json(res);
		}

		return new Response('Missing query or project', { status: 400 });
	},
};
