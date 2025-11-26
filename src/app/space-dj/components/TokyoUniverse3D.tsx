"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SceneManager } from "../lib/scene-manager";
import { UserController } from "../lib/user-controller";
import { LocationMapper, type LayoutMode } from "../lib/location-mapper";
import { ProximityCalculator } from "../lib/proximity-calculator";
import { PositionTracker } from "../lib/position-tracker";
import type { TokyoPrompt } from "../lib/gemini-client";
import type { MappedLocation } from "../lib/location-mapper";
import { VirtualControls } from "./VirtualControls";

interface TokyoUniverse3DProps {
  onWeightsChange: (prompts: TokyoPrompt[]) => void | Promise<void>;
  isPlaying: boolean;
  layoutMode?: LayoutMode;
}

export function TokyoUniverse3D({
  onWeightsChange,
  isPlaying,
  layoutMode = "clustered",
}: TokyoUniverse3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const userControllerRef = useRef<UserController | null>(null);
  const proximityCalculatorRef = useRef<ProximityCalculator | null>(null);
  const positionTrackerRef = useRef<PositionTracker | null>(null);
  const locationsRef = useRef<MappedLocation[]>([]);
  const animationFrameRef = useRef<number>(0);

  // State for HUD
  const [fps, setFps] = useState(0);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [nearestLocation, setNearestLocation] = useState<string>("");
  const [distanceToNearest, setDistanceToNearest] = useState<number>(0);
  const [userPosition, setUserPosition] = useState({ x: 0, y: 0, z: 0 });
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("Never");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log("Initializing Tokyo Universe 3D...");

    // Initialize all systems
    const sceneManager = new SceneManager(containerRef.current);
    const userController = new UserController();
    const locationMapper = new LocationMapper(layoutMode);
    const proximityCalculator = new ProximityCalculator();
    const positionTracker = new PositionTracker(
      userController.position,
      10000, // 10 seconds
      5.0 // 5 units minimum movement
    );

    sceneManagerRef.current = sceneManager;
    userControllerRef.current = userController;
    proximityCalculatorRef.current = proximityCalculator;
    positionTrackerRef.current = positionTracker;

    // Map locations and add to scene
    const locations = locationMapper.getLocations();
    locationsRef.current = locations;
    sceneManager.addLocationSpheres(locations);

    console.log(`Added ${locations.length} locations to scene`);

    // Animation loop
    let lastTime = performance.now();
    let frames = 0;
    let fpsUpdateTime = performance.now();

    const animate = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;

      // Update user position
      userController.update(sceneManager.camera);

      // Update HUD position display
      setUserPosition({
        x: Math.round(userController.position.x * 10) / 10,
        y: Math.round(userController.position.y * 10) / 10,
        z: Math.round(userController.position.z * 10) / 10,
      });

      // Always update visual feedback (every few frames)
      if (frames % 6 === 0) {
        const result = proximityCalculator.calculate(
          userController.position,
          locations
        );

        // Update UI state
        setNearbyCount(result.highlightedLocations.size);
        setNearestLocation(result.nearestLocation?.name || "None");
        setDistanceToNearest(Math.round(result.distanceToNearest * 10) / 10);

        // Update visual highlights
        const weightMap = proximityCalculator.getWeightMap(
          userController.position,
          locations
        );
        sceneManager.updateLocationHighlights(
          result.highlightedLocations,
          weightMap
        );
      }

      // 實時更新使用者位置並檢查是否需要更新 API
      // 檢查位置變化（每 10 秒 + 最小移動距離）
      const positionChanged = positionTracker.checkPosition(
        userController.position
      );

      // 如果位置有顯著變化且正在播放，更新 Gemini API
      if (positionChanged && isPlaying) {
        const currentPos = userController.position;
        const distanceMoved = positionTracker.getDistanceMoved(currentPos);

        console.log("位置變化檢測:", {
          position: { x: currentPos.x, y: currentPos.y, z: currentPos.z },
          distanceMoved: distanceMoved.toFixed(2),
          timestamp: new Date().toISOString(),
        });

        setIsUpdating(true);
        setLastUpdateTime(new Date().toLocaleTimeString());

        try {
          // 計算基於距離的權重 prompts
          const result = proximityCalculator.calculate(currentPos, locations);

          console.log("計算的權重結果:", {
            promptsCount: result.prompts.length,
            nearbyLocations: result.highlightedLocations.size,
            nearestLocation: result.nearestLocation?.name,
            distanceToNearest: result.distanceToNearest.toFixed(2),
          });

          // 將座標轉換為權重 prompts 並傳遞給 Gemini
          if (result.prompts.length > 0) {
            // 確保權重總和合理（可選：正規化）
            const totalWeight = result.prompts.reduce(
              (sum, p) => sum + p.weight,
              0
            );

            if (totalWeight > 0) {
              console.log(
                `發送 ${result.prompts.length} 個 prompts 到 Gemini API`
              );
              // 非阻塞調用：讓回調函數自己處理 async 操作
              const updateResult = onWeightsChange(result.prompts);
              if (updateResult instanceof Promise) {
                updateResult.catch((error: unknown) => {
                  console.error("處理權重更新時發生錯誤:", error);
                });
              }
            } else {
              console.warn("警告: 所有 prompts 權重為 0，跳過更新");
            }
          } else {
            console.warn("警告: 沒有可用的 prompts，跳過更新");
          }
        } catch (error) {
          console.error("更新 prompts 時發生錯誤:", error);
          // 錯誤處理：保持 UI 狀態但記錄錯誤
        } finally {
          // 重置更新標誌
          setTimeout(() => setIsUpdating(false), 2000);
        }
      }

      // Render scene
      sceneManager.render();

      // FPS counter (update every second)
      frames++;
      if (currentTime - fpsUpdateTime >= 1000) {
        setFps(frames);
        frames = 0;
        fpsUpdateTime = currentTime;
      }

      lastTime = currentTime;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      console.log("Cleaning up Tokyo Universe 3D...");
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      sceneManager.dispose();
      userController.dispose();
      positionTracker.reset(userController.position);
    };
  }, [layoutMode, isPlaying, onWeightsChange]);

  // Reset camera position
  const handleReset = useCallback(() => {
    if (userControllerRef.current && positionTrackerRef.current) {
      userControllerRef.current.reset();
      positionTrackerRef.current.reset(userControllerRef.current.position);
      setLastUpdateTime("Reset");
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full bg-black rounded-lg overflow-hidden"
        style={{ minHeight: "600px" }}
      />

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 text-white space-y-2 pointer-events-none">
        {/* Stats Panel */}
        <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30">
          <div className="text-xs space-y-1 font-mono">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">FPS:</span>
              <span className="text-green-400">{fps}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Nearby:</span>
              <span className="text-purple-400">{nearbyCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Nearest:</span>
              <span className="text-blue-400 truncate max-w-[120px]">
                {nearestLocation}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Distance:</span>
              <span className="text-yellow-400">
                {distanceToNearest.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Audio Update Status */}
        <div
          className={`bg-black/70 backdrop-blur-sm p-3 rounded-lg border transition-colors ${
            isUpdating ? "border-yellow-500" : "border-purple-500/30"
          }`}
        >
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isUpdating ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                }`}
              />
              <span className="text-gray-400">Audio Status:</span>
              <span
                className={isUpdating ? "text-yellow-400" : "text-green-400"}
              >
                {isUpdating ? "Updating..." : "Stable"}
              </span>
            </div>
            <div className="text-gray-500 text-[10px]">
              Last update: {lastUpdateTime}
            </div>
            <div className="text-gray-500 text-[10px]">
              Updates every 10s when moving
            </div>
          </div>
        </div>

        {/* Position Panel */}
        <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30">
          <div className="text-xs font-mono">
            <div className="text-gray-400 mb-1">Position:</div>
            <div className="text-green-400">x: {userPosition.x.toFixed(1)}</div>
            <div className="text-blue-400">y: {userPosition.y.toFixed(1)}</div>
            <div className="text-red-400">z: {userPosition.z.toFixed(1)}</div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30">
          <div className="text-xs space-y-1">
            <div className="text-purple-300 font-semibold mb-2">Controls</div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-[10px]">
                WASD
              </kbd>
              <span className="text-gray-400">Move</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-[10px]">
                ← ↑ ↓ →
              </kbd>
              <span className="text-gray-400">Rotate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-[10px]">
                Space
              </kbd>
              <span className="text-gray-400">Up</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-[10px]">
                Shift
              </kbd>
              <span className="text-gray-400">Down</span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="pointer-events-auto bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors w-full"
        >
          Reset Camera
        </button>
      </div>

      {/* Status Indicator */}
      {!isPlaying && (
        <div className="absolute top-4 right-4 bg-yellow-500/20 border border-yellow-500 text-yellow-100 px-4 py-2 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span>Paused - Press Play to activate audio</span>
          </div>
        </div>
      )}

      {/* Instructions Overlay (dismissible) */}
      {nearbyCount === 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-purple-500/30 text-center">
          <p className="text-sm text-gray-300">
            Navigate to locations using{" "}
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">WASD</kbd>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Audio weights adjust automatically based on proximity
          </p>
        </div>
      )}

      {/* Virtual Controls Overlay */}
      <VirtualControls userController={userControllerRef.current} />
    </div>
  );
}
