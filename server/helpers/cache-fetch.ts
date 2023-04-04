import { fetchBuilder, MemoryCache } from "node-fetch-cache";
import {
  RequestInfo,
  RequestInit,
} from "node-fetch-cache/node_modules/@types/node-fetch/index";

let cacheFetch = fetchBuilder.withCache(
  new MemoryCache({
    // 15 minutes
    ttl: 15 * 60 * 1000,
  })
);

export const fetch = async (url: RequestInfo, init?: RequestInit) => {
  const response = await cacheFetch(url, init);
  if (!response.ok) {
    await response.ejectFromCache();
  }
  return response;
};

export const clearFetchCache = async () => {
  cacheFetch = fetchBuilder.withCache(
    new MemoryCache({
      // 15 minutes
      ttl: 15 * 60 * 1000,
    })
  );
};
