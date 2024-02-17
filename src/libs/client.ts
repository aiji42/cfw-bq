import GoogleAuth, { GoogleKey } from 'cloudflare-workers-and-google-oauth';

// TODO: enable to specify scopes
const scopes: string[] = ['https://www.googleapis.com/auth/bigquery'];

type ErrorResponseBody = {
	error: {
		code: number;
		message: string;
		status: string;
	};
};

export class Client {
	private readonly accessTokenPromise: string | Promise<string | undefined>;
	googleKey: GoogleKey;
	projectId: string;

	constructor(googleKey: GoogleKey, projectId: string) {
		this.accessTokenPromise = new GoogleAuth(googleKey, scopes).getGoogleAuthToken();
		this.googleKey = googleKey;
		this.projectId = projectId;
	}

	// TODO: use KV to store the token
	private async accessToken(): Promise<string> {
		const token = await this.accessTokenPromise;
		if (!token) throw new Error('Failed to get token');
		return token;
	}

	protected async request(url: string | URL, method: 'GET' | 'POST' | 'DELETE' | 'PATCH', data?: Record<string, unknown>): Promise<any> {
		const headers = new Headers({
			Authorization: `Bearer ${await this.accessToken()}`,
			'Content-Type': 'application/json',
		});

		const body = ['POST', 'PATCH'].includes(method) && data ? JSON.stringify(data) : undefined;

		const res = await fetch(url, { method, headers, body });

		if (!res.ok) {
			const errorBody: ErrorResponseBody = await res.json();
			throw new Error(errorBody.error.message);
		}

		return res.json();
	}
}
