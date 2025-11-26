'use client';

import { useState, useCallback, useRef } from 'react';
import type { UserController } from '../lib/user-controller';

interface VirtualControlsProps {
  userController: UserController | null;
}

interface ControlButton {
  code: string;
  label: string;
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  icon?: string;
}

// コントロールボタンの定義
const MOVEMENT_BUTTONS: ControlButton[] = [
  { code: 'KeyW', label: 'W', position: 'top' },
  { code: 'KeyA', label: 'A', position: 'left' },
  { code: 'KeyS', label: 'S', position: 'bottom' },
  { code: 'KeyD', label: 'D', position: 'right' },
];

const ROTATION_BUTTONS: ControlButton[] = [
  { code: 'ArrowUp', label: '↑', position: 'top' },
  { code: 'ArrowRight', label: '→', position: 'right' },
  { code: 'ArrowDown', label: '↓', position: 'bottom' },
  { code: 'ArrowLeft', label: '←', position: 'left' },
];

const VERTICAL_BUTTONS: ControlButton[] = [
  { code: 'Space', label: '↑', position: 'top' },
  { code: 'ShiftLeft', label: '↓', position: 'bottom' },
];

export function VirtualControls({ userController }: VirtualControlsProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(true);
  const activeTouchesRef = useRef<Map<number, string>>(new Map());

  // コントロールの表示/非表示を切り替え
  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  // キー押下をシミュレート
  const handlePress = useCallback(
    (code: string) => {
      if (!userController) return;
      userController.simulateKeyPress(code);
      setPressedKeys((prev) => new Set(prev).add(code));
    },
    [userController]
  );

  // キー解放をシミュレート
  const handleRelease = useCallback(
    (code: string) => {
      if (!userController) return;
      userController.simulateKeyRelease(code);
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    },
    [userController]
  );

  // マウスイベントハンドラー
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, code: string) => {
      e.preventDefault();
      handlePress(code);
    },
    [handlePress]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, code: string) => {
      e.preventDefault();
      handleRelease(code);
    },
    [handleRelease]
  );

  const handleMouseLeave = useCallback(
    (code: string) => {
      handleRelease(code);
    },
    [handleRelease]
  );

  // タッチイベントハンドラー
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLButtonElement>, code: string) => {
      e.preventDefault();
      const touch = e.targetTouches[0];
      if (touch) {
        activeTouchesRef.current.set(touch.identifier, code);
        handlePress(code);
      }
    },
    [handlePress]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      if (touch) {
        const code = activeTouchesRef.current.get(touch.identifier);
        if (code) {
          activeTouchesRef.current.delete(touch.identifier);
          handleRelease(code);
        }
      }
    },
    [handleRelease]
  );

  const handleTouchCancel = useCallback(
    (e: React.TouchEvent<HTMLButtonElement>) => {
      e.preventDefault();
      // すべてのアクティブなタッチを解放
      activeTouchesRef.current.forEach((code) => {
        handleRelease(code);
      });
      activeTouchesRef.current.clear();
    },
    [handleRelease]
  );

  // ボタンコンポーネント
  const ControlButton = ({
    button,
    className = '',
  }: {
    button: ControlButton;
    className?: string;
  }) => {
    const isPressed = pressedKeys.has(button.code);
    return (
      <button
        className={`
          ${className}
          min-w-[44px] min-h-[44px] 
          rounded-lg
          font-semibold text-white
          transition-all duration-200 ease-out
          select-none
          touch-none
          active:scale-90
          ${
            isPressed
              ? 'bg-gradient-to-br from-purple-500 to-pink-500 scale-95 opacity-90 shadow-lg shadow-purple-500/60 ring-2 ring-purple-400/50'
              : 'bg-black/60 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 hover:bg-black/80 hover:scale-105'
          }
        `}
        onMouseDown={(e) => handleMouseDown(e, button.code)}
        onMouseUp={(e) => handleMouseUp(e, button.code)}
        onMouseLeave={() => handleMouseLeave(button.code)}
        onTouchStart={(e) => handleTouchStart(e, button.code)}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation' }}
      >
        <span className="drop-shadow-lg">{button.label}</span>
      </button>
    );
  };

  // UserControllerが初期化されていない場合は非表示
  if (!userController) {
    return null;
  }

  return (
    <div className="absolute bottom-4 right-4 z-50 pointer-events-auto flex flex-col items-end">
      {/* トグルボタン */}
      <button
        onClick={toggleVisibility}
        className="mb-2 bg-black/70 backdrop-blur-md rounded-lg border border-purple-500/30 hover:border-purple-400/50 px-3 py-1.5 text-xs text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2"
        aria-label={isVisible ? 'Hide controls' : 'Show controls'}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isVisible ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        <span>{isVisible ? 'Hide' : 'Show'} Controls</span>
      </button>

      {/* コントロールパネル */}
      <div
        className={`
          bg-black/70 backdrop-blur-md rounded-2xl border border-purple-500/30 shadow-2xl p-4
          transition-all duration-300 ease-in-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none h-0 p-0 overflow-hidden'}
        `}
      >
        {/* 移動コントロール (D-pad) */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2 text-center font-semibold uppercase tracking-wide">
            Movement
          </div>
          <div className="relative w-32 h-32 mx-auto md:w-36 md:h-36">
            {/* 中央位置 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/40 border border-purple-500/20" />
            </div>
            {/* W (上) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2">
              <ControlButton button={MOVEMENT_BUTTONS[0]} />
            </div>
            {/* A (左) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <ControlButton button={MOVEMENT_BUTTONS[1]} />
            </div>
            {/* S (下) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <ControlButton button={MOVEMENT_BUTTONS[2]} />
            </div>
            {/* D (右) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <ControlButton button={MOVEMENT_BUTTONS[3]} />
            </div>
          </div>
        </div>

        {/* 回転コントロール */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2 text-center font-semibold uppercase tracking-wide">
            Rotation
          </div>
          <div className="relative w-28 h-28 mx-auto md:w-32 md:h-32">
            {/* 中央位置 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/40 border border-purple-500/20" />
            </div>
            {/* Arrow Up */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2">
              <ControlButton button={ROTATION_BUTTONS[0]} className="w-10 h-10 text-lg" />
            </div>
            {/* Arrow Right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <ControlButton button={ROTATION_BUTTONS[1]} className="w-10 h-10 text-lg" />
            </div>
            {/* Arrow Down */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <ControlButton button={ROTATION_BUTTONS[2]} className="w-10 h-10 text-lg" />
            </div>
            {/* Arrow Left */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <ControlButton button={ROTATION_BUTTONS[3]} className="w-10 h-10 text-lg" />
            </div>
          </div>
        </div>

        {/* 垂直移動コントロール */}
        <div>
          <div className="text-xs text-gray-400 mb-2 text-center font-semibold uppercase tracking-wide">
            Vertical
          </div>
          <div className="flex flex-col gap-2 items-center">
            <ControlButton button={VERTICAL_BUTTONS[0]} className="w-16 md:w-20" />
            <ControlButton button={VERTICAL_BUTTONS[1]} className="w-16 md:w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

