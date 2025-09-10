export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<RequestInit, 'body' | 'signal'> {
  secure?: boolean;
  path: string;
  query?: QueryParamsType;
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  'body' | 'method' | 'query' | 'path'
>;

export interface ApiConfig extends Omit<RequestInit, 'body'> {
  baseURL?: string;
}

export class HttpClient {
  private readonly baseURL: string = '';
  private readonly defaultRequestInit?: RequestInit;

  constructor({ baseURL = '', ...fetchConfig }: ApiConfig = {}) {
    this.baseURL = baseURL;
    this.defaultRequestInit = fetchConfig;
  }

  protected mergeRequestParams(
    params1: RequestInit,
    params2?: RequestInit,
  ): RequestInit {
    return {
      ...this.defaultRequestInit,
      ...params1,
      ...params2,
      headers: {
        ...((this.defaultRequestInit?.headers as Record<string, string>) || {}),
        ...((params1.headers as Record<string, string>) || {}),
        ...((params2?.headers as Record<string, string>) || {}),
      },
    };
  }

  public request = async <T = any>({
    path,
    query,
    body,
    ...params
  }: FullRequestParams): Promise<T> => {
    const requestParams = this.mergeRequestParams(params);
    const url = new URL(`${this.baseURL}${path}`);

    if (query) {
      Object.keys(query).forEach((key) => {
        url.searchParams.append(key, query[key]);
      });
    }

    const finalRequestInit: RequestInit = {
      ...requestParams,
      body: body ? JSON.stringify(body) : undefined,
      method: requestParams.method || 'GET',
      headers: {
        ...requestParams.headers,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    try {
      const response = await fetch(url.toString(), finalRequestInit);

      const hasContent = response.headers.get('Content-Length') !== '0';

      if (!response.ok) {
        throw response;
      }

      if (hasContent) {
        return (await response.json()) as T;
      } else {
        return null as T;
      }
    } catch (error) {
      throw error;
    }
  };
}
