/**
 * Audio utility functions for decoding PCM audio data from Gemini API
 */

/**
 * Decodes a base64 string to a Uint8Array.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes PCM audio data from Uint8Array into an AudioBuffer.
 * The Gemini API returns audio as interleaved 16-bit PCM data.
 *
 * @param data The Uint8Array containing raw PCM audio data
 * @param ctx The AudioContext to create the buffer with
 * @param sampleRate The sample rate of the audio data (48000 for Gemini)
 * @param numChannels The number of audio channels (2 for stereo)
 * @returns A Promise that resolves with the decoded AudioBuffer
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // Create the audio buffer
  // Each sample is 16-bit (2 bytes), so total samples = data.length / 2
  const totalSamples = data.length / 2 / numChannels;

  const buffer = ctx.createBuffer(
    numChannels,
    totalSamples,
    sampleRate,
  );

  // Convert Uint8Array to Int16Array (16-bit PCM)
  const dataInt16 = new Int16Array(data.buffer);
  const l = dataInt16.length;

  // Convert Int16 to Float32 (normalized to -1.0 to 1.0)
  const dataFloat32 = new Float32Array(l);
  for (let i = 0; i < l; i++) {
    // Int16 ranges from -32768 to 32767
    // Normalize to Float32 range -1.0 to 1.0
    dataFloat32[i] = dataInt16[i] / 32768.0;
  }

  // De-interleave channels
  // For stereo: [L, R, L, R, L, R, ...] -> [L, L, L, ...] and [R, R, R, ...]
  if (numChannels === 1) {
    // Mono audio
    buffer.copyToChannel(dataFloat32, 0);
  } else {
    // Multi-channel (stereo) audio
    for (let channelIndex = 0; channelIndex < numChannels; channelIndex++) {
      // Extract samples for this channel
      const channelData = dataFloat32.filter(
        (_, index) => index % numChannels === channelIndex,
      );
      buffer.copyToChannel(channelData, channelIndex);
    }
  }

  return buffer;
}

/**
 * Throttle function to limit API calls
 */
export function throttle<T extends (...args: any[]) => Promise<void>>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => Promise<void> {
  let lastCall = 0;
  return async (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    if (timeSinceLastCall >= delay) {
      await func(...args);
      lastCall = now;
    }
  };
}
