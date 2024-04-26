import { GoogleKey } from 'cloudflare-workers-and-google-oauth';
import { Field, QueryResponse } from './types';
import { Client } from './client';

/**
 * Options for the BigQuery query method.
 * @property {string} [location] - The geographic location of the job. Required except for US and EU.
 */
export interface QueryOptions {
	location?: string;
}

export interface QueryResult {
	[key: string]: any;
}

export class BigQuery extends Client {
	constructor(googleKey: GoogleKey, projectId: string) {
		super(googleKey, projectId);
	}

	/**
	 * Runs a BigQuery SQL query synchronously and returns query results if the query completes within a specified timeout.
	 * @template T extends QueryResult - Key-value pairs of query results.
	 * @param {string} query - Required. A query string to execute, using Google Standard SQL or legacy SQL syntax. Example: "SELECT COUNT(f1) FROM myProjectId.myDatasetId.myTableId".
	 * @param {QueryOptions} [options] - Optional. Additional options for the query.
	 * @returns {Promise<T[]>} - An array of query results.
	 */
	public async query<T extends QueryResult = QueryResult>(query: string, options?: QueryOptions): Promise<T[]> {
		const queryEndpoint = `https://bigquery.googleapis.com/bigquery/v2/projects/${this.projectId}/queries`;
		const data = await this.request<QueryResponse>(queryEndpoint, 'POST', { query, useLegacySql: false, ...options });

		return (
			data.rows?.map((row) => {
				return row.f.reduce<T>((acc, field, index) => {
					return { ...acc, [data.schema.fields[index].name]: transformValue(field.v, data.schema.fields[index].type) };
				}, {} as T);
			}) ?? []
		);
	}
}

const transformValue = (value: string | null, type: Field['type']) => {
	if (value === null) return null;

	switch (type) {
		case 'INTEGER':
		case 'INT64':
			return parseInt(value);
		case 'FLOAT':
		case 'FLOAT64':
		case 'NUMERIC':
			return parseFloat(value);
		case 'BOOLEAN':
		case 'BOOL':
			return value === 'true';
		case 'TIMESTAMP':
		case 'DATETIME':
			return new Date(Number(value) * 1000);
		case 'JSON':
			return JSON.parse(value);
		case 'STRING':
		case 'BYTES':
		case 'DATE':
		case 'TIME':
		case 'GEOGRAPHY':
		case 'BIGNUMERIC':
		case 'RECORD': // FIXME
		case 'STRUCT': // FIXME
		default:
			return value;
	}
};
