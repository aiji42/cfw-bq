import { Client } from './client';
import { GoogleKey } from 'cloudflare-workers-and-google-oauth';
import { experimental } from './decorators';
import { Table } from './table';

function assertDatasetId(datasetId: string | undefined): asserts datasetId is string {
	if (!datasetId) throw new Error('datasetId is required');
}

export class Dataset extends Client {
	readonly datasetId?: string;
	readonly endpoint: string;

	constructor(googleKey: GoogleKey, projectId: string, datasetId?: string) {
		super(googleKey, projectId);
		this.datasetId = datasetId;
		this.endpoint = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/datasets`;
	}

	/**
	 * Deletes the dataset specified by the datasetId value. Before you can delete a dataset, you must delete all its tables, either manually or by specifying deleteContents. Immediately after deletion, you can create another dataset with the same name.
	 *
	 * @param deleteContents - If true, delete all the tables in the dataset. If false and the dataset contains tables, the request will fail. Default is false.
	 * @returns If successful, the response body will be empty.
	 */
	@experimental
	public async delete({ deleteContents }: { deleteContents?: boolean }) {
		assertDatasetId(this.datasetId);
		const url = new URL(`${this.endpoint}/${this.datasetId}`);
		if (deleteContents) url.searchParams.append('deleteContents', deleteContents.toString());

		return this.request(url, 'DELETE');
	}

	/**
	 * Returns the dataset specified by datasetID.
	 *
	 * @returns If successful, the response body contains an instance of [Dataset](https://cloud.google.com/bigquery/docs/reference/rest/v2/datasets#Dataset).
	 */
	@experimental
	public async get() {
		assertDatasetId(this.datasetId);
		return this.request(`${this.endpoint}/${this.datasetId}`, 'GET');
	}

	/**
	 * Lists all datasets in the specified project to which the user has been granted the READER dataset role.
	 *
	 * @param maxResults - The maximum number of results to return in a single response page. Leverage the pageToken to iterate through the entire dataset list.
	 * @param pageToken - Page token, returned by a previous call, to request the next page of results.
	 * @param all - Whether to list all datasets, including hidden ones.
	 * @param filer - An expression for filtering the results of the request by label. The syntax is "labels.<name>[:<value>]". Multiple filters can be ANDed together by connecting with a space. Example: "labels.department:receiving labels.active".
	 * @return If successful, the response body contains [data](https://cloud.google.com/bigquery/docs/reference/rest/v2/datasets/list#response-body).
	 */
	@experimental
	public async list({
		maxResults,
		pageToken,
		all,
		filer,
	}: { maxResults?: number; pageToken?: string; all?: boolean; filer?: string } = {}) {
		const url = new URL(this.endpoint);
		if (maxResults) url.searchParams.append('maxResults', maxResults.toString());
		if (pageToken) url.searchParams.append('pageToken', pageToken);
		if (all) url.searchParams.append('all', all.toString());
		if (filer) url.searchParams.append('filer', filer);
		return this.request(url, 'GET');
	}

	public table(tableId?: string) {
		assertDatasetId(this.datasetId);
		return new Table(this.googleKey, this.projectId, this.datasetId, tableId);
	}
}
