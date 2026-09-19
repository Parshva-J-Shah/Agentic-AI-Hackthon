import React, { useState, useEffect } from 'react';

/**
 * Neutral travel placeholder used when an activity has no trustworthy image yet
 */
export const NEUTRAL_ACTIVITY_PLACEHOLDER =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/+$/, '')}/api`;

// In-memory cache for dynamic activity image URLs
const _DYNAMIC_IMAGE_CACHE = new Map<string, string>();
const _IN_FLIGHT_PROMISES = new Map<string, Promise<string>>();


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
 * Dynamically fetches relevant image for an activity using ACTIVITY NAME + LOCATION
 */
export async function fetchDynamicActivityImage(
  name?: string,
  location?: string,
  destination?: string
): Promise<string> {
  const query = buildImageQuery(name, location, destination);
  if (!query) {
    return NEUTRAL_ACTIVITY_PLACEHOLDER;
  }

  const cacheKey = query.toLowerCase();
  if (_DYNAMIC_IMAGE_CACHE.has(cacheKey)) {
    return _DYNAMIC_IMAGE_CACHE.get(cacheKey)!;
  }

  if (_IN_FLIGHT_PROMISES.has(cacheKey)) {
    return await _IN_FLIGHT_PROMISES.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/images/search?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.image_url && typeof data.image_url === 'string') {
          _DYNAMIC_IMAGE_CACHE.set(cacheKey, data.image_url);
          return data.image_url;
        }
      }
    } catch {
      // Backend unavailable fallback
    } finally {
      _IN_FLIGHT_PROMISES.delete(cacheKey);
    }
    return NEUTRAL_ACTIVITY_PLACEHOLDER;
  })();

  _IN_FLIGHT_PROMISES.set(cacheKey, fetchPromise);
  return await fetchPromise;
}

/**
 * Synchronous resolver for immediate rendering with zero layout shift.
 * Uses dynamic cached result when available.
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
  const query = buildImageQuery(name, location, destination);
  const cacheKey = query.toLowerCase();

  // 1. Use dynamic cached result when available
  if (_DYNAMIC_IMAGE_CACHE.has(cacheKey)) {
    return _DYNAMIC_IMAGE_CACHE.get(cacheKey)!;
  }

  // 2. Trigger background dynamic fetch
  if (query) {
    fetchDynamicActivityImage(name, location, destination).catch(() => {});
  }

  // 3. If no dynamic result exists yet, use neutral placeholder rather than displaying an unrelated existing image
  return NEUTRAL_ACTIVITY_PLACEHOLDER;
}

/**
 * React hook that initiates dynamic image fetch and updates src seamlessly
 */
export function useDynamicActivityImage(
  name?: string,
  location?: string,
  initialUrl?: string,
  destination?: string
): string {
  const [imageUrl, setImageUrl] = useState<string>(() =>
    resolveActivityImage(name, location, undefined, undefined, destination)
  );

  useEffect(() => {
    let isMounted = true;
    fetchDynamicActivityImage(name, location, destination).then((dynUrl) => {
      if (isMounted && dynUrl && dynUrl !== NEUTRAL_ACTIVITY_PLACEHOLDER) {
        setImageUrl(dynUrl);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [name, location, destination]);

  return imageUrl;
}

/**
 * High-performance image component with dynamic search and robust fallbacks
 */
export const ActivityImage: React.FC<{
  name?: string;
  location?: string;
  destination?: string;
  initialUrl?: string;
  className?: string;
  alt?: string;
}> = ({ name, location, destination, initialUrl, className, alt }) => {
  const src = useDynamicActivityImage(name, location, initialUrl, destination);

  return React.createElement('img', {
    src,
    alt: alt || name || 'Activity',
    className,
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      (e.currentTarget as HTMLImageElement).src = NEUTRAL_ACTIVITY_PLACEHOLDER;
    },
  });
};

