import { Client } from './client';
import { GoogleKey } from 'cloudflare-workers-and-google-oauth';
import { experimental } from './decorators';

export class TableData extends Client {
	readonly datasetId: string;
	readonly tableId: string;
	readonly endpoint: string;

	constructor(googleKey: GoogleKey, projectId: string, datasetId: string, tableId: string) {
		super(googleKey, projectId);
		this.datasetId = datasetId;
		this.tableId = tableId;
		this.endpoint = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/datasets/${datasetId}/tables/${tableId}`;
	}

	/**
	 * tabledata.list the content of a table in rows.
	 *
	 * @param startIndex - Start row index of the table.
	 * @param maxResults - Row limit of the table.
	 * @param pageToken - To retrieve the next page of table data, set this field to the string provided in the pageToken field of the response body from your previous call to tabledata.list.
	 * @param selectedFields - Subset of fields to return, supports select into sub fields. Example: selectedFields = "a,e.d.f";
	 * @param formatOptions - Output timestamp field value in usec int64 instead of double. Output format adjustments.
	 *   - useInt64Timestamp: Optional. Output timestamp as usec int64. Default is false.
	 * @returns If successful, the response body contains [data](https://cloud.google.com/bigquery/docs/reference/rest/v2/tabledata/list#response-body).
	 */
	@experimental
	public async list({
		startIndex,
		maxResults,
		pageToken,
		selectedFields,
		formatOptions,
	}: {
		startIndex?: number;
		maxResults?: number;
		pageToken?: string;
		selectedFields?: string;
		formatOptions?: { useInt64Timestamp: boolean };
	} = {}) {
		const url = new URL(`${this.endpoint}/data`);
		if (startIndex) url.searchParams.append('startIndex', startIndex.toString());
		if (maxResults) url.searchParams.append('maxResults', maxResults.toString());
		if (pageToken) url.searchParams.append('pageToken', pageToken);
		if (selectedFields) url.searchParams.append('selectedFields', selectedFields);
		if (formatOptions?.useInt64Timestamp)
			url.searchParams.append('formatOptions.useInt64Timestamp', formatOptions.useInt64Timestamp.toString());
		return this.request(url, 'GET');
	}
}
