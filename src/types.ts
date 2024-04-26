export interface QueryResponse {
	kind: string;
	schema: Schema;
	jobReference: JobReference;
	totalRows: string;
	rows?: Row[];
	totalBytesProcessed: string;
	jobComplete: boolean;
	cacheHit: boolean;
	queryId: string;
	jobCreationReason: JobCreationReason;
}

export interface Schema {
	fields: Field[];
}

export type FieldMode = 'NULLABLE' | 'REQUIRED' | 'REPEATED';

export type Field =
	| {
			name: string;
			type:
				| 'STRING'
				| 'BYTES'
				| 'INTEGER'
				| 'INT64'
				| 'FLOAT'
				| 'FLOAT64'
				| 'BOOLEAN'
				| 'BOOL'
				| 'TIMESTAMP'
				| 'DATE'
				| 'TIME'
				| 'DATETIME'
				| 'GEOGRAPHY'
				| 'NUMERIC'
				| 'BIGNUMERIC'
				| 'JSON';
			mode: FieldMode;
	  }
	| {
			name: string;
			type: 'RANGE';
			mode: FieldMode;
			rangeElementType: { type: 'DATETIME' | 'DATE' | 'TIMESTAMP' };
	  }
	| {
			name: string;
			type: 'RECORD' | 'STRUCT';
			mode: FieldMode;
			fields: Field[];
	  };

export interface JobReference {
	projectId: string;
	jobId: string;
	location: string;
}

export interface Row {
	f: FieldValue[];
}

export interface FieldValue {
	v: string | null;
}

export interface JobCreationReason {
	code: string;
}
