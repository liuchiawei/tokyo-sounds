/**
 * usePlacesAudio Hook
 * Fetches POIs from Google Places API and creates spatial audio sources
 */

import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import {
  PLACES_API_CONFIG,
  AUDIO_POI_TYPES,
  POI_AUDIO_MAPPINGS,
} from "@/config/tokyo-config";
import {
  latLngAltToECEF,
  ecefToLatLngAlt,
  haversineDistance,
} from "@/lib/geo-utils";

export interface POI {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  worldPosition: THREE.Vector3;
  audioUrl: string | null;
}

export interface PlacesAudioState {
  pois: POI[];
  isLoading: boolean;
  error: string | null;
  lastFetchPosition: { lat: number; lng: number } | null;
}

interface UsePlacesAudioOptions {
  apiKey: string;
  enabled?: boolean;
  listenerRef?: React.RefObject<THREE.AudioListener | null>;
  onPOIsLoaded?: (pois: POI[]) => void;
}

const poiCache = new Map<string, { pois: POI[]; timestamp: number }>();

/**
 * Generate cache key for a position
 */
function getCacheKey(lat: number, lng: number): string {
  // (~100m precision)
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

/** getAudioForPOIType
 * 
 * Select audio file for a POI type
 * @param type - POI type
 * @returns Audio file URL or null if no audio files are available
 */
function getAudioForPOIType(type: string): string | null {
  const audioFiles = POI_AUDIO_MAPPINGS[type] || POI_AUDIO_MAPPINGS.default;
  if (!audioFiles || audioFiles.length === 0) return null;
  return audioFiles[Math.floor(Math.random() * audioFiles.length)];
}

/** fetchPOIs
 * 
 * Fetch POIs from Google Places API
 * @param apiKey - Google Places API key
 * @param lat - Latitude
 * @param lng - Longitude
 * @param radius - Search radius in meters
 * @returns Array of POIs
 */
async function fetchPOIs(
  apiKey: string,
  lat: number,
  lng: number,
  radius: number = PLACES_API_CONFIG.radius
): Promise<POI[]> {
  const cacheKey = getCacheKey(lat, lng);
  const cached = poiCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < PLACES_API_CONFIG.cacheTimeout) {
    console.log("[PlacesAudio] Using cached POIs");
    return cached.pois;
  }

  console.log(`[PlacesAudio] Fetching POIs near ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

  try {
    const typesParam = AUDIO_POI_TYPES.join("|");

    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", radius.toString());
    url.searchParams.set("type", typesParam);
    url.searchParams.set("key", apiKey);

    // Note: In production, this should go through a backend proxy to protect the API key
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Places API status: ${data.status}`);
    }

    const results = data.results || [];
    const pois: POI[] = results.slice(0, PLACES_API_CONFIG.maxResults).map((place: any) => {
      const poiLat = place.geometry.location.lat;
      const poiLng = place.geometry.location.lng;
      const primaryType = place.types?.[0] || "default";

      return {
        id: place.place_id,
        name: place.name,
        type: primaryType,
        lat: poiLat,
        lng: poiLng,
        worldPosition: latLngAltToECEF(poiLat, poiLng, 10), // 10m above ground
        audioUrl: getAudioForPOIType(primaryType),
      };
    });

    poiCache.set(cacheKey, { pois, timestamp: Date.now() });

    console.log(`[PlacesAudio] Found ${pois.length} POIs`);
    return pois;
  } catch (error) {
    console.error("[PlacesAudio] Failed to fetch POIs:", error);
    throw error;
  }
}

/** usePlacesAudio
 * 
 * Hook for managing Places API audio sources
 * @param apiKey - Google Places API key
 * @param enabled - Whether to enable the hook
 * @param listenerRef - Reference to the audio listener
 * @param onPOIsLoaded - Callback function when POIs are loaded
 * @returns Object containing the PlacesAudioState and audio sources
 */
export function usePlacesAudio({
  apiKey,
  enabled = true,
  listenerRef,
  onPOIsLoaded,
}: UsePlacesAudioOptions) {
  const [state, setState] = useState<PlacesAudioState>({
    pois: [],
    isLoading: false,
    error: null,
    lastFetchPosition: null,
  });

  const audioSourcesRef = useRef<Map<string, THREE.PositionalAudio>>(new Map());
  const isFetchingRef = useRef(false);

  /**
   * 
   * Fetch POIs for a position
   * @param lat - Latitude
   * @param lng - Longitude
   * @returns void
   */
  const fetchPOIsForPosition = useCallback(
    async (lat: number, lng: number) => {
      if (!apiKey || !enabled || isFetchingRef.current) return;

      if (state.lastFetchPosition) {
        const distance = haversineDistance(
          lat,
          lng,
          state.lastFetchPosition.lat,
          state.lastFetchPosition.lng
        );
        if (distance < PLACES_API_CONFIG.minMovementForRefresh) {
          return;
        }
      }

      isFetchingRef.current = true;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const pois = await fetchPOIs(apiKey, lat, lng);
        setState({
          pois,
          isLoading: false,
          error: null,
          lastFetchPosition: { lat, lng },
        });
        onPOIsLoaded?.(pois);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      } finally {
        isFetchingRef.current = false;
      }
    },
    [apiKey, enabled, state.lastFetchPosition, onPOIsLoaded]
  );

  /**
   * Update audio sources based on camera position
   * @param cameraWorldPos - World position of the camera
   * @returns void
   */
  const updateFromCameraPosition = useCallback(
    (cameraWorldPos: THREE.Vector3) => {
      const geo = ecefToLatLngAlt(cameraWorldPos);
      fetchPOIsForPosition(geo.lat, geo.lng);
    },
    [fetchPOIsForPosition]
  );

  /**
   * Create audio source for a POI
   * @param poi - POI object
   * @param listener - Audio listener
   * @returns PositionalAudio object or null if no audio URL is available
   */
  const createAudioSource = useCallback(
    (poi: POI, listener: THREE.AudioListener): THREE.PositionalAudio | null => {
      if (!poi.audioUrl) return null;

      const audio = new THREE.PositionalAudio(listener);

      audio.setRefDistance(50);
      audio.setRolloffFactor(1);
      audio.setDistanceModel("inverse");
      audio.setMaxDistance(500);

      audio.position.copy(poi.worldPosition);

      const audioLoader = new THREE.AudioLoader();
      audioLoader.load(
        poi.audioUrl,
        (buffer) => {
          audio.setBuffer(buffer);
          audio.setLoop(true);
          audio.setVolume(0.5);
        },
        undefined,
        (error) => {
          console.warn(`[PlacesAudio] Failed to load audio for ${poi.name}:`, error);
        }
      );

      return audio;
    },
    []
  );

  /**
   * Initialize audio sources for all POIs
   * @param listener - Audio listener
   * @returns void
   */
  const initializeAudioSources = useCallback(
    (listener: THREE.AudioListener) => {
      audioSourcesRef.current.forEach((audio) => {
        if (audio.isPlaying) audio.stop();
        audio.disconnect();
      });
      audioSourcesRef.current.clear();

      state.pois.forEach((poi) => {
        if (poi.audioUrl) {
          const audio = createAudioSource(poi, listener);
          if (audio) {
            audioSourcesRef.current.set(poi.id, audio);
          }
        }
      });

      console.log(`[PlacesAudio] Initialized ${audioSourcesRef.current.size} audio sources`);
    },
    [state.pois, createAudioSource]
  );

  /**
   * Start all audio sources
   * @returns void
   */
  const startAllAudio = useCallback(() => {
    audioSourcesRef.current.forEach((audio, id) => {
      if (audio.buffer && !audio.isPlaying) {
        try {
          audio.play();
        } catch (e) {
          console.warn(`[PlacesAudio] Failed to start audio ${id}:`, e);
        }
      }
    });
  }, []);

  /**
   * Stop all audio sources
   * @returns void
   */
  const stopAllAudio = useCallback(() => {
    audioSourcesRef.current.forEach((audio) => {
      if (audio.isPlaying) {
        audio.stop();
      }
    });
  }, []);

  /**
   * Clean up on unmount
   * @returns void
   */
  useEffect(() => {
    return () => {
      audioSourcesRef.current.forEach((audio) => {
        if (audio.isPlaying) audio.stop();
        audio.disconnect();
      });
      audioSourcesRef.current.clear();
    };
  }, []);

  /**
   * Re-initialize audio when POIs change and listener is available
   * @returns void
   */
  useEffect(() => {
    if (listenerRef?.current && state.pois.length > 0) {
      initializeAudioSources(listenerRef.current);
    }
  }, [state.pois, listenerRef, initializeAudioSources]);

  return {
    ...state,
    audioSources: audioSourcesRef.current,
    fetchPOIsForPosition,
    updateFromCameraPosition,
    initializeAudioSources,
    startAllAudio,
    stopAllAudio,
  };
}

/**
 * Component to render POI markers in 3D
 */
export function POIMarkers({ pois }: { pois: POI[] }) {
  return (
    <group name="poi-markers">
      {pois.map((poi) => (
        <mesh key={poi.id} position={poi.worldPosition}>
          <sphereGeometry args={[5, 8, 8]} />
          <meshBasicMaterial color="#ff6b6b" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

