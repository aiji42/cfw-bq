import { GoogleKey } from 'cloudflare-workers-and-google-oauth';
import { QueryResponse } from '../types';
import { Dataset } from './dataset';
import { Client } from './client';

export class BigQuery extends Client {
	constructor(googleKey: GoogleKey, projectId: string) {
		super(googleKey, projectId);
	}

	/**
	 * Runs a BigQuery SQL query synchronously and returns query results if the query completes within a specified timeout.
	 *
	 * @param query - Required. A query string to execute, using Google Standard SQL or legacy SQL syntax. Example: "SELECT COUNT(f1) FROM myProjectId.myDatasetId.myTableId".
	 * @returns key-value pairs of the query results
	 */
	public async query(query: string): Promise<Record<string, any>[]> {
		const queryEndpoint = `https://bigquery.googleapis.com/bigquery/v2/projects/${this.projectId}/queries`;
		const res = await this.request(queryEndpoint, 'POST', { query, useLegacySql: false });

		const data: QueryResponse = await res.json();
		return data.rows.map((row) => {
			return row.f.reduce<Record<string, unknown>>((acc, field, index) => {
				acc[data.schema.fields[index].name] = field.v;
				return acc;
			}, {});
		});
	}

	public dataset(datasetId?: string): Dataset {
		return new Dataset(this.googleKey, this.projectId, datasetId);
	}
}
