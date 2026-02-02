const BASE_URL = "https://localise.biz/api";

export interface Asset {
  id: string;
  type: string;
  context?: string;
  notes?: string;
  printf?: string;
  created: string;
  modified: string;
  plurals: number;
  tags: string[];
  aliases: Record<string, string>;
  progress: {
    translated: number;
    untranslated: number;
    flagged: number;
  };
}

export interface Translation {
  id: string;
  translation: string;
  translated: boolean;
  status: string;
  revision: number;
  flagged: boolean;
  modified: string;
  author?: {
    id: number;
    name: string;
    email: string;
  };
  locale: {
    code: string;
    name: string;
  };
  plurals?: string[];
}

export interface SuccessResponse {
  status: number;
  message: string;
}

export class LocoClient {
  constructor(
    private apiKey: string,
    private baseUrl: string = BASE_URL
  ) {}

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    contentType: string = "application/json"
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: `Loco ${this.apiKey}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined) {
      if (contentType === "text/plain") {
        headers["Content-Type"] = "text/plain";
        options.body = body as string;
      } else if (contentType === "application/x-www-form-urlencoded") {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        }
        options.body = params.toString();
      } else {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(url, options);
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Loco API error (${response.status}): ${text}`);
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  }

  // Asset methods
  async listAssets(filter?: string): Promise<Asset[]> {
    const endpoint = filter ? `/assets?filter=${encodeURIComponent(filter)}` : "/assets";
    return this.request<Asset[]>("GET", endpoint);
  }

  async getAsset(assetId: string): Promise<Asset> {
    return this.request<Asset>("GET", `/assets/${encodeURIComponent(assetId)}.json`);
  }

  async createAsset(params: {
    id?: string;
    text?: string;
    type?: "text" | "html" | "xml";
    context?: string;
    notes?: string;
  }): Promise<Asset> {
    return this.request<Asset>("POST", "/assets", params, "application/x-www-form-urlencoded");
  }

  async updateAsset(
    assetId: string,
    params: {
      id?: string;
      type?: "text" | "html" | "xml";
      context?: string;
      notes?: string;
    }
  ): Promise<Asset> {
    return this.request<Asset>(
      "PATCH",
      `/assets/${encodeURIComponent(assetId)}.json`,
      params
    );
  }

  async deleteAsset(assetId: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(
      "DELETE",
      `/assets/${encodeURIComponent(assetId)}.json`
    );
  }

  // Translation methods
  async getTranslations(assetId: string): Promise<Translation[]> {
    return this.request<Translation[]>(
      "GET",
      `/translations/${encodeURIComponent(assetId)}.json`
    );
  }

  async getTranslation(assetId: string, locale: string): Promise<Translation> {
    return this.request<Translation>(
      "GET",
      `/translations/${encodeURIComponent(assetId)}/${encodeURIComponent(locale)}`
    );
  }

  async updateTranslation(
    assetId: string,
    locale: string,
    text: string
  ): Promise<Translation> {
    return this.request<Translation>(
      "POST",
      `/translations/${encodeURIComponent(assetId)}/${encodeURIComponent(locale)}`,
      text,
      "text/plain"
    );
  }

  // Tag methods
  async listTags(): Promise<string[]> {
    return this.request<string[]>("GET", "/tags");
  }

  async tagAsset(assetId: string, tag: string): Promise<Asset> {
    return this.request<Asset>(
      "POST",
      `/assets/${encodeURIComponent(assetId)}/tags`,
      { name: tag },
      "application/x-www-form-urlencoded"
    );
  }

  async untagAsset(assetId: string, tag: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(
      "DELETE",
      `/assets/${encodeURIComponent(assetId)}/tags/${encodeURIComponent(tag)}.json`
    );
  }
}
