import GoogleAuth, { GoogleKey } from 'cloudflare-workers-and-google-oauth';

const scopes: string[] = ['https://www.googleapis.com/auth/bigquery'];

type ErrorResponseBody = {
  error: {
    code: number;
    message: string;
    status: string;
  };
};

export class Client {
  private readonly tokenPromise: Promise<string | undefined>;
  readonly projectId: string;

  /**
   * @param {GoogleKey} gCredentials - JSON parsed Google application credentials.
   * @param {string} projectId - The project ID of the Google Cloud project.
   */
  constructor(gCredentials: GoogleKey, projectId: string) {
    this.tokenPromise = new GoogleAuth(gCredentials, scopes).getGoogleAuthToken();
    this.projectId = projectId;
  }

  private async token(): Promise<string> {
    const token = await this.tokenPromise;
    if (!token) throw new Error('Failed to get token');
    return token;
  }

  protected async request<T>(url: string | URL, method: 'GET' | 'POST' | 'DELETE' | 'PATCH', data?: Record<string, unknown>): Promise<T> {
    const headers = new Headers({
      Authorization: `Bearer ${await this.token()}`,
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
