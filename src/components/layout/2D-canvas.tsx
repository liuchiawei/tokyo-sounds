"use client";

import Image from "next/image";
import { useState, useRef, useCallback, useEffect } from "react";

export default function TwoDCanvas() {
  // カメラの位置状態を管理
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // ズームレベルの状態を管理
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // ズームレベルに基づく境界制限を計算する共通関数
  const calculateBoundaries = useCallback(() => {
    const scaledBoundary = 500 * zoomLevel;
    return {
      maxX: scaledBoundary,
      maxY: scaledBoundary,
      minX: -scaledBoundary,
      minY: -scaledBoundary,
    };
  }, [zoomLevel]);

  // 位置を境界内に制限する関数
  const constrainPosition = useCallback(
    (x: number, y: number) => {
      const { maxX, maxY, minX, minY } = calculateBoundaries();
      return {
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y)),
      };
    },
    [calculateBoundaries]
  );

  // マウスダウンイベントハンドラー
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - cameraPosition.x,
        y: e.clientY - cameraPosition.y,
      });
    },
    [cameraPosition]
  );

  // マウスムーブイベントハンドラー
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // 共通の境界制限関数を使用
      const constrainedPosition = constrainPosition(newX, newY);
      setCameraPosition(constrainedPosition);
    },
    [isDragging, dragStart, constrainPosition]
  );

  // マウスアップイベントハンドラー
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // タッチイベントハンドラー
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - cameraPosition.x,
        y: touch.clientY - cameraPosition.y,
      });
    },
    [cameraPosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault(); // スクロールを防ぐ

      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;

      // 共通の境界制限関数を使用
      const constrainedPosition = constrainPosition(newX, newY);
      setCameraPosition(constrainedPosition);
    },
    [isDragging, dragStart, constrainPosition]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ズームレベル変更時にカメラ位置を調整
  useEffect(() => {
    setCameraPosition((prevPosition) => {
      return constrainPosition(prevPosition.x, prevPosition.y);
    });
  }, [zoomLevel, constrainPosition]);

  // マウスホイールズームイベントハンドラー
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault(); // デフォルトのスクロール動作を防ぐ

    const zoomSensitivity = 0.001; // ズーム感度
    const zoomDelta = -e.deltaY * zoomSensitivity;

    // ズームレベルの制限を設定
    const minZoom = 0.5; // 最小50%
    const maxZoom = 2.5; // 最大250%

    setZoomLevel((prevZoom) => {
      const newZoom = prevZoom + zoomDelta;
      return Math.max(minZoom, Math.min(maxZoom, newZoom));
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-sky-500 overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // マウスが領域を出た時もドラッグを終了
      onWheel={handleWheel} // ホイールズームイベント
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="w-[1000px] h-[1000px] transition-transform duration-75 ease-out
        "
        style={{
          transform: `translate(${cameraPosition.x}px, ${cameraPosition.y}px) scale(${zoomLevel})`,
        }}
      >
        <Image
          src="/images/stage_background_1.png"
          alt="Tokyo Background"
          width={1000}
          height={1000}
          draggable={false} // 画像のドラッグを無効化
          className="pointer-events-none" // 画像への直接的なポインターイベントを無効化
        />
      </div>
    </div>
  );
}
