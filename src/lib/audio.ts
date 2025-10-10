import * as Tone from 'tone';
import * as THREE from 'three';

// define debug flag
const DEBUG_AUDIO = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

export type NodeType = 'Player' | 'Filter' | 'Reverb' | 'Gain';
export type AutomationMode = 'linearRamp' | 'expRamp' | 'points' | 'lfoRef';
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch' | 'peak' | 'lowshelf' | 'highshelf';
export type AudioSessionEvent = 'paramChange' | 'automationAdded' | 'automationRemoved' | 'renderStart' | 'renderDone' | 'error' | 'nodeAdded' | 'nodeRemoved' | 'graphDirty' | 'spatialModeChanged' | 'previewChanged';

export interface AssetDef {
    id: string;
    kind: 'sample';
    src: string;
    hash?: string;
    trim?: { start: number; end: number };
    loop: boolean;
}

export interface NodeDef {
    id: string;
    type: NodeType;
    assetId?: string;
    params: Record<string, any>;
}

export interface ConnectionDef {
    from: { id: string; output?: string };
    to: { id: string; input?: string };
}

export interface AutomationPoint {
    t: number;
    v: number;
}

export interface AutomationCurve {
    mode: AutomationMode;
    points: AutomationPoint[];
}

export interface AutomationDef {
    id: string;
    nodeId: string;
    param: string;
    curve: AutomationCurve;
    startTime: number;
    endTime: number;
}

export interface BusDef {
    id: string;
    type: NodeType;
    params: Record<string, any>;
}

export interface SendDef {
    fromNodeId: string;
    toBusId: string;
    gain: number;
}

export interface MixDef {
    masterGain: number;
    limiter?: { threshold: number };
}

export interface MetaDef {
    title?: string;
    author?: string;
    tags?: string[];
    createdAt?: string;
    license?: string;
}

export interface GraphSpec {
    version: string;
    schema: string;
    tempo: number;
    seed: number;
    sampleRate?: number;
    assets: AssetDef[];
    nodes: NodeDef[];
    connections: ConnectionDef[];
    automations: AutomationDef[];
    buses: BusDef[];
    sends: SendDef[];
    mix: MixDef;
    meta?: MetaDef;
}

export interface CommitOptions {
    format?: 'wav';
    normalize?: boolean;
    bitDepth?: 16 | 24;
    durationOverride?: number;
}

export interface RenderResult {
    buffer: AudioBuffer;
    blob: Blob;
    url: string;
    specHash: string;
    audioHash: string;
    duration: number;
    sampleRate: number;
}

export type SpatialBindingMode = 'live' | 'committed';

export interface SpatialOptions {
    refDistance?: number;
    rolloffFactor?: number;
    distanceModel?: 'linear' | 'inverse' | 'exponential';
    mode?: SpatialBindingMode; // Default: 'live'
}

export interface SpatialBindingInfo {
    nodeId: string;
    mode: SpatialBindingMode;
    audio: THREE.PositionalAudio;
    object3D: THREE.Object3D;
    committedBuffer?: AudioBuffer;
    mediaStreamSource?: MediaStreamAudioSourceNode;
}

export interface NodeSummary {
    id: string;
    type: NodeType;
    params: Record<string, any>;
}

export interface SessionOptions {
    context?: AudioContext;
    autoStart?: boolean;
}

export interface NodeHandle {
    id: string;
    type: NodeType;
    raw(): any;
    set(params: Record<string, any>, opts?: { record?: boolean }): void;
}

export interface AudioSession {
    serialize(): GraphSpec;
    hash(): string;
    getNode(id: string): NodeHandle | undefined;
    listNodes(type?: string): NodeSummary[];
    updateParam(nodeId: string, param: string, value: any, opts?: { atTime?: number; record?: boolean }): void;
    automate(nodeId: string, param: string, def: Partial<AutomationDef>): string;
    removeAutomation(id: string): void;
    addNode(def: NodeDef): void;
    removeNode(id: string): void;
    connect(fromId: string, toId: string): void;
    disconnect(fromId: string, toId: string): void;
    commit(opts?: CommitOptions): Promise<RenderResult>;
    bindSpatial(nodeId: string, object3D: THREE.Object3D, listener: THREE.AudioListener, opts?: SpatialOptions): () => void;
    getSpatialBinding(nodeId: string): SpatialBindingInfo | undefined;
    getSpatialMode(nodeId: string): SpatialBindingMode | undefined;
    freezeSpatialBinding(nodeId: string, result: RenderResult): void;
    unfreezeSpatialBinding(nodeId: string): void;
    setPreview(nodeId: string, enabled: boolean): void;
    isPreviewEnabled(nodeId: string): boolean;
    undo(): boolean;
    redo(): boolean;
    dispose(): void;
    on(event: AudioSessionEvent, handler: (...args: any[]) => void): void;
    off(event: AudioSessionEvent, handler: (...args: any[]) => void): void;
}

interface ParamConstraint {
    min?: number;
    max?: number;
    type: 'number' | 'boolean' | 'enum';
    enum?: string[];
    automatable: boolean;
}

interface NodeTypeRegistry {
    class: any;
    params: Record<string, ParamConstraint>;
}

const NODE_REGISTRY: Record<NodeType, NodeTypeRegistry> = {
    Player: {
        class: Tone.Player,
        params: {
            playbackRate: { min: 0.25, max: 4, type: 'number', automatable: true },
            loop: { type: 'boolean', automatable: false },
            reverse: { type: 'boolean', automatable: false },
        },
    },
    Filter: {
        class: Tone.Filter,
        params: {
            frequency: { min: 20, max: 20000, type: 'number', automatable: true },
            Q: { min: 0.1, max: 36, type: 'number', automatable: true },
            type: { type: 'enum', enum: ['lowpass', 'highpass', 'bandpass', 'notch', 'peak', 'lowshelf', 'highshelf'], automatable: false },
        },
    },
    Reverb: {
        class: Tone.Reverb,
        params: {
            decay: { min: 0.1, max: 20, type: 'number', automatable: false },
            wet: { min: 0, max: 1, type: 'number', automatable: true },
        },
    },
    Gain: {
        class: Tone.Gain,
        params: {
            gain: { min: 0, max: 4, type: 'number', automatable: true },
        },
    },
};

interface RuntimeNode {
    def: NodeDef;
    instance: any;
    exportBus: GainNode;
    assetLoaded: boolean;
}

interface ChangeRecord {
    type: 'param' | 'automation' | 'node';
    data: any;
    inverse: any;
}

// rng baby. might switch to a different rng later idk
function mulberry32(seed: number): () => number {
    return function () {
        let t = (seed += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * hashString hash the string to a hex string
 * @param str - the string to hash
 * @returns the hash of the string
 */
async function hashString(str: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

/**
 * canonicalize the spec to make it easier to compare
 * @param spec - the spec to canonicalize
 * @returns the canonicalized spec
 */
function canonicalize(spec: GraphSpec): GraphSpec {
    const clone = JSON.parse(JSON.stringify(spec));

    const sortById = (arr: any[]) => arr.sort((a, b) => (a.id || '').localeCompare(b.id || ''));

    if (clone.assets) sortById(clone.assets);
    if (clone.nodes) sortById(clone.nodes);
    if (clone.automations) sortById(clone.automations);
    if (clone.buses) sortById(clone.buses);

    const sortKeys = (obj: any): any => {
        if (Array.isArray(obj)) return obj.map(sortKeys);
        if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj)
                .sort()
                .reduce((acc, key) => {
                    acc[key] = sortKeys(obj[key]);
                    return acc;
                }, {} as any);
        }
        return obj;
    };

    return sortKeys(clone);
}

/**
 * validateSpec validate the spec
 * @param spec - the spec to validate
 */
function validateSpec(spec: GraphSpec): void {
    if (!spec.version || !spec.schema) {
        throw new Error('Invalid spec: missing version or schema');
    }
    if (spec.schema !== 'graph@1') {
        throw new Error(`Unsupported spec schema: ${spec.schema}`);
    }

    const nodeIds = new Set<string>();
    for (const node of spec.nodes) {
        if (nodeIds.has(node.id)) {
            throw new Error(`Duplicate node id: ${node.id}`);
        }
        nodeIds.add(node.id);

        if (!NODE_REGISTRY[node.type]) {
            throw new Error(`Unknown node type: ${node.type}`);
        }
    }
}

/**
 * validateParam validate the param
 * @param nodeType - the type of the node
 * @param param - the param to validate
 * @param value - the value to validate
 * @returns the validated value
 */
function validateParam(nodeType: NodeType, param: string, value: any): any {
    const registry = NODE_REGISTRY[nodeType];
    const constraint = registry.params[param];

    if (!constraint) {
        throw new Error(`Unknown parameter ${param} for node type ${nodeType}`);
    }

    if (constraint.type === 'number') {
        let numVal = Number(value);
        if (isNaN(numVal)) {
            throw new Error(`Parameter ${param} must be a number`);
        }
        if (constraint.min !== undefined && numVal < constraint.min) {
            if (DEBUG_AUDIO) console.warn(`Clamping ${param} from ${numVal} to min ${constraint.min}`);
            numVal = constraint.min;
        }
        if (constraint.max !== undefined && numVal > constraint.max) {
            if (DEBUG_AUDIO) console.warn(`Clamping ${param} from ${numVal} to max ${constraint.max}`);
            numVal = constraint.max;
        }
        return numVal;
    }

    if (constraint.type === 'boolean') {
        return Boolean(value);
    }

    if (constraint.type === 'enum') {
        if (!constraint.enum?.includes(value)) {
            throw new Error(`Invalid enum value ${value} for ${param}. Must be one of: ${constraint.enum?.join(', ')}`);
        }
        return value;
    }

    return value;
}

/**
 * createEmptySpec create an empty spec
 * @returns the empty spec
 */
function createEmptySpec(): GraphSpec {
    return {
        version: '1.0.0',
        schema: 'graph@1',
        tempo: 120,
        seed: Date.now(),
        assets: [],
        nodes: [],
        connections: [],
        automations: [],
        buses: [],
        sends: [],
        mix: { masterGain: 1 },
    };
}

/**
* buildRuntimeGraphWithBuffers build the runtime graph with pre-loaded buffers
* @param spec - the spec to build the runtime graph from
* @param context - the audio context to use
* @param preloadedBuffers - pre-loaded audio buffers (for offline render)
* @returns a map of node id to runtime node
*/
async function buildRuntimeGraphWithBuffers(
    spec: GraphSpec,
    context: BaseAudioContext,
    preloadedBuffers: Map<string, AudioBuffer>
): Promise<Map<string, RuntimeNode>> {
    const registry = new Map<string, RuntimeNode>();

    for (const nodeDef of spec.nodes) {
        let instance: any;
        const nodeType = nodeDef.type;

        if (nodeType === 'Player') {
            const assetId = nodeDef.assetId;
            const audioBuffer = preloadedBuffers.get(assetId || '');
            if (audioBuffer) {

                instance = new Tone.Player(audioBuffer);
                if (DEBUG_AUDIO) {
                    console.log(`Created Player ${nodeDef.id} with pre-loaded buffer (${audioBuffer.duration}s)`);
                }
            } else {
                instance = new Tone.Player();
                console.warn(`No pre-loaded buffer found for player ${nodeDef.id} (assetId: ${assetId})`);
            }
        } else if (nodeType === 'Filter') {
            instance = new Tone.Filter();
        } else if (nodeType === 'Reverb') {
            instance = new Tone.Reverb();
            if (nodeDef.params.decay !== undefined) {
                await instance.generate();
            }
        } else if (nodeType === 'Gain') {
            instance = new Tone.Gain();
        }

        for (const [param, value] of Object.entries(nodeDef.params)) {
            try {
                const validValue = validateParam(nodeType, param, value);
                if (instance[param] !== undefined) {
                    if (instance[param].value !== undefined) {
                        instance[param].value = validValue;
                    } else {
                        instance[param] = validValue;
                    }
                    if (DEBUG_AUDIO) {
                        console.log(`Set ${nodeDef.id}.${param} = ${validValue}`);
                    }
                }
            } catch (err) {
                if (DEBUG_AUDIO) console.warn(`Failed to set param ${param}:`, err);
            }
        }

        const exportBus = context.createGain();
        exportBus.gain.value = 1;

        registry.set(nodeDef.id, {
            def: nodeDef,
            instance,
            exportBus,
            assetLoaded: !nodeDef.assetId || preloadedBuffers.has(nodeDef.assetId),
        });
    }

    for (const conn of spec.connections) {
        const fromNode = registry.get(conn.from.id);
        const toNode = registry.get(conn.to.id);

        if (fromNode && toNode) {
            try {
                fromNode.instance.connect(toNode.instance);
            } catch (err) {
                if (DEBUG_AUDIO) console.warn(`Failed to connect ${conn.from.id} -> ${conn.to.id}:`, err);
            }
        }
    }

    for (const [id, node] of registry.entries()) {
        const hasOutgoing = spec.connections.some(c => c.from.id === id);
        if (!hasOutgoing) {
            try {
                node.instance.connect(node.exportBus);
            } catch (err) {
                if (DEBUG_AUDIO) console.warn(`Failed to connect ${id} to export bus:`, err);
            }
        }
    }

    return registry;
}

/**
* buildRuntimeGraph build the runtime graph
* @param spec - the spec to build the runtime graph from
* @param context - the audio context to use
* @returns a map of node id to runtime node
*/
async function buildRuntimeGraph(spec: GraphSpec, context: BaseAudioContext): Promise<Map<string, RuntimeNode>> {
    const registry = new Map<string, RuntimeNode>();
    const assetMap = new Map<string, Tone.ToneAudioBuffer>();

    for (const asset of spec.assets) {
        try {
            const buffer = new Tone.ToneAudioBuffer(asset.src);
            await buffer.loaded;
            assetMap.set(asset.id, buffer);
            if (DEBUG_AUDIO) {
                console.log(`Loaded asset ${asset.id} from ${asset.src}`);
            }
        } catch (err) {
            console.error(`Failed to load asset ${asset.id}:`, err);
        }
    }

    for (const nodeDef of spec.nodes) {
        let instance: any;
        const nodeType = nodeDef.type;

        if (nodeType === 'Player') {
            const assetDef = spec.assets.find(a => a.id === nodeDef.assetId);
            if (assetDef) {
                instance = new Tone.Player(assetDef.src);
                try {
                    await instance.loaded;
                    if (DEBUG_AUDIO) {
                        console.log(`Player ${nodeDef.id} loaded successfully`);
                    }
                } catch (err) {
                    console.error(`Failed to load player ${nodeDef.id}:`, err);
                }
            } else {
                instance = new Tone.Player();
            }
        } else if (nodeType === 'Filter') {
            instance = new Tone.Filter();
        } else if (nodeType === 'Reverb') {
            instance = new Tone.Reverb();
            if (nodeDef.params.decay !== undefined) {
                await instance.generate();
            }
        } else if (nodeType === 'Gain') {
            instance = new Tone.Gain();
        }

        for (const [param, value] of Object.entries(nodeDef.params)) {
            try {
                const validValue = validateParam(nodeType, param, value);
                if (instance[param] !== undefined) {
                    if (instance[param].value !== undefined) {
                        instance[param].value = validValue;
                    } else {
                        instance[param] = validValue;
                    }
                }
            } catch (err) {
                if (DEBUG_AUDIO) console.warn(`Failed to set param ${param}:`, err);
            }
        }

        const exportBus = context.createGain();
        exportBus.gain.value = 1;

        registry.set(nodeDef.id, {
            def: nodeDef,
            instance,
            exportBus,
            assetLoaded: !nodeDef.assetId || assetMap.has(nodeDef.assetId),
        });
    }

    for (const conn of spec.connections) {
        const fromNode = registry.get(conn.from.id);
        const toNode = registry.get(conn.to.id);

        if (fromNode && toNode) {
            try {
                fromNode.instance.connect(toNode.instance);
            } catch (err) {
                if (DEBUG_AUDIO) console.warn(`Failed to connect ${conn.from.id} -> ${conn.to.id}:`, err);
            }
        }
    }

    for (const [id, node] of registry.entries()) {
        const hasOutgoing = spec.connections.some(c => c.from.id === id);
        if (!hasOutgoing) {
            try {
                node.instance.connect(node.exportBus);
            } catch (err) {
                if (DEBUG_AUDIO) console.warn(`Failed to connect ${id} to export bus:`, err);
            }
        }
    }

    return registry;
}

/**
* scheduleAutomations schedule the automations for the spec
* @param registry - the registry of nodes
* @param spec - the spec to schedule the automations for
* @param context - the audio context to use
*/
function scheduleAutomations(registry: Map<string, RuntimeNode>, spec: GraphSpec, context: BaseAudioContext): void {
    const now = context.currentTime;

    for (const auto of spec.automations) {
        const node = registry.get(auto.nodeId);
        if (!node) continue;

        const instance = node.instance;
        const paramObj = instance[auto.param];

        if (!paramObj || paramObj.value === undefined) continue;

        if (auto.curve.mode === 'linearRamp' && auto.curve.points.length >= 2) {
            for (let i = 0; i < auto.curve.points.length; i++) {
                const point = auto.curve.points[i];
                if (i === 0) {
                    paramObj.setValueAtTime(point.v, now + point.t);
                } else {
                    paramObj.linearRampToValueAtTime(point.v, now + point.t);
                }
            }
        } else if (auto.curve.mode === 'points') {
            for (const point of auto.curve.points) {
                paramObj.setValueAtTime(point.v, now + point.t);
            }
        }
    }
}

/**
 * estimateDuration estimate the duration of the spec
 * @param spec - the spec to estimate the duration for
 * @param opts - the commit options
 * @param assetDurations - map of asset ID to duration in seconds
 * @returns the estimated duration
 */
function estimateDuration(spec: GraphSpec, opts: CommitOptions = {}, assetDurations?: Map<string, number>): number {
    if (opts.durationOverride) return opts.durationOverride;

    let maxDuration = 0;

    for (const auto of spec.automations) {
        if (auto.endTime > maxDuration) {
            maxDuration = auto.endTime;
        }
    }

    if (assetDurations) {
        for (const node of spec.nodes) {
            if (node.type === 'Player' && node.assetId) {
                const assetDuration = assetDurations.get(node.assetId);
                if (assetDuration && assetDuration > maxDuration) {
                    maxDuration = assetDuration;
                }
            }
        }
    }

    if (maxDuration === 0) {
        maxDuration = 5;
    }

    return maxDuration;
}

/**
 * Encodes the buffer to a audio file.
 * @param {AudioBuffer} buffer - The buffer to encode.
 * @param {CommitOptions} [opts] - The commit options.
 * @returns {Promise<{ blob: Blob; url: string; audioHash: string }>} The encoded audio.
 */
async function encodeWav(buffer: AudioBuffer, opts: CommitOptions = {}): Promise<{ blob: Blob; url: string; audioHash: string }> {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const bytesPerSample = 2;
    const dataSize = length * numChannels * bytesPerSample;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    let offset = 0;
    const writeString = (str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset++, str.charCodeAt(i));
        }
    };
    const writeUint32 = (val: number) => {
        view.setUint32(offset, val, true);
        offset += 4;
    };
    const writeUint16 = (val: number) => {
        view.setUint16(offset, val, true);
        offset += 2;
    };

    writeString('RIFF');
    writeUint32(bufferSize - 8);
    writeString('WAVE');
    writeString('fmt ');
    writeUint32(16);
    writeUint16(1);
    writeUint16(numChannels);
    writeUint32(sampleRate);
    writeUint32(sampleRate * numChannels * bytesPerSample);
    writeUint16(numChannels * bytesPerSample);
    writeUint16(16);
    writeString('data');
    writeUint32(dataSize);

    const channels: Float32Array[] = [];
    for (let ch = 0; ch < numChannels; ch++) {
        channels.push(buffer.getChannelData(ch));
    }

    let peak = 0;
    const dcOffsets: number[] = [];

    for (let ch = 0; ch < numChannels; ch++) {
        let sum = 0;
        let channelPeak = 0;

        for (let i = 0; i < length; i++) {
            sum += channels[ch][i];
            const abs = Math.abs(channels[ch][i]);
            if (abs > channelPeak) channelPeak = abs;
        }

        dcOffsets[ch] = sum / length;
        if (channelPeak > peak) peak = channelPeak;
    }

    let scale = 1.0;
    if (peak > 1.0) {
        scale = 0.944 / peak;
        if (DEBUG_AUDIO) {
            console.log(`Scaling down to prevent clipping: peak=${peak.toFixed(3)} → scale=${scale.toFixed(3)}`);
        }
    } else if (opts.normalize && peak > 0.7) {
        scale = 0.944 / peak;
        if (DEBUG_AUDIO) {
            console.log(`Normalizing loud signal: peak=${peak.toFixed(3)} → scale=${scale.toFixed(3)}`);
        }
    }

    if (DEBUG_AUDIO) {
        console.log(`WAV encoding: peak=${peak.toFixed(3)}, scale=${scale.toFixed(3)}, DC offsets=${dcOffsets.map(v => v.toFixed(6)).join(', ')}`);
    }

    for (let i = 0; i < length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            let sample = (channels[ch][i] - dcOffsets[ch]) * scale;

            sample = Math.max(-0.999, Math.min(0.999, sample));

            const dither = (Math.random() + Math.random() - 1) * (1 / 32768);
            sample += dither;

            const int16 = Math.round(sample * (sample < 0 ? 0x8000 : 0x7FFF));
            view.setInt16(offset, int16, true);
            offset += 2;
        }
    }

    const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const audioHash = await hashString(new Uint8Array(arrayBuffer).toString());

    return { blob, url, audioHash };
}

/**
 * AudioSessionImpl implements the audio session
 * @param spec - the spec to create the audio session from
 * @param registry - the registry of nodes
 * @param context - the audio context to use
 */
class AudioSessionImpl implements AudioSession {
    private spec: GraphSpec;
    private registry: Map<string, RuntimeNode>;
    private context: BaseAudioContext;
    private cachedHash: string | null = null;
    private dirty = true;
    private cache: { specHash: string; result: RenderResult } | null = null;
    private eventHandlers: Map<AudioSessionEvent, Set<(...args: any[]) => void>> = new Map();
    private past: ChangeRecord[] = [];
    private future: ChangeRecord[] = [];
    private spatialBindings: Map<string, SpatialBindingInfo> = new Map();
    private previewNodes: Set<string> = new Set();

    constructor(spec: GraphSpec, registry: Map<string, RuntimeNode>, context: BaseAudioContext) {
        this.spec = spec;
        this.registry = registry;
        this.context = context;
    }

    serialize(): GraphSpec {
        return canonicalize(this.spec);
    }

    hash(): string {
        if (!this.dirty && this.cachedHash) {
            return this.cachedHash;
        }
        const canonical = this.serialize();
        const str = JSON.stringify(canonical);
        hashString(str).then(h => {
            this.cachedHash = h;
            this.dirty = false;
        });
        return this.cachedHash || '';
    }

    getNode(id: string): NodeHandle | undefined {
        const node = this.registry.get(id);
        if (!node) return undefined;

        return this.createNodeHandle(id, node);
    }

    listNodes(type?: string): NodeSummary[] {
        const nodes: NodeSummary[] = [];
        for (const [id, node] of this.registry.entries()) {
            if (!type || node.def.type === type) {
                nodes.push({
                    id,
                    type: node.def.type,
                    params: { ...node.def.params },
                });
            }
        }
        return nodes;
    }

    updateParam(nodeId: string, param: string, value: any, opts: { atTime?: number; record?: boolean } = {}): void {
        const node = this.registry.get(nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found`);
        }

        const oldValue = node.def.params[param];
        const validValue = validateParam(node.def.type, param, value);

        node.def.params[param] = validValue;

        const instance = node.instance;
        if (instance[param] !== undefined) {
            if (instance[param].value !== undefined) {
                if (opts.atTime !== undefined) {
                    instance[param].setValueAtTime(validValue, opts.atTime);
                } else {
                    instance[param].value = validValue;
                }
            } else {
                instance[param] = validValue;
            }
        }

        this.dirty = true;
        this.cache = null;

        if (opts.record !== false) {
            this.past.push({
                type: 'param',
                data: { nodeId, param, value: validValue },
                inverse: { nodeId, param, value: oldValue },
            });
            this.future = [];
        }

        this.emit('paramChange', { nodeId, param, value: validValue });
        this.emit('graphDirty');

        if (DEBUG_AUDIO) {
            console.log(`[lib/audio.ts] Param ${nodeId}.${param} = ${validValue} (cache invalidated)`);
        }
    }

    automate(nodeId: string, param: string, def: Partial<AutomationDef>): string {
        const id = def.id || `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const automation: AutomationDef = {
            id,
            nodeId,
            param,
            curve: def.curve || { mode: 'linearRamp', points: [] },
            startTime: def.startTime || 0,
            endTime: def.endTime || 0,
        };

        this.spec.automations.push(automation);
        this.dirty = true;
        this.cache = null;

        this.past.push({
            type: 'automation',
            data: { id, action: 'add', automation },
            inverse: { id, action: 'remove' },
        });
        this.future = [];

        this.emit('automationAdded', { automationId: id });
        this.emit('graphDirty');

        if (DEBUG_AUDIO) {
            console.log(`[lib/audio.ts] Automation added: ${id} for ${nodeId}.${param}`);
        }

        return id;
    }

    removeAutomation(id: string): void {
        const index = this.spec.automations.findIndex(a => a.id === id);
        if (index === -1) return;

        const removed = this.spec.automations.splice(index, 1)[0];
        this.dirty = true;
        this.cache = null;

        this.past.push({
            type: 'automation',
            data: { id, action: 'remove' },
            inverse: { id, action: 'add', automation: removed },
        });
        this.future = [];

        this.emit('automationRemoved', { automationId: id });
        this.emit('graphDirty');
    }

    addNode(def: NodeDef): void {
        if (this.registry.has(def.id)) {
            throw new Error(`Node ${def.id} already exists`);
        }

        this.spec.nodes.push(def);

        const exportBus = this.context.createGain();
        exportBus.gain.value = 1;

        let instance: any;
        if (def.type === 'Player') {
            instance = new Tone.Player();
        } else if (def.type === 'Filter') {
            instance = new Tone.Filter();
        } else if (def.type === 'Reverb') {
            instance = new Tone.Reverb();
        } else if (def.type === 'Gain') {
            instance = new Tone.Gain();
        }

        this.registry.set(def.id, {
            def,
            instance,
            exportBus,
            assetLoaded: true,
        });

        this.dirty = true;
        this.cache = null;

        this.past.push({
            type: 'node',
            data: { id: def.id, action: 'add', def },
            inverse: { id: def.id, action: 'remove' },
        });
        this.future = [];

        this.emit('nodeAdded', { nodeId: def.id });
        this.emit('graphDirty');
    }

    removeNode(id: string): void {
        const node = this.registry.get(id);
        if (!node) return;

        node.instance.disconnect();
        node.instance.dispose();
        this.registry.delete(id);

        const index = this.spec.nodes.findIndex(n => n.id === id);
        if (index !== -1) {
            this.spec.nodes.splice(index, 1);
        }

        this.spec.connections = this.spec.connections.filter(
            c => c.from.id !== id && c.to.id !== id
        );

        this.dirty = true;
        this.cache = null;

        this.past.push({
            type: 'node',
            data: { id, action: 'remove' },
            inverse: { id, action: 'add', def: node.def },
        });
        this.future = [];

        this.emit('nodeRemoved', { nodeId: id });
        this.emit('graphDirty');
    }

    connect(fromId: string, toId: string): void {
        const fromNode = this.registry.get(fromId);
        const toNode = this.registry.get(toId);

        if (!fromNode || !toNode) {
            throw new Error(`Cannot connect: node not found`);
        }

        fromNode.instance.connect(toNode.instance);

        this.spec.connections.push({
            from: { id: fromId },
            to: { id: toId },
        });

        this.dirty = true;
        this.cache = null;
        this.emit('graphDirty');
    }

    disconnect(fromId: string, toId: string): void {
        const fromNode = this.registry.get(fromId);
        const toNode = this.registry.get(toId);

        if (!fromNode || !toNode) return;

        try {
            fromNode.instance.disconnect(toNode.instance);
        } catch (err) {
            if (DEBUG_AUDIO) console.warn('Disconnect error:', err);
        }

        this.spec.connections = this.spec.connections.filter(
            c => !(c.from.id === fromId && c.to.id === toId)
        );

        this.dirty = true;
        this.cache = null;
        this.emit('graphDirty');
    }

    async commit(opts: CommitOptions = {}): Promise<RenderResult> {
        const spec = this.serialize();
        const specHash = await hashString(JSON.stringify(spec));

        if (this.cache && this.cache.specHash === specHash) {
            if (DEBUG_AUDIO) console.log('[lib/audio.ts] Using cached render');
            return this.cache.result;
        }

        this.emit('renderStart', { specHash });

        const preloadedBuffers = new Map<string, AudioBuffer>();
        const assetDurations = new Map<string, number>();
        for (const asset of spec.assets) {
            try {
                const response = await fetch(asset.src);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.context.decodeAudioData(arrayBuffer.slice(0));
                preloadedBuffers.set(asset.id, audioBuffer);
                assetDurations.set(asset.id, audioBuffer.duration);
                if (DEBUG_AUDIO) {
                    console.log(`Pre-loaded asset ${asset.id} (${audioBuffer.duration}s, ${audioBuffer.numberOfChannels}ch)`);
                }
            } catch (err) {
                console.error(`Failed to pre-load asset ${asset.id}:`, err);
            }
        }

        const duration = estimateDuration(spec, opts, assetDurations);

        if (DEBUG_AUDIO) {
            console.log(`[lib/audio.ts] Starting offline render (${duration}s)...`);
        }

        const startTime = Date.now();

        // I crashed when I tried to sample at 192kHz, so I'm capping it at 48kHz for safety.
        const contextRate = this.context.sampleRate;
        const sampleRate = Math.min(contextRate, 48000);

        if (DEBUG_AUDIO) {
            console.log(`Offline render: ${duration}s at ${sampleRate}Hz (context: ${contextRate}Hz)`);
            const estimatedMB = (duration * sampleRate * 2 * 4) / (1024 * 1024);
            console.log(`Estimated buffer size: ${estimatedMB.toFixed(1)}MB`);
        }

        // prevent memory crashes
        const estimatedSamples = duration * sampleRate * 2; // stereo
        const maxSamples = 100 * 1024 * 1024; // 100 million samples (~400MB max)
        if (estimatedSamples > maxSamples) {
            const maxDuration = maxSamples / (sampleRate * 2);
            throw new Error(
                `Render duration too long: ${duration.toFixed(1)}s would use ~${(estimatedSamples * 4 / (1024 * 1024)).toFixed(0)}MB. ` +
                `Maximum duration at ${sampleRate}Hz is ${maxDuration.toFixed(1)}s. ` +
                `Use durationOverride or reduce sample rate.`
            );
        }

        const buffer = await Tone.Offline(async (offlineContext) => {
            const registry = await buildRuntimeGraphWithBuffers(spec, offlineContext.rawContext, preloadedBuffers);
            scheduleAutomations(registry, spec, offlineContext.rawContext);

            for (const [_, node] of registry.entries()) {
                if (node.def.type === 'Player' && node.instance.start) {
                    const buffer = node.instance.buffer;
                    const hasValidBuffer = buffer && buffer.length > 0 && buffer.duration > 0;

                    if (hasValidBuffer) {
                        node.instance.start(0);
                        if (DEBUG_AUDIO) {
                            console.log(`Started player ${node.def.id} in offline context (buffer duration: ${buffer.duration}s, samples: ${buffer.length})`);
                        }
                    } else {
                        console.error(`Player ${node.def.id} buffer invalid - length=${buffer?.length}, duration=${buffer?.duration}`);
                    }
                }
            }

            const destination = offlineContext.rawContext.createGain();
            destination.gain.value = spec.mix.masterGain;
            destination.connect(offlineContext.rawContext.destination);

            for (const [id, node] of registry.entries()) {
                const hasOutgoing = spec.connections.some(c => c.from.id === id);
                if (!hasOutgoing) {
                    node.exportBus.connect(destination);
                    if (DEBUG_AUDIO) {
                        console.log(`Connected leaf node ${id} to destination`);
                    }
                }
            }
        }, duration, 2, sampleRate);

        const { blob, url, audioHash } = await encodeWav(buffer.get() as AudioBuffer, opts);

        const result: RenderResult = {
            buffer: buffer.get() as AudioBuffer,
            blob,
            url,
            specHash,
            audioHash,
            duration: buffer.get()!.duration,
            sampleRate: buffer.get()!.sampleRate,
        };

        this.cache = { specHash, result };

        const elapsed = Date.now() - startTime;

        this.emit('renderDone', { specHash, audioHash, durationMs: elapsed });

        if (DEBUG_AUDIO) {
            console.log(`[lib/audio.ts] Render complete (${elapsed}ms)`);
        }

        return result;
    }

    bindSpatial(
        nodeId: string,
        object3D: THREE.Object3D,
        listener: THREE.AudioListener,
        opts: SpatialOptions = {}
    ): () => void {
        const node = this.registry.get(nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found`);
        }

        if (!listener || !listener.context) {
            throw new Error('Invalid AudioListener: missing context');
        }

        if (!object3D) {
            throw new Error('Invalid Object3D provided');
        }

        const mode = opts.mode || 'live';
        const positional = new THREE.PositionalAudio(listener);

        if (opts.refDistance !== undefined) {
            positional.setRefDistance(opts.refDistance);
        }
        if (opts.rolloffFactor !== undefined) {
            positional.setRolloffFactor(opts.rolloffFactor);
        }
        if (opts.distanceModel !== undefined) {
            positional.setDistanceModel(opts.distanceModel);
        }

        let mediaStreamSource: MediaStreamAudioSourceNode | null = null;

        if (mode === 'live') {
            const toneContext = Tone.getContext().rawContext;
            const threeContext = listener.context;
            
            if (DEBUG_AUDIO) {
                console.log(`[bindSpatial] Context validation:`, {
                    toneContext: toneContext,
                    threeContext: threeContext,
                    contextsMatch: toneContext === threeContext
                });
            }
            
            if (toneContext === threeContext) {
                try {
                    positional.setNodeSource(node.exportBus as any);
                    
                    if (DEBUG_AUDIO) {
                        console.log(`[lib/audio.ts/bindSpatial] Live mode: ${nodeId} connected directly (same context)`);
                    }
                } catch (err) {
                    console.error(`[lib/audio.ts/bindSpatial] Failed to connect directly for ${nodeId}:`, err);
                    throw new Error(`Failed to create spatial audio: ${err instanceof Error ? err.message : 'Unknown error'}`);
                }
            } else {
                if (DEBUG_AUDIO) {
                    console.log(`[lib/audio.ts/bindSpatial] Context mismatch detected. Using MediaStream bridge to connect Tone.js (${toneContext.sampleRate}Hz) to THREE.js (${threeContext.sampleRate}Hz).`);
                }
                
                try {
                    if (!toneContext || !threeContext) {
                        throw new Error('[lib/audio.ts/bindSpatial] AudioContext not available for MediaStream bridge');
                    }

                    if (toneContext instanceof OfflineAudioContext || threeContext instanceof OfflineAudioContext) {
                        throw new Error('[lib/audio.ts/bindSpatial] MediaStream bridge requires AudioContext, not OfflineAudioContext');
                    }

                    const destination = (toneContext as AudioContext).createMediaStreamDestination();
                    if (!destination || !destination.stream) {
                        throw new Error('[lib/audio.ts/bindSpatial] Failed to create MediaStreamDestination');
                    }

                    node.exportBus.connect(destination as unknown as AudioNode);
                    
                    if (DEBUG_AUDIO) {
                        console.log(`[lib/audio.ts/bindSpatial] MediaStream setup:`, {
                            exportBus: node.exportBus,
                            destination: destination,
                            stream: destination.stream,
                            streamActive: destination.stream.active,
                            streamTracks: destination.stream.getAudioTracks().length
                        });
                    }

                    mediaStreamSource = (threeContext as AudioContext).createMediaStreamSource(destination.stream);
                    if (!mediaStreamSource) {
                        throw new Error('[lib/audio.ts/bindSpatial] Failed to create MediaStreamSource');
                    }

                    positional.setNodeSource(mediaStreamSource as any);

                    if (DEBUG_AUDIO) {
                        console.log(`[lib/audio.ts/bindSpatial] Live mode: ${nodeId} connected via MediaStream bridge`, {
                            mediaStreamSource: mediaStreamSource,
                            positionalAudio: positional,
                            positionalContext: positional.context
                        });
                    }
                } catch (err) {
                    console.error(`[lib/audio.ts/bindSpatial] Failed to create MediaStream bridge for ${nodeId}:`, err);
                    throw new Error(`Failed to create spatial audio bridge: ${err instanceof Error ? err.message : 'Unknown error'}`);
                }
            }
        } else {
            if (DEBUG_AUDIO) {
                console.log(`[lib/audio.ts/bindSpatial] Committed mode: ${nodeId} awaiting buffer`);
            }
        }

        object3D.add(positional);

        const bindingInfo: SpatialBindingInfo = {
            nodeId,
            mode,
            audio: positional,
            object3D,
            mediaStreamSource: mediaStreamSource || undefined,
        };

        this.spatialBindings.set(nodeId, bindingInfo);

        const disposer = () => {
            if (mediaStreamSource) {
                try {
                    mediaStreamSource.disconnect();
                    node.exportBus.disconnect();
                } catch (err) {
                    if (DEBUG_AUDIO) console.warn(`[lib/audio.ts/bindSpatial] Error disconnecting MediaStream bridge:`, err);
                }
            }

            try {
                object3D.remove(positional);
                positional.disconnect();
            } catch (err) {
                if (DEBUG_AUDIO) console.warn(`[lib/audio.ts/bindSpatial] Error disposing PositionalAudio (harmless):`, err);
            }
            
            this.spatialBindings.delete(nodeId);

            if (DEBUG_AUDIO) {
                console.log(`[lib/audio.ts/bindSpatial] Disposed binding for ${nodeId}`);
            }
        };

        return disposer;
    }

    getSpatialBinding(nodeId: string): SpatialBindingInfo | undefined {
        return this.spatialBindings.get(nodeId);
    }

    getSpatialMode(nodeId: string): SpatialBindingMode | undefined {
        return this.spatialBindings.get(nodeId)?.mode;
    }

    freezeSpatialBinding(nodeId: string, result: RenderResult): void {
        const binding = this.spatialBindings.get(nodeId);
        if (!binding) {
            throw new Error(`No spatial binding found for node ${nodeId}`);
        }

        if (binding.mode === 'live') {
            binding.audio.disconnect();
        }

        binding.audio.setBuffer(result.buffer);
        binding.audio.setLoop(true);
        binding.audio.play();

        binding.mode = 'committed';
        binding.committedBuffer = result.buffer;

        if (DEBUG_AUDIO) {
            console.log(`[lib/audio.ts/freezeSpatialBinding] ${nodeId} switched to committed mode (${result.duration.toFixed(2)}s buffer)`);
        }

        this.emit('spatialModeChanged', { nodeId, mode: 'committed' });
    }

    unfreezeSpatialBinding(nodeId: string): void {
        const binding = this.spatialBindings.get(nodeId);
        if (!binding) {
            throw new Error(`No spatial binding found for node ${nodeId}`);
        }

        const node = this.registry.get(nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found`);
        }

        if (binding.audio.isPlaying) {
            binding.audio.stop();
        }
        binding.audio.disconnect();

        try {
            const toneContext = Tone.getContext().rawContext;
            const threeContext = binding.audio.context;

            // Validate contexts are AudioContext (not OfflineAudioContext)
            if (toneContext instanceof OfflineAudioContext || threeContext instanceof OfflineAudioContext) {
                throw new Error('MediaStream bridge requires AudioContext, not OfflineAudioContext');
            }

            // Create a MediaStreamDestination in Tone.js context
            const destination = (toneContext as AudioContext).createMediaStreamDestination();

            // Connect Tone.js export bus to MediaStreamDestination
            node.exportBus.connect(destination as unknown as AudioNode);

            // Create MediaStreamSource in THREE.js context from the stream
            const mediaStreamSource = (threeContext as AudioContext).createMediaStreamSource(destination.stream);

            // Connect to PositionalAudio using the correct method
            binding.audio.setNodeSource(mediaStreamSource as any);

            // Update binding info
            binding.mediaStreamSource = mediaStreamSource;
            binding.mode = 'live';
            binding.committedBuffer = undefined;

            if (DEBUG_AUDIO) {
                console.log(`[lib/audio.ts/unfreezeSpatialBinding] ${nodeId} switched back to live mode with MediaStream bridge`);
            }
        } catch (err) {
            console.error(`[lib/audio.ts/unfreezeSpatialBinding] Failed to recreate MediaStream bridge for ${nodeId}:`, err);
            throw err;
        }

        this.emit('spatialModeChanged', { nodeId, mode: 'live' });
    }

    setPreview(nodeId: string, enabled: boolean): void {
        const node = this.registry.get(nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found`);
        }

        const wasEnabled = this.previewNodes.has(nodeId);

        if (enabled && !wasEnabled) {
            node.instance.toDestination();
            this.previewNodes.add(nodeId);

            if (DEBUG_AUDIO) {
                console.log(`[lib/audio.ts/setPreview] Enabled preview for ${nodeId}`);
            }
        } else if (!enabled && wasEnabled) {
            try {
                node.instance.disconnect(Tone.getDestination());
            } catch (err) {
                if (DEBUG_AUDIO) console.warn(`[lib/audio.ts/setPreview] Disconnect warning:`, err);
            }
            this.previewNodes.delete(nodeId);

            if (DEBUG_AUDIO) {
                console.log(`[lib/audio.ts/setPreview] Disabled preview for ${nodeId}`);
            }
        }

        this.emit('previewChanged', { nodeId, enabled });
    }

    isPreviewEnabled(nodeId: string): boolean {
        return this.previewNodes.has(nodeId);
    }

    undo(): boolean {
        const record = this.past.pop();
        if (!record) return false;

        this.applyChange(record.inverse);
        this.future.push(record);

        return true;
    }

    redo(): boolean {
        const record = this.future.pop();
        if (!record) return false;

        this.applyChange(record.data);
        this.past.push(record);

        return true;
    }

    dispose(): void {
        for (const [_, binding] of this.spatialBindings) {
            binding.object3D.remove(binding.audio);
            binding.audio.disconnect();
        }
        this.spatialBindings.clear();

        for (const nodeId of this.previewNodes) {
            const node = this.registry.get(nodeId);
            if (node) {
                try {
                    node.instance.disconnect(Tone.getDestination());
                } catch (err) {
                    if (DEBUG_AUDIO) console.warn(`[lib/audio.ts/dispose] Disconnect warning:`, err);
                }
            }
        }
        this.previewNodes.clear();

        for (const [_, node] of this.registry.entries()) {
            node.instance.disconnect();
            node.instance.dispose();
        }
        this.registry.clear();

        if (this.cache?.result.url) {
            URL.revokeObjectURL(this.cache.result.url);
        }

        this.eventHandlers.clear();
    }

    on(event: AudioSessionEvent, handler: (...args: any[]) => void): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)!.add(handler);
    }

    off(event: AudioSessionEvent, handler: (...args: any[]) => void): void {
        this.eventHandlers.get(event)?.delete(handler);
    }

    private emit(event: AudioSessionEvent, data?: any): void {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            for (const handler of handlers) {
                try {
                    handler(data);
                } catch (err) {
                    console.error(`Error in ${event} handler:`, err);
                }
            }
        }
    }

    private createNodeHandle(id: string, node: RuntimeNode): NodeHandle {
        const self = this;

        return new Proxy({} as NodeHandle, {
            get(_, prop: string) {
                if (prop === 'id') return id;
                if (prop === 'type') return node.def.type;
                if (prop === 'raw') {
                    return () => node.instance;
                }
                if (prop === 'exportBus') {
                    return node.exportBus;
                }
                if (prop === 'set') {
                    return (params: Record<string, any>, opts?: { record?: boolean }) => {
                        for (const [param, value] of Object.entries(params)) {
                            self.updateParam(id, param, value, opts);
                        }
                    };
                }

                const value = node.instance[prop];
                if (typeof value === 'function') {
                    if (prop === 'rampTo') {
                        return (target: number, seconds: number) => {
                            const currentValue = node.instance.value !== undefined ? node.instance.value : 0;
                            const autoId = self.automate(id, 'value', {
                                curve: {
                                    mode: 'linearRamp',
                                    points: [
                                        { t: 0, v: currentValue },
                                        { t: seconds, v: target },
                                    ],
                                },
                                startTime: 0,
                                endTime: seconds,
                            });

                            if (node.instance.value !== undefined) {
                                node.instance.linearRampTo(target, seconds);
                            }

                            return autoId;
                        };
                    }
                    return value.bind(node.instance);
                }
                return value;
            },
            set(_, prop: string, newVal: any) {
                try {
                    self.updateParam(id, prop, newVal);
                    return true;
                } catch (err) {
                    if (DEBUG_AUDIO) console.warn(`Failed to set ${prop}:`, err);
                    return false;
                }
            },
        });
    }

    private applyChange(change: any): void {
        if (change.type === 'param') {
            this.updateParam(change.nodeId, change.param, change.value, { record: false });
        } else if (change.type === 'automation') {
            if (change.action === 'add') {
                this.spec.automations.push(change.automation);
                this.dirty = true;
            } else if (change.action === 'remove') {
                const index = this.spec.automations.findIndex(a => a.id === change.id);
                if (index !== -1) {
                    this.spec.automations.splice(index, 1);
                    this.dirty = true;
                }
            }
        } else if (change.type === 'node') {
            if (change.action === 'add') {
                this.addNode(change.def);
            } else if (change.action === 'remove') {
                this.removeNode(change.id);
            }
        }
    }
}

/**
 * createSharedAudioContext creates a shared AudioContext for Tone.js and Three.js
 * @param opts - context creation options
 * @returns the shared AudioContext
 */
export function createSharedAudioContext(opts: { sampleRate?: number; latencyHint?: AudioContextLatencyCategory } = {}): AudioContext {
    const context = new AudioContext({
        sampleRate: opts.sampleRate,
        latencyHint: opts.latencyHint || 'interactive'
    });
    
    if (DEBUG_AUDIO) {
        console.log(`[createSharedAudioContext] Created shared context: ${context.sampleRate}Hz`);
    }
    
    return context;
}

/**
 * createAudioSession create an audio session
 * @param spec - the spec to create the audio session from
 * @param opts - the session options
 * @returns the audio session
 */
export async function createAudioSession(spec?: GraphSpec, opts: SessionOptions = {}): Promise<AudioSession> {
    if (opts.context) {
        Tone.setContext(new Tone.Context({ context: opts.context }));
    } else {
        await Tone.start();
    }

    const ctx = Tone.getContext().rawContext;

    const normalized = spec ? canonicalize(spec) : createEmptySpec();
    validateSpec(normalized);

    const registry = await buildRuntimeGraph(normalized, ctx);

    if (DEBUG_AUDIO) {
        console.log(`[lib/audio.ts/createAudioSession] Created session with context: ${ctx.sampleRate}Hz`);
    }

    return new AudioSessionImpl(normalized, registry, ctx);
}
