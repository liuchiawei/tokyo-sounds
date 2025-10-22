'use client';

import React, { useState, useRef, useEffect, useCallback, useContext, createContext } from 'react';
import * as THREE from 'three';
import {
    AudioSession,
    GraphSpec,
    createAudioSession,
    RenderResult,
    AutomationDef,
    SessionOptions,
    SpatialOptions,
    SpatialBindingMode,
} from '@/lib/audio';

type ParamValue = number | boolean | string | null;

export const AudioSessionContext = createContext<AudioSession | null>(null);

/**
 * useAudioSessionContext get the audio session context
 * @returns the audio session context
 */
export function useAudioSessionContext(): AudioSession | null {
  return useContext(AudioSessionContext);
}

/**
 * useAudioSession create an audio session
 * @param initialSpec - the initial spec
 * @param opts - the session options
 * @returns the audio session
 */
export function useAudioSession(initialSpec?: GraphSpec, opts?: SessionOptions) {
    const [session, setSession] = useState<AudioSession | null>(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const sessionRef = useRef<AudioSession | null>(null);
    const initRef = useRef(false);

    // TODO: hook ignores initialSpec/opts changes because the effect is locked behind initRef. Figure out a way to update the session when these change.
    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        createAudioSession(initialSpec, opts)
            .then(s => {
                setSession(s);
                setReady(true);
                sessionRef.current = s;
            })
            .catch(err => {
                setError(err);
                console.error('[hooks/useAudio.ts/useAudioSession] Failed to create audio session:', err);
            });

        return () => {
            if (sessionRef.current) {
                console.log('[hooks/useAudio.ts/useAudioSession] Disposing session: ', session);
                try {
                    sessionRef.current.dispose();
                    sessionRef.current = null;
                } catch (err) {
                    console.error('[hooks/useAudio.ts/useAudioSession] Failed to dispose session:', err);
                }
                // sessionRef.current.dispose();
            }
        };
    }, []);

    return { session, ready, error };
}

/**
 * useParam get the value of a param
 * @param nodeId - the id of the node
 * @param param - the param to get the value of
 * @returns the value of the param
 */
// TODO: generalize the value type so boolean/enum params don't have to masquerade as numbers.
export function useParam(nodeId: string, param: string): [number, (value: number, opts?: { record?: boolean }) => void] {
    const session = useAudioSessionContext();
    const [value, setValue] = useState(0);
    const pendingUpdateRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!session) return;

        const node = session.getNode(nodeId);
        if (node) {
            const raw = node.raw();
            if (raw[param] !== undefined) {
                const val = raw[param].value !== undefined ? raw[param].value : raw[param];
                setValue(val);
            }
        }

        const handler = (data: any) => {
            if (data.nodeId === nodeId && data.param === param) {
                setValue(data.value);
            }
        };

        session.on('paramChange', handler);

        return () => {
            session.off('paramChange', handler);
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [session, nodeId, param]);

    const setter = useCallback((newValue: number, opts: { record?: boolean } = { record: true }) => {
        if (!session) return;

        setValue(newValue);
        pendingUpdateRef.current = newValue;

        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
            if (pendingUpdateRef.current !== null) {
                session.updateParam(nodeId, param, pendingUpdateRef.current, opts);
                pendingUpdateRef.current = null;
            }
            rafRef.current = null;
        });
    }, [session, nodeId, param]);

    return [value, setter];
}

/**
 * useCommit commit the spec
 * @returns the commit result
 */
export function useCommit() {
    const session = useAudioSessionContext();
    const [status, setStatus] = useState<'idle' | 'rendering' | 'success' | 'error'>('idle');
    const [lastResult, setLastResult] = useState<RenderResult | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!session) return;

        const onRenderStart = () => setStatus('rendering');
        const onRenderDone = () => setStatus('success');
        const onError = (err: any) => {
            setStatus('error');
            setError(err);
        };

        session.on('renderStart', onRenderStart);
        session.on('renderDone', onRenderDone);
        session.on('error', onError);

        return () => {
            session.off('renderStart', onRenderStart);
            session.off('renderDone', onRenderDone);
            session.off('error', onError);
        };
    }, [session]);

    const commit = useCallback(async (opts = {}) => {
        if (!session) {
            throw new Error('[useAudio/useCommit] No audio session available');
        }

        setStatus('rendering');
        setError(null);

        try {
            const result = await session.commit(opts);
            setLastResult(result);
            setStatus('success');
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setStatus('error');
            throw error;
        }
    }, [session]);

    return { commit, status, lastResult, error };
}

/**
 * useSpatial bind a spatial audio node
 * @param nodeId - the id of the node
 * @param object3DRef - the ref to the object3d
 * @param listenerRef - the ref to the audio listener
 * @param opts - the spatial options
 * @param deps - the dependencies
 */
export function useSpatial(
    nodeId: string,
    object3DRef: React.RefObject<THREE.Object3D>,
    listenerRef?: React.RefObject<THREE.AudioListener>,
    opts?: SpatialOptions,
    deps: any[] = []
) {
    const session = useAudioSessionContext();
    const disposerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!session || !object3DRef.current) {
            return;
        }

        let listener: THREE.AudioListener;

        if (listenerRef?.current) {
            listener = listenerRef.current;
        } else {
            listener = new THREE.AudioListener();
        }

        try {
            const disposer = session.bindSpatial(nodeId, object3DRef.current, listener, opts);
            disposerRef.current = disposer;

            return () => {
                if (disposerRef.current) {
                    disposerRef.current();
                    disposerRef.current = null;
                }
            };
        } catch (err) {
            console.error('[useAudio/useSpatial] Failed to bind spatial audio:', err);
        }
    }, [session, nodeId, object3DRef, listenerRef, opts, ...deps]); // TODO: memoize opts/deps or relax effect triggers to avoid thrashing spatial bindings.
}

/**
 * useAutomation get the automations for a node
 * @param nodeId - the id of the node
 * @param param - the param to get the automations for
 * @returns the automations
 */
export function useAutomation(nodeId: string, param: string) {
    const session = useAudioSessionContext();
    const [automations, setAutomations] = useState<AutomationDef[]>([]);

    useEffect(() => {
        if (!session) return;

        const updateAutomations = () => {
            const spec = session.serialize();
            const filtered = spec.automations.filter(a => a.nodeId === nodeId && a.param === param);
            setAutomations(filtered);
        };

        updateAutomations();

        const onAdded = () => updateAutomations();
        const onRemoved = () => updateAutomations();

        session.on('automationAdded', onAdded);
        session.on('automationRemoved', onRemoved);

        return () => {
            session.off('automationAdded', onAdded);
            session.off('automationRemoved', onRemoved);
        };
    }, [session, nodeId, param]);

    const add = useCallback((def: Partial<AutomationDef>) => {
        if (!session) return '';
        return session.automate(nodeId, param, def);
    }, [session, nodeId, param]);

    const remove = useCallback((id: string) => {
        if (!session) return;
        session.removeAutomation(id);
    }, [session]);

    return { automations, add, remove };
}

/**
 * useSpatialMode control the spatial binding mode (live/committed)
 * @param nodeId - the id of the node
 * @returns the spatial mode control functions
 */
export function useSpatialMode(nodeId: string) {
    const session = useAudioSessionContext();
    const [mode, setMode] = useState<SpatialBindingMode | undefined>(undefined);

    useEffect(() => {
        if (!session) return;

        const currentMode = session.getSpatialMode(nodeId);
        setMode(currentMode);

        const handler = (data: any) => {
            if (data.nodeId === nodeId) {
                setMode(data.mode);
            }
        };

        session.on('spatialModeChanged', handler);

        return () => {
            session.off('spatialModeChanged', handler);
        };
    }, [session, nodeId]);

    const freeze = useCallback((result: RenderResult) => {
        if (!session) return;
        session.freezeSpatialBinding(nodeId, result);
    }, [session, nodeId]);

    const unfreeze = useCallback(() => {
        if (!session) return;
        session.unfreezeSpatialBinding(nodeId);
    }, [session, nodeId]);

    const getBinding = useCallback(() => {
        if (!session) return undefined;
        return session.getSpatialBinding(nodeId);
    }, [session, nodeId]);

    return { mode, freeze, unfreeze, getBinding };
}

/**
 * usePreview control the preview path (Tone.js → speakers)
 * @param nodeId - the id of the node
 * @returns preview control functions
 */
export function usePreview(nodeId: string) {
    const session = useAudioSessionContext();
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        if (!session) return;

        const isEnabled = session.isPreviewEnabled(nodeId);
        setEnabled(isEnabled);

        const handler = (data: any) => {
            if (data.nodeId === nodeId) {
                setEnabled(data.enabled);
            }
        };

        session.on('previewChanged', handler);

        return () => {
            session.off('previewChanged', handler);
        };
    }, [session, nodeId]);

    const toggle = useCallback(() => {
        if (!session) return;
        const newState = !session.isPreviewEnabled(nodeId);
        session.setPreview(nodeId, newState);
    }, [session, nodeId]);

    const enable = useCallback(() => {
        if (!session) return;
        session.setPreview(nodeId, true);
    }, [session, nodeId]);

    const disable = useCallback(() => {
        if (!session) return;
        session.setPreview(nodeId, false);
    }, [session, nodeId]);

    return { enabled, toggle, enable, disable };
}

/**
 * AudioSessionProvider provide the audio session
 * @param children - the children
 * @param initialSpec - the initial spec
 * @param opts - the session options
 */
export function AudioSessionProvider({
    children,
    initialSpec,
    opts
}: {
    children: React.ReactNode;
    initialSpec?: GraphSpec;
    opts?: SessionOptions;
}): React.ReactElement {
    const { session } = useAudioSession(initialSpec, opts);
    const Provider = AudioSessionContext.Provider;
    const providerValue = session;

    return React.createElement(Provider, { value: providerValue }, children);
}

/**
 * useDistanceCulling perform distance-based audio culling every frame
 * @param cameraRef - ref to the camera
 * @returns culling statistics
 */
export function useDistanceCulling(cameraRef: React.RefObject<THREE.Camera>) {
    const session = useAudioSessionContext();
    const [stats, setStats] = useState({ totalSources: 0, activeSources: 0, culledSources: 0, estimatedMemoryMB: 0 });
    const rafRef = useRef<number | null>(null);
    const camPosRef = useRef(new THREE.Vector3());
    const lastCullTsRef = useRef(0);
    const lastStatsTsRef = useRef(0);

    useEffect(() => {
        if (!session || !cameraRef.current) return;

        const updateCulling = (ts: number) => {
            if (session && cameraRef.current) {
                const shouldCull = ts - lastCullTsRef.current > 66;
                const shouldUpdateStats = ts - lastStatsTsRef.current > 500;

                if (shouldCull) {
                    cameraRef.current.getWorldPosition(camPosRef.current);
                    session.updateSpatialCulling(camPosRef.current);
                    lastCullTsRef.current = ts;
                }

                if (shouldUpdateStats) {
                    const currentStats = session.getSpatialStats();
                    setStats(currentStats);
                    lastStatsTsRef.current = ts;
                }
            }

            rafRef.current = requestAnimationFrame(updateCulling);
        };

        rafRef.current = requestAnimationFrame(updateCulling);

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [session, cameraRef]);

    return stats;
}
