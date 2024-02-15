export interface QueryResponse {
	kind: string;
	schema: Schema;
	jobReference: JobReference;
	totalRows: string;
	rows: Row[];
	totalBytesProcessed: string;
	jobComplete: boolean;
	cacheHit: boolean;
	queryId: string;
	jobCreationReason: JobCreationReason;
}

interface Schema {
	fields: Field[];
}

interface Field {
	name: string;
	type: string;
	mode: string;
}

interface JobReference {
	projectId: string;
	jobId: string;
	location: string;
}

interface Row {
	f: FieldValue[];
}

interface FieldValue {
	v: string | null;
}

interface JobCreationReason {
	code: string;
}
