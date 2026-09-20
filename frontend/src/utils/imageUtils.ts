import React, { useState, useEffect } from 'react';

/**
 * Neutral travel placeholder used when an activity has no trustworthy image yet
 */
export const NEUTRAL_ACTIVITY_PLACEHOLDER =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/+$/, '')}/api`;

// In-memory cache for dynamic activity image URLs and candidates
const _DYNAMIC_IMAGE_CACHE = new Map<string, string>();
const _DYNAMIC_CANDIDATES_CACHE = new Map<string, string[]>();
const _IN_FLIGHT_PROMISES = new Map<string, Promise<string[]>>();

/**
 * Tests an array of image candidate URLs sequentially in the browser.
 * Returns the first candidate that loads successfully, or null if all fail.
 */
export function findFirstWorkingCandidate(candidates: string[]): Promise<string | null> {
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    return Promise.resolve(candidates[0] || null);
  }

  return new Promise((resolve) => {
    let idx = 0;

    function tryNext() {
      if (idx >= candidates.length) {
        resolve(null);
        return;
      }

      const testUrl = candidates[idx];
      if (!testUrl || typeof testUrl !== 'string' || !testUrl.startsWith('http')) {
        idx++;
        tryNext();
        return;
      }

      let settled = false;
      const img = new Image();

      // Guard against hanging external connections with a 3.5s timeout per candidate
      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          idx++;
          tryNext();
        }
      }, 3500);

      img.onload = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          resolve(testUrl);
        }
      };

      img.onerror = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          idx++;
          tryNext();
        }
      };

      img.src = testUrl;
    }

    tryNext();
  });
}

/**
 * Builds dynamic search query from activity name and location/destination
 */
export function buildImageQuery(name?: string, location?: string, destination?: string): string {
  const parts: string[] = [];
  if (name && name.trim()) {
    parts.push(name.trim());
  }
  const loc = (location || destination || '').trim();
  if (loc) {
    const lowerName = (name || '').toLowerCase();
    const lowerLoc = loc.toLowerCase();
    if (!lowerName.includes(lowerLoc)) {
      parts.push(loc);
    }
  }
  return parts.join(' ').trim();
}

/**
 * Fetches multiple image candidate URLs for an activity using ACTIVITY NAME + LOCATION
 */
export async function fetchDynamicActivityImageCandidates(
  name?: string,
  location?: string,
  destination?: string
): Promise<string[]> {
  const query = buildImageQuery(name, location, destination);
  if (!query) {
    return [];
  }

  const cacheKey = query.toLowerCase();
  if (_DYNAMIC_CANDIDATES_CACHE.has(cacheKey)) {
    return _DYNAMIC_CANDIDATES_CACHE.get(cacheKey)!;
  }

  if (_IN_FLIGHT_PROMISES.has(cacheKey)) {
    return await _IN_FLIGHT_PROMISES.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/images/search?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        let candidates: string[] = [];

        if (Array.isArray(data.image_urls) && data.image_urls.length > 0) {
          candidates = data.image_urls.filter(
            (u: any) => typeof u === 'string' && u.startsWith('http')
          );
        } else if (data.image_url && typeof data.image_url === 'string' && data.image_url.startsWith('http')) {
          candidates = [data.image_url];
        }

        if (candidates.length > 0) {
          _DYNAMIC_CANDIDATES_CACHE.set(cacheKey, candidates);
          if (!_DYNAMIC_IMAGE_CACHE.has(cacheKey)) {
            _DYNAMIC_IMAGE_CACHE.set(cacheKey, candidates[0]);
          }
          return candidates;
        }
      }
    } catch {
      // Backend unavailable fallback
    } finally {
      _IN_FLIGHT_PROMISES.delete(cacheKey);
    }
    return [];
  })();

  _IN_FLIGHT_PROMISES.set(cacheKey, fetchPromise);
  return await fetchPromise;
}

/**
 * Dynamically fetches relevant image for an activity using ACTIVITY NAME + LOCATION
 */
export async function fetchDynamicActivityImage(
  name?: string,
  location?: string,
  destination?: string
): Promise<string> {
  const candidates = await fetchDynamicActivityImageCandidates(name, location, destination);
  if (candidates.length > 0) {
    const working = await findFirstWorkingCandidate(candidates);
    if (working) {
      const query = buildImageQuery(name, location, destination);
      if (query) {
        _DYNAMIC_IMAGE_CACHE.set(query.toLowerCase(), working);
      }
      return working;
    }
  }
  return NEUTRAL_ACTIVITY_PLACEHOLDER;
}

/**
 * Synchronous resolver for immediate rendering with zero layout shift.
 * Uses dynamic cached result when available, or existingUrl if already valid.
 * If no dynamic result exists yet, returns neutral placeholder while triggering
 * dynamic fetch in the background (never displaying an unrelated existing image).
 */
export function resolveActivityImage(
  name?: string,
  location?: string,
  category?: string,
  existingUrl?: string,
  destination?: string
): string {
  if (
    existingUrl &&
    typeof existingUrl === 'string' &&
    existingUrl.trim() &&
    existingUrl !== NEUTRAL_ACTIVITY_PLACEHOLDER &&
    existingUrl.startsWith('http')
  ) {
    return existingUrl;
  }

  const query = buildImageQuery(name, location, destination);
  if (!query) {
    return NEUTRAL_ACTIVITY_PLACEHOLDER;
  }

  const cacheKey = query.toLowerCase();

  // 1. Use dynamic cached result when available
  if (_DYNAMIC_IMAGE_CACHE.has(cacheKey)) {
    return _DYNAMIC_IMAGE_CACHE.get(cacheKey)!;
  }

  // 2. Trigger background dynamic candidate fetch
  fetchDynamicActivityImageCandidates(name, location, destination).catch(() => {});

  // 3. If no dynamic result exists yet, use neutral placeholder
  return NEUTRAL_ACTIVITY_PLACEHOLDER;
}

/**
 * React hook that initiates dynamic image fetch with multi-candidate sequential resolution
 */
export function useDynamicActivityImage(
  name?: string,
  location?: string,
  initialUrl?: string,
  destination?: string
): string {
  const [imageUrl, setImageUrl] = useState<string>(() =>
    resolveActivityImage(name, location, undefined, initialUrl, destination)
  );

  useEffect(() => {
    let isMounted = true;
    const validInitial =
      initialUrl &&
      typeof initialUrl === 'string' &&
      initialUrl !== NEUTRAL_ACTIVITY_PLACEHOLDER &&
      initialUrl.startsWith('http')
        ? initialUrl
        : undefined;

    fetchDynamicActivityImageCandidates(name, location, destination).then(async (candidates) => {
      if (!isMounted) return;

      const combined: string[] = [];
      if (validInitial) {
        combined.push(validInitial);
      }
      for (const c of candidates) {
        if (!combined.includes(c)) {
          combined.push(c);
        }
      }

      if (combined.length === 0) {
        if (isMounted && !validInitial) {
          setImageUrl(NEUTRAL_ACTIVITY_PLACEHOLDER);
        }
        return;
      }

      const working = await findFirstWorkingCandidate(combined);
      if (isMounted) {
        if (working) {
          const query = buildImageQuery(name, location, destination);
          if (query) {
            _DYNAMIC_IMAGE_CACHE.set(query.toLowerCase(), working);
          }
          setImageUrl(working);
        } else {
          setImageUrl(NEUTRAL_ACTIVITY_PLACEHOLDER);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [name, location, initialUrl, destination]);

  return imageUrl;
}

/**
 * High-performance image component with multi-candidate search and robust sequential fallbacks
 */
export const ActivityImage: React.FC<{
  name?: string;
  location?: string;
  destination?: string;
  initialUrl?: string;
  className?: string;
  alt?: string;
}> = ({ name, location, destination, initialUrl, className, alt }) => {
  const dynamicSrc = useDynamicActivityImage(name, location, initialUrl, destination);
  const [currentSrc, setCurrentSrc] = useState<string>(dynamicSrc);
  const [candidateList, setCandidateList] = useState<string[]>([]);
  const [candidateIdx, setCandidateIdx] = useState<number>(0);

  // Sync currentSrc when dynamicSrc resolves
  useEffect(() => {
    if (dynamicSrc) {
      setCurrentSrc(dynamicSrc);
    }
  }, [dynamicSrc]);

  // Load candidate list for fallback retry on DOM error
  useEffect(() => {
    let isMounted = true;
    const validInitial =
      initialUrl &&
      typeof initialUrl === 'string' &&
      initialUrl !== NEUTRAL_ACTIVITY_PLACEHOLDER &&
      initialUrl.startsWith('http')
        ? initialUrl
        : undefined;

    fetchDynamicActivityImageCandidates(name, location, destination).then((cands) => {
      if (!isMounted) return;
      const combined = validInitial
        ? [validInitial, ...cands.filter((u) => u !== validInitial)]
        : cands;
      setCandidateList(combined);
      setCandidateIdx(0);
    });

    return () => {
      isMounted = false;
    };
  }, [name, location, initialUrl, destination]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const nextIdx = candidateIdx + 1;
    if (nextIdx < candidateList.length) {
      setCandidateIdx(nextIdx);
      setCurrentSrc(candidateList[nextIdx]);
    } else {
      setCurrentSrc(NEUTRAL_ACTIVITY_PLACEHOLDER);
      (e.currentTarget as HTMLImageElement).src = NEUTRAL_ACTIVITY_PLACEHOLDER;
    }
  };

  return React.createElement('img', {
    src: currentSrc || NEUTRAL_ACTIVITY_PLACEHOLDER,
    alt: alt || name || 'Activity',
    className,
    onError: handleError,
  });
};
