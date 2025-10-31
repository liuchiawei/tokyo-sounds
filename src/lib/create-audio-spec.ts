import { GraphSpec } from './audio';
import { AUDIO_MAP } from './audio-mapping';

/**
 * create audio graph spec
 * each building with audio gets: Player → Filter → Reverb → Gain
 * @returns audio graph spec
 */
export function createTokyoSoundsSpec(): GraphSpec {
  const assets: GraphSpec['assets'] = [];
  const nodes: GraphSpec['nodes'] = [];
  const connections: GraphSpec['connections'] = [];

  // generate unique audio urls
  const uniqueAudioUrls = new Set<string>();
  for (const [_, url] of Object.entries(AUDIO_MAP)) {
    if (url) {
      uniqueAudioUrls.add(url);
    }
  }

  // turn thm into assets
  const audioUrlToAssetId = new Map<string, string>();
  uniqueAudioUrls.forEach((url, index) => {
    const assetId = `asset_${index}`;
    audioUrlToAssetId.set(url, assetId);
    assets.push({
      id: assetId,
      kind: 'sample',
      src: url,
      loop: true,
    });
  });

  // create nodes for each building with audio
  for (const [objectName, audioUrl] of Object.entries(AUDIO_MAP)) {
    if (!audioUrl) continue;

    const assetId = audioUrlToAssetId.get(audioUrl);
    if (!assetId) continue;

    const baseId = objectName;

    // player node
    nodes.push({
      id: `player_${baseId}`,
      type: 'Player',
      assetId,
      params: { playbackRate: 1, loop: true, reverse: false },
    });

    // filter node
    nodes.push({
      id: `filter_${baseId}`,
      type: 'Filter',
      params: { frequency: 1000, Q: 1, type: 'lowpass' },
    });

    // reverb node
    nodes.push({
      id: `reverb_${baseId}`,
      type: 'Reverb',
      params: { decay: 2, wet: 0.3 },
    });

    // gain node (for spatial binding)
    nodes.push({
      id: `gain_${baseId}`,
      type: 'Gain',
      params: { gain: 0.8 },
    });

    // connections: player → filter → reverb → gain
    connections.push(
      { from: { id: `player_${baseId}` }, to: { id: `filter_${baseId}` } },
      { from: { id: `filter_${baseId}` }, to: { id: `reverb_${baseId}` } },
      { from: { id: `reverb_${baseId}` }, to: { id: `gain_${baseId}` } }
    );
  }

  return {
    version: '1.0.0',
    schema: 'graph@1',
    tempo: 120,
    seed: Date.now(),
    sampleRate: 44100,
    assets,
    nodes,
    connections,
    automations: [],
    buses: [],
    sends: [],
    mix: { masterGain: 0.9 },
    meta: {
      title: 'Tokyo Sounds',
      author: 'Tokyo Sounds App',
      tags: ['spatial', 'ambient', 'tokyo'],
      createdAt: new Date().toISOString(),
    },
  };
}

/**
 * get the node ids for a given object name
 * @param objectName - the name of the object
 * @returns the node ids
 */
export function getNodeIdsForObject(objectName: string) {
  return {
    player: `player_${objectName}`,
    filter: `filter_${objectName}`,
    reverb: `reverb_${objectName}`,
    gain: `gain_${objectName}`,
  };
}
