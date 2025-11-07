export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequest {
  method: HttpMethod;
  url: string;
  headers: Readonly<Record<string, string>>;
  query: Readonly<Record<string, string | number | boolean>>;
  body?: unknown;
  timeoutMs: number; // 0이면 무한대(타임아웃 없음)로 간주
}

export interface Builder<T> {
  reset(): this;
  build(): T;
}
export class HttpRequestBuilder implements Builder<HttpRequest> {
  private _method: HttpMethod = "GET";
  private _url = "";
  private _headers: Record<string, string> = {};
  private _query: Record<string, string | number | boolean> = {};
  private _body?: unknown;
  private _timeoutMs = 0;

  reset(): this {
    this._method = "GET";
    this._url = "";
    this._headers = {};
    this._query = {};
    this._body = undefined;
    this._timeoutMs = 0;
    return this;
  }

  setMethod(method: HttpMethod): this {
    this._method = method;
    return this;
  }

  setUrl(url: string): this {
    this._url = url;
    return this;
  }

  addHeader(key: string, value: string): this {
    this._headers[key.toLowerCase()] = value;
    return this;
  }

  addHeaders(headers: Record<string, string>): this {
    for (const [k, v] of Object.entries(headers)) {
      this.addHeader(k, v);
    }
    return this;
  }

  addQueryParam(key: string, value: string | number | boolean): this {
    this._query[key] = value;
    return this;
  }

  addQuery(params: Record<string, string | number | boolean>): this {
    Object.assign(this._query, params);
    return this;
  }

  setBody(body: unknown): this {
    this._body = body;
    return this;
  }

  setTimeout(ms: number): this {
    if (ms < 0) throw new Error("timeout must be >= 0");
    this._timeoutMs = ms;
    return this;
  }

  build(): HttpRequest {
    if (!this._url) {
      throw new Error("HttpRequestBuilder: url is required");
    }

    const product: HttpRequest = {
      method: this._method,
      url: this._url,
      headers: Object.freeze({ ...this._headers }),
      query: Object.freeze({ ...this._query }),
      body: this._body,
      timeoutMs: this._timeoutMs,
    };

    // 불변 객체로 반환 (외부에서 수정 방지)
    return Object.freeze(product);
  }
}

export class ApiDirector {
  constructor(private readonly builder: HttpRequestBuilder) {}

  /**
   * JSON POST 요청 기본 레시피
   */
  makeJsonPost(url: string, payload: unknown, timeoutMs = 10_000): HttpRequest {
    return this.builder
      .reset()
      .setMethod("POST")
      .setUrl(url)
      .addHeader("Content-Type", "application/json")
      .setBody(payload)
      .setTimeout(timeoutMs)
      .build();
  }

  /**
   * 인증이 필요한 GET 요청 레시피
   */
  makeAuthorizedGet(
    url: string,
    token: string,
    query: Record<string, string | number | boolean> = {},
    timeoutMs = 5_000
  ): HttpRequest {
    return this.builder
      .reset()
      .setMethod("GET")
      .setUrl(url)
      .addHeader("Authorization", `Bearer ${token}`)
      .addQuery(query)
      .setTimeout(timeoutMs)
      .build();
  }
}

export function exampleBuilds() {
  const builder = new HttpRequestBuilder();

  const post = new ApiDirector(builder).makeJsonPost(
    "/api/users",
    { name: "saim", role: "student" },
    8000
  );

  const get = builder
    .reset()
    .setMethod("GET")
    .setUrl("/api/users")
    .addQueryParam("page", 1)
    .addQueryParam("pageSize", 20)
    .addHeader("Accept", "application/json")
    .build();

  return { post, get };
}
