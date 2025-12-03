/**
 * Type declarations for 3d-tiles-renderer
 */

declare module "3d-tiles-renderer" {
  import * as THREE from "three";

  export class TilesRenderer extends THREE.EventDispatcher {
    constructor(url?: string);
    group: THREE.Group;
    errorTarget: number;
    maxDepth: number;

    setCamera(camera: THREE.Camera): void;
    setResolutionFromRenderer(camera: THREE.Camera, renderer: THREE.WebGLRenderer): void;
    registerPlugin(plugin: any): void;
    update(): void;
    dispose(): void;
    getAttributions(): any[];
  }
}

declare module "3d-tiles-renderer/r3f" {
  import { FC, ReactNode } from "react";

  export interface TilesRendererProps {
    url?: string;
    children?: ReactNode;
    onLoadTileSet?: (event: any) => void;
    onLoadModel?: (event: any) => void;
    onLoadError?: (event: any) => void;
    errorTarget?: number;
    maxDepth?: number;
  }

  export const TilesRenderer: FC<TilesRendererProps>;

  export interface TilesPluginProps {
    plugin: any;
    args?: any;
    [key: string]: any;
  }

  export const TilesPlugin: FC<TilesPluginProps>;

  export interface GlobeControlsProps {
    enableDamping?: boolean;
    dampingFactor?: number;
    enabled?: boolean;
  }

  export const GlobeControls: FC<GlobeControlsProps>;

  export interface EnvironmentControlsProps {
    enableDamping?: boolean;
    enabled?: boolean;
  }

  export const EnvironmentControls: FC<EnvironmentControlsProps>;

  export interface CameraControlsProps {
    enableDamping?: boolean;
    dampingFactor?: number;
  }

  export const CameraControls: FC<CameraControlsProps>;

  export interface TilesAttributionOverlayProps {
    style?: React.CSSProperties;
  }

  export const TilesAttributionOverlay: FC<TilesAttributionOverlayProps>;
}

declare module "3d-tiles-renderer/plugins" {
  export class GoogleCloudAuthPlugin {
    constructor(options?: {
      apiToken?: string;
      accessToken?: string;
      autoRefreshToken?: boolean;
      logoUrl?: string | null;
      useRecommendedSettings?: boolean;
      sessionOptions?: object | null;
    });
    apiToken: string;
  }

  export class TilesFadePlugin {
    constructor();
    fadeDuration: number;
    maximumFadeOutTiles: number;
    fadeRootTiles: boolean;
  }

  export class DebugTilesPlugin {
    constructor();
    displayBoxBounds: boolean;
    displaySphereBounds: boolean;
    displayRegionBounds: boolean;
    colorMode: number;
  }

  export class CesiumIonAuthPlugin {
    constructor(options?: {
      apiToken?: string;
      assetId?: string | number;
    });
  }

  export class GLTFExtensionsPlugin {
    constructor(options?: {
      dracoLoader?: any;
      ktx2Loader?: any;
      meshoptDecoder?: any;
    });
    registerLoader(name: string, loader: any): void;
    registerDecoder(name: string, decoder: any): void;
  }

  export class UpdateOnChangePlugin {
    constructor();
  }

  export class TilesCompressionPlugin {
    constructor();
  }
}

