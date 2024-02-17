import { Client } from './client';
import { GoogleKey } from 'cloudflare-workers-and-google-oauth';
import { experimental } from './decorators';
import { TableData } from './tabledata';

function assertTableId(tableId: string | undefined): asserts tableId is string {
	if (!tableId) throw new Error('tableId is required');
}

export class Table extends Client {
	readonly datasetId: string;
	readonly tableId?: string;
	readonly endpoint: string;

	constructor(googleKey: GoogleKey, projectId: string, datasetId: string, tableId?: string) {
		super(googleKey, projectId);
		this.datasetId = datasetId;
		this.tableId = tableId;
		this.endpoint = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/datasets/${datasetId}/tables`;
	}

	/**
	 * Deletes the table specified by tableId from the dataset. If the table contains data, all the data will be deleted.
	 *
	 * @returns If successful, the response body will be empty.
	 */
	@experimental
	public async delete() {
		assertTableId(this.tableId);
		return this.request(`${this.endpoint}/${this.tableId}`, 'DELETE');
	}

	/**
	 * Gets the specified table resource by table ID. This method does not return the data in the table, it only returns the table resource, which describes the structure of this table.
	 *
	 * @param selectedFields - tabledata.list of table schema fields to return (comma-separated). If unspecified, all fields are returned. A fieldMask cannot be used here because the fields will automatically be converted from camelCase to snake_case and the conversion will fail if there are underscores. Since these are fields in BigQuery table schemas, underscores are allowed.
	 * @param view - Specifies the view that determines which table information is returned. By default, basic table information and storage statistics (STORAGE_STATS) are returned.
	 *   - TABLE_METADATA_VIEW_UNSPECIFIED: The default value. Default to the STORAGE_STATS view.
	 *   - BASIC: Includes basic table information including schema and partitioning specification. This view does not include storage statistics such as numRows or numBytes. This view is significantly more efficient and should be used to support high query rates.
	 *   - STORAGE_STATS: Includes all information in the BASIC view as well as storage statistics (numBytes, numLongTermBytes, numRows and lastModifiedTime).
	 *   - FULL: Includes all table information, including storage statistics. It returns same information as STORAGE_STATS view, but may contain additional information in the future.
	 * @returns The response body contains an instance of [Table](https://cloud.google.com/bigquery/docs/reference/rest/v2/tables#Table).
	 */
	@experimental
	public async get({
		selectedFields,
		view,
	}: { selectedFields?: string; view?: 'TABLE_METADATA_VIEW_UNSPECIFIED' | 'BASIC' | 'STORAGE_STATS' | 'FULL' } = {}) {
		assertTableId(this.tableId);
		const url = new URL(`${this.endpoint}/${this.tableId}`);
		if (selectedFields) url.searchParams.append('selectedFields', selectedFields);
		if (view) url.searchParams.append('view', view);
		return this.request(url, 'GET');
	}

	/**
	 * Lists all tables in the specified dataset. Requires the READER dataset role.
	 *
	 * @param maxResults - The maximum number of results to return in a single response page. Leverage the pageToken to iterate through the entire dataset list.
	 * @param pageToken - Page token, returned by a previous call, to request the next page of results.
	 * @returns If successful, the response body contains [data](https://cloud.google.com/bigquery/docs/reference/rest/v2/tables/list#response-body).
	 */
	@experimental
	public async list({ maxResults, pageToken }: { maxResults?: number; pageToken?: string } = {}) {
		const url = new URL(`${this.endpoint}`);
		if (maxResults) url.searchParams.append('maxResults', maxResults.toString());
		if (pageToken) url.searchParams.append('pageToken', pageToken);
		return this.request(url, 'GET');
	}

	public tableData() {
		assertTableId(this.tableId);
		return new TableData(this.googleKey, this.projectId, this.datasetId, this.tableId);
	}
}
