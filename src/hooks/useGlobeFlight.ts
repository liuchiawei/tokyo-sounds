"use client";

/**
 * useGlobeFlight Hook
 * Flight controls optimized for Google 3D Tiles globe navigation
 * Works in ECEF coordinate system with proper Earth-relative movement
 */

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import * as THREE from "three";
import { ecefToLatLngAlt, latLngAltToECEF } from "@/lib/geo-utils";
import {
  damp,
  easeInOutQuad,
  createFlightConfig,
  type FlightConfig,
  EARTH_RADIUS,
} from "@/lib/flight";

export interface GlobeFlightState {
  speed: number; // m/s
  altitude: number;
  lat: number;
  lng: number;
  heading: number;
  pitch: number;
  isFrozen: boolean;
}

interface UseGlobeFlightOptions {
  camera: THREE.Camera | null;
  config?: Partial<FlightConfig>;
  onStateChange?: (state: GlobeFlightState) => void;
  onSpeedChange?: (speed: number) => void;
}

/** useGlobeFlight
 * 
 * Hook for controlling camera movement in a Google 3D Tiles globe
 * @param camera - The camera to control
 * @param config - The configuration for the flight controls
 * @param onStateChange - Callback function to update the state
 * @param onSpeedChange - Callback function to update the speed
 * @returns The flight controls
 */
export function useGlobeFlight({
  camera,
  config: configOverrides,
  onStateChange,
  onSpeedChange,
}: UseGlobeFlightOptions) {
  const config = createFlightConfig({ mode: "globe", ...configOverrides });

  const keysRef = useRef({
    pitchUp: false,
    pitchDown: false,
    bankLeft: false,
    bankRight: false,
    boost: false,
    freeze: false,
  });

  const speedRef = useRef(config.globeBaseSpeed);
  const headingRef = useRef(0); // radians
  const pitchRef = useRef(0); // radians
  const bankRef = useRef(0); // radians
  const isFrozenRef = useRef(false);

  const smoothPitchRef = useRef(0);
  const smoothBankRef = useRef(0);
  const smoothHeadingRef = useRef(0);

  const pitchHoldTimeRef = useRef(0);
  const bankHoldTimeRef = useRef(0);

  const boostCooldownRef = useRef(0);

    // Cached vectors to avoid GC
  const _position = useMemo(() => new THREE.Vector3(), []);
  const _forward = useMemo(() => new THREE.Vector3(), []);
  const _up = useMemo(() => new THREE.Vector3(), []);
  const _right = useMemo(() => new THREE.Vector3(), []);
  const _tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const _localUp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      switch (e.code) {
        case "KeyW":
          keysRef.current.pitchUp = true;
          break;
        case "KeyS":
          keysRef.current.pitchDown = true;
          break;
        case "KeyA":
          keysRef.current.bankLeft = true;
          break;
        case "KeyD":
          keysRef.current.bankRight = true;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keysRef.current.boost = true;
          break;
        case "Space":
          e.preventDefault();
          isFrozenRef.current = !isFrozenRef.current;
          keysRef.current.freeze = isFrozenRef.current;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          keysRef.current.pitchUp = false;
          pitchHoldTimeRef.current = 0;
          break;
        case "KeyS":
          keysRef.current.pitchDown = false;
          pitchHoldTimeRef.current = 0;
          break;
        case "KeyA":
          keysRef.current.bankLeft = false;
          if (!keysRef.current.bankRight) bankHoldTimeRef.current = 0;
          break;
        case "KeyD":
          keysRef.current.bankRight = false;
          if (!keysRef.current.bankLeft) bankHoldTimeRef.current = 0;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keysRef.current.boost = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  /**
   * Calculate local up vector (away from Earth center) at a position
   * @param position - The position to get the local up vector of
   * @returns The local up vector
   */
  const getLocalUp = useCallback(
    (position: THREE.Vector3): THREE.Vector3 => {
      // In ECEF, local "up" is just the normalized position vector
      return _localUp.copy(position).normalize();
    },
    [_localUp]
  );

  /**
   * Get altitude above Earth surface
   * @param position - The position to get the altitude of
   * @returns The altitude in meters
   */
  const getAltitude = useCallback((position: THREE.Vector3): number => {
    const distFromCenter = position.length();
    return distFromCenter - EARTH_RADIUS;
  }, []);

  /**
   * Update function called each frame
   * 
   * @param delta - The time since the last frame
   * @returns void
   */
  const update = useCallback(
    (delta: number) => {
      if (!camera) return;

      const dt = Math.min(delta, 0.1); // delta time
      const keys = keysRef.current;

      if (keys.freeze) {
        onSpeedChange?.(0);
        return;
      }

      camera.getWorldPosition(_position);

      const localUp = getLocalUp(_position);

      const rawPitchInput = (keys.pitchDown ? 1 : 0) - (keys.pitchUp ? 1 : 0);
      const rawBankInput = (keys.bankRight ? 1 : 0) - (keys.bankLeft ? 1 : 0);

      if (rawPitchInput !== 0) {
        pitchHoldTimeRef.current += dt;
      }
      if (rawBankInput !== 0) {
        bankHoldTimeRef.current += dt;
      }

      const pitchRamp = easeInOutQuad(
        Math.min(pitchHoldTimeRef.current / config.rampUpTime, 1)
      );
      const bankRamp = easeInOutQuad(
        Math.min(bankHoldTimeRef.current / config.rampUpTime, 1)
      );

      const pitchSpeed =
        config.pitchSpeedMin + (config.pitchSpeedMax - config.pitchSpeedMin) * pitchRamp;
      const bankSpeed =
        config.bankSpeedMin + (config.bankSpeedMax - config.bankSpeedMin) * bankRamp;

      pitchRef.current += rawPitchInput * pitchSpeed * dt;
      pitchRef.current = Math.max(-config.maxPitch, Math.min(config.maxPitch, pitchRef.current));

      if (rawBankInput !== 0) {
        bankRef.current += rawBankInput * bankSpeed * dt;
        bankRef.current = Math.max(-config.maxBank, Math.min(config.maxBank, bankRef.current));
      } else {
        bankRef.current = damp(bankRef.current, 0, config.bankRecoverySmoothing, dt);
      }

      headingRef.current += smoothBankRef.current * config.turnFromBank * dt;

      smoothPitchRef.current = damp(
        smoothPitchRef.current,
        pitchRef.current,
        config.rotationSmoothing,
        dt
      );
      smoothBankRef.current = damp(
        smoothBankRef.current,
        bankRef.current,
        config.rotationSmoothing,
        dt
      );
      smoothHeadingRef.current = damp(
        smoothHeadingRef.current,
        headingRef.current,
        config.rotationSmoothing,
        dt
      );

      _tempQuat.setFromAxisAngle(localUp, smoothHeadingRef.current);

      _forward.set(0, 0, -1).applyQuaternion(_tempQuat);
      _right.crossVectors(localUp, _forward).normalize();

      const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
        _right,
        smoothPitchRef.current
      );
      _tempQuat.premultiply(pitchQuat);

      _forward.set(0, 0, -1).applyQuaternion(_tempQuat);
      const bankQuat = new THREE.Quaternion().setFromAxisAngle(
        _forward,
        -smoothBankRef.current
      );
      _tempQuat.premultiply(bankQuat);

      camera.quaternion.slerp(_tempQuat, 1 - Math.exp(-config.rotationSmoothing * dt));

      _forward.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize();

      const verticalFactor = -_forward.dot(localUp);

      if (verticalFactor > 0.05) {
        speedRef.current += verticalFactor * config.globeGravityAccel * dt;
      } else if (verticalFactor < -0.05) {
        speedRef.current += verticalFactor * config.globeGravityDecel * dt;
      }

      if (keys.boost && boostCooldownRef.current <= 0) {
        speedRef.current += config.globeBoostImpulse;
        boostCooldownRef.current = 0.5;
      }

      if (boostCooldownRef.current > 0) {
        boostCooldownRef.current -= dt;
      }

      speedRef.current *= config.drag;
      speedRef.current = Math.max(
        config.globeMinSpeed,
        Math.min(config.globeMaxSpeed, speedRef.current)
      );

      const moveDistance = speedRef.current * dt;
      _position.addScaledVector(_forward, moveDistance);

      const altitude = getAltitude(_position);
      if (altitude < config.globeMinAltitude) {
        const correction = config.globeMinAltitude - altitude;
        _position.addScaledVector(getLocalUp(_position), correction);
      } else if (altitude > config.globeMaxAltitude) {
        const correction = altitude - config.globeMaxAltitude;
        _position.addScaledVector(getLocalUp(_position), -correction);
      }

      camera.position.copy(_position);

      const speedKmh = Math.round(speedRef.current * 3.6); // convert m/s to km/h
      onSpeedChange?.(speedKmh);

      if (onStateChange) {
        const geo = ecefToLatLngAlt(_position);
        onStateChange({
          speed: speedRef.current,
          altitude: geo.alt,
          lat: geo.lat,
          lng: geo.lng,
          heading: THREE.MathUtils.radToDeg(smoothHeadingRef.current) % 360,
          pitch: THREE.MathUtils.radToDeg(smoothPitchRef.current),
          isFrozen: keys.freeze,
        });
      }
    },
    [
      camera,
      config,
      onSpeedChange,
      onStateChange,
      getLocalUp,
      getAltitude,
      _position,
      _forward,
      _up,
      _right,
      _tempQuat,
    ]
  );

  /**
   * Fly to a specific lat/lng/alt
   * 
   * @param lat - The latitude to fly to
   * @param lng - The longitude to fly to
   * @param alt - The altitude to fly to
   * @param duration - The duration of the flight in seconds
   * @returns void
   */
  const flyTo = useCallback(
    (lat: number, lng: number, alt: number, duration: number = 2) => {
      if (!camera) return;

      const targetPos = latLngAltToECEF(lat, lng, alt);
      const startPos = camera.position.clone();
      const startTime = performance.now();

      const animate = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        const t = Math.min(elapsed / duration, 1);
        const eased = t * t * (3 - 2 * t);

        camera.position.lerpVectors(startPos, targetPos, eased);

        const localUp = getLocalUp(camera.position);
        camera.up.copy(localUp);

        if (t < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    },
    [camera, getLocalUp]
  );

  /**
   * Get current state
   * @returns The current state
   */
  const getState = useCallback((): GlobeFlightState => {
    if (!camera) {
      return {
        speed: 0,
        altitude: 0,
        lat: 0,
        lng: 0,
        heading: 0,
        pitch: 0,
        isFrozen: false,
      };
    }

    const geo = ecefToLatLngAlt(camera.position);
    return {
      speed: speedRef.current,
      altitude: geo.alt,
      lat: geo.lat,
      lng: geo.lng,
      heading: THREE.MathUtils.radToDeg(smoothHeadingRef.current) % 360,
      pitch: THREE.MathUtils.radToDeg(smoothPitchRef.current),
      isFrozen: keysRef.current.freeze,
    };
  }, [camera]);

  return {
    update,
    flyTo,
    getState,
    keysRef,
  };
}

