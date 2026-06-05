import { apiUrl, API } from './constants';
import { CustomResponse, PageEntity } from './CustomResponse';
import { getCurrentLang } from '../../i18n/I18nProvider';
import { secureStorage } from '../storage';

// In-memory token mirror (LocalStaticVar.token).
let inMemoryToken = '';
export const setAuthToken = (token: string) => {
  inMemoryToken = token ?? '';
};
export const getAuthToken = () => inMemoryToken;
export const hydrateAuthToken = async () => {
  inMemoryToken = await secureStorage.getToken();
  return inMemoryToken;
};

export interface BaseEnvelope {
  status?: boolean;
  messages?: string;
  code?: number;
  data?: any;
}

type FromJson<T> = (json: any) => T;
type Query = Record<string, any> | undefined;

interface BaseOpts {
  subUrl: string;
  url?: string;
  token?: string;
  needToken?: boolean;
  query?: Query;
}

function buildHeaders(needToken: boolean, token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Language': getCurrentLang(),
    'User-Agent': API.userAgent,
  };
  if (needToken) {
    const authToken = token ?? inMemoryToken;
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

function withQuery(base: string, query: Query): string {
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    params.append(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

async function parseEnvelope(res: Response): Promise<BaseEnvelope> {
  const text = await res.text();
  if (!text) return { status: res.ok, messages: '', data: null };
  try {
    return JSON.parse(text) as BaseEnvelope;
  } catch {
    return { status: res.ok, messages: text, data: null };
  }
}

function networkError(): CustomResponse {
  return new CustomResponse(-1, [], 'server_error', false);
}

export const apiClient = {
  /** Plain GET — returns raw envelope data (mirrors DioSetting.get). */
  async get(opts: BaseOpts): Promise<CustomResponse> {
    const { subUrl, url, token, needToken = false, query } = opts;
    try {
      const target = withQuery(url ? `${url}/${subUrl}` : apiUrl(subUrl), query);
      const res = await fetch(target, { method: 'GET', headers: buildHeaders(needToken, token) });
      const text = await res.text();
      let data: any = text;
      try { data = JSON.parse(text); } catch { /* keep text */ }
      return new CustomResponse(res.status, data, '', true);
    } catch {
      return networkError();
    }
  },

  /** GET that parses the envelope into a model (mirrors DioSetting.getV2). */
  async getV2<T>(
    opts: BaseOpts & { fromJson?: FromJson<T>; isListOfModel?: boolean },
  ): Promise<CustomResponse<T | T[] | null>> {
    const { subUrl, url, token, needToken = false, query, fromJson, isListOfModel } = opts;
    try {
      const target = withQuery(url ? `${url}/${subUrl}` : apiUrl(subUrl), query);
      const res = await fetch(target, { method: 'GET', headers: buildHeaders(needToken, token) });
      const env = await parseEnvelope(res);
      if (env.status == null || !env.status) {
        return new CustomResponse(res.status, '' as any, env.messages, false);
      }
      if (isListOfModel) {
        const list = ((env.data as any[]) ?? []).map((e) => (fromJson ? fromJson(e) : e));
        return new CustomResponse(res.status, list as T[], env.messages, true);
      }
      if (env.data == null) {
        return new CustomResponse(res.status, null, env.messages, true);
      }
      const result = fromJson ? fromJson(env.data) : (env.data as T);
      return new CustomResponse(res.status, result, env.messages, true);
    } catch {
      return networkError();
    }
  },

  /** GET paginated list (mirrors DioSetting.getPagination). */
  async getPagination<T>(
    opts: BaseOpts & { fromJson: FromJson<T> },
  ): Promise<CustomResponse<PageEntity<T> | string>> {
    const { subUrl, url, token, needToken = false, query, fromJson } = opts;
    try {
      const target = withQuery(url ? `${url}/${subUrl}` : apiUrl(subUrl), query);
      const res = await fetch(target, { method: 'GET', headers: buildHeaders(needToken, token) });
      const env = await parseEnvelope(res);
      if (env.status == null || !env.status) {
        return new CustomResponse(res.status, '', env.messages, false);
      }
      const page = env.data ?? {};
      const list = ((page.data as any[]) ?? []).map((e) => fromJson(e));
      const result: PageEntity<T> = {
        data: list,
        totalPage: page.last_page ?? 1,
        unreadCount: page.count_unread,
        total: page.total,
      };
      return new CustomResponse(res.status, result, env.messages, true);
    } catch {
      return networkError();
    }
  },

  /** Plain POST (mirrors DioSetting.post). */
  async post(opts: BaseOpts & { data?: any }): Promise<CustomResponse> {
    return this._send('POST', opts);
  },

  /** POST that optionally parses a model (mirrors DioSetting.postV2). */
  async postV2<T>(
    opts: BaseOpts & { data?: any; fromJson?: FromJson<T>; isListOfModel?: boolean },
  ): Promise<CustomResponse> {
    const { subUrl, url, token, needToken = false, query, data, fromJson, isListOfModel } = opts;
    try {
      const target = withQuery(url ? `${url}/${subUrl}` : apiUrl(subUrl), query);
      const res = await fetch(target, {
        method: 'POST',
        headers: buildHeaders(needToken, token),
        body: data != null ? JSON.stringify(data) : undefined,
      });
      const env = await parseEnvelope(res);
      if (!fromJson) {
        return new CustomResponse(res.status, env, env.messages, env.status ?? res.ok);
      }
      if (isListOfModel) {
        const list = ((env.data as any[]) ?? []).map((e) => fromJson(e));
        return new CustomResponse(res.status, list, env.messages, true);
      }
      const result = fromJson(env.data);
      return new CustomResponse(res.status, result, env.messages, true);
    } catch {
      return networkError();
    }
  },

  async delete(opts: BaseOpts & { data?: any }): Promise<CustomResponse> {
    return this._send('DELETE', opts);
  },

  async put(opts: BaseOpts & { data?: any }): Promise<CustomResponse> {
    return this._send('PUT', opts);
  },

  async patch(opts: BaseOpts & { data?: any }): Promise<CustomResponse> {
    return this._send('PATCH', opts);
  },

  async _send(
    method: string,
    opts: BaseOpts & { data?: any },
  ): Promise<CustomResponse> {
    const { subUrl, url, token, needToken = false, query, data } = opts;
    try {
      const target = withQuery(url ? `${url}/${subUrl}` : apiUrl(subUrl), query);
      const res = await fetch(target, {
        method,
        headers: buildHeaders(needToken, token),
        body: data != null ? JSON.stringify(data) : undefined,
      });
      const env = await parseEnvelope(res);
      return new CustomResponse(res.status, env, env.messages, env.status ?? res.ok);
    } catch {
      return networkError();
    }
  },
};
