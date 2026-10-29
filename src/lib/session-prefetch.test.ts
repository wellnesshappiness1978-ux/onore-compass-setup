// @vitest-environment happy-dom
import { afterEach, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { restoreSessionReadings } from './session-prefetch';
import { clearReadingCaches, readingCacheEpoch } from './reading-cache';
afterEach(() => { clearReadingCaches(); localStorage.clear(); });
it('restores completed results with infinite session retention and no fetch/generation', () => {
  const client = new QueryClient();
  const key = 'onore-reading:v1:["owner","full","2026-10-29",{}]';
  restoreSessionReadings(client,[{local_key:key,result:{axisSummary:'complete'}}],readingCacheEpoch());
  expect(client.getQueryData([key])).toEqual({axisSummary:'complete'});
  expect(client.getQueryDefaults([key]).staleTime).toBe(Infinity);
  expect(client.getQueryDefaults([key]).gcTime).toBe(Infinity);
  expect(client.isFetching()).toBe(0);
  client.clear();
});
it('does not restore private results after sign-out or write unrelated storage keys', () => {
  const client = new QueryClient();
  const epoch=readingCacheEpoch(); clearReadingCaches();
  const key='onore-reading:v1:private';
  restoreSessionReadings(client,[{local_key:key,result:{text:'private'}}],epoch);
  restoreSessionReadings(client,[{local_key:'onore-profile',result:{text:'overwrite'}}],readingCacheEpoch());
  expect(client.getQueryData([key])).toBeUndefined();
  expect(localStorage.getItem('onore-profile')).toBeNull();
  client.clear();
});