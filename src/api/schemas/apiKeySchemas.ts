export interface ApiKeyCreateSchema {
  model_id: string | number;
  name: string;
}

// One address a key was used from. The API adds a record on every call made with the key.
export interface ApiKeyIpAddressSchema {
  id: string;
  ip_address: string;
  created_at: string;
}

export interface ApiKeySchema {
  // The real key only in the answer to "create". Afterwards the API returns the stored hash here.
  key: string;
  name: string;
  id: string;
  usage_count: number;
  created_at: string;
  last_used_at: string | null;
  ip_addresses?: ApiKeyIpAddressSchema[];
}

export type ListApiKeysResponse = { apiKeys: ApiKeySchema[] } | ApiKeySchema[];
