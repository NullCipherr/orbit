import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent, RefObject } from 'react';
import {
  CAMERA_PITCH_LIMIT,
  CAMERA_SENSITIVITY,
  DEFAULT_CAMERA,
  DEFAULT_ENGINE_PARAMS,
  INTERACTION_QUALITY,
} from '../constants/orbitEngine.constants';
import type { EngineCamera, EngineParams, OrbitViewportBindings } from '../types/orbitEngine.types';

interface UseOrbitEngineControllerResult {
  containerRef: RefObject<HTMLDivElement | null>;
  params: EngineParams;
  updateParam: (key: keyof EngineParams, value: number) => void;
  viewportBindings: OrbitViewportBindings;
}

export function useOrbitEngineController(): UseOrbitEngineControllerResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const cameraRef = useRef<EngineCamera>(DEFAULT_CAMERA);

  const [params, setParams] = useState<EngineParams>(DEFAULT_ENGINE_PARAMS);
  const paramsRef = useRef<EngineParams>(DEFAULT_ENGINE_PARAMS);

  const postWorkerMessage = useCallback((type: string, payload?: unknown, transfer?: Transferable[]) => {
    if (!workerRef.current) return;

    const message = payload === undefined ? { type } : { type, payload };

    if (transfer && transfer.length > 0) {
      workerRef.current.postMessage(message, transfer);
      return;
    }

    workerRef.current.postMessage(message);
  }, []);

  const setRenderQuality = useCallback(
    (quality: number) => {
      postWorkerMessage('UPDATE_QUALITY', quality);
    },
    [postWorkerMessage],
  );

  const releaseInteractionQuality = useCallback(() => {
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    moveTimeoutRef.current = setTimeout(() => {
      setRenderQuality(INTERACTION_QUALITY.resting);
    }, INTERACTION_QUALITY.settleDelayMs);
  }, [setRenderQuality]);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      isDraggingRef.current = true;
      previousMouseRef.current = { x: event.clientX, y: event.clientY };
      setRenderQuality(INTERACTION_QUALITY.dragging);
      if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
    },
    [setRenderQuality],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = event.clientX - previousMouseRef.current.x;
      const deltaY = event.clientY - previousMouseRef.current.y;

      cameraRef.current.yaw -= deltaX * CAMERA_SENSITIVITY;
      cameraRef.current.pitch += deltaY * CAMERA_SENSITIVITY;
      cameraRef.current.pitch = Math.max(-CAMERA_PITCH_LIMIT, Math.min(CAMERA_PITCH_LIMIT, cameraRef.current.pitch));

      previousMouseRef.current = { x: event.clientX, y: event.clientY };
      postWorkerMessage('UPDATE_CAMERA', cameraRef.current);
      releaseInteractionQuality();
    },
    [postWorkerMessage, releaseInteractionQuality],
  );

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
    releaseInteractionQuality();
  }, [releaseInteractionQuality]);

  const viewportBindings = useMemo<OrbitViewportBindings>(
    () => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
    }),
    [handlePointerDown, handlePointerMove, handlePointerUp],
  );

  const updateParam = useCallback(
    (key: keyof EngineParams, value: number) => {
      setParams((previous) => {
        const next = { ...previous, [key]: value };
        paramsRef.current = next;
        postWorkerMessage('UPDATE_PARAMS', next);
        return next;
      });
    },
    [postWorkerMessage],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'absolute inset-0 block h-full w-full';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    containerRef.current.appendChild(canvas);

    const createDimensions = () => {
      if (!containerRef.current) return { width: canvas.width, height: canvas.height };
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      return {
        width: rect.width * dpr,
        height: rect.height * dpr,
      };
    };

    const initialDimensions = createDimensions();
    canvas.width = initialDimensions.width;
    canvas.height = initialDimensions.height;

    const worker = new Worker(new URL('../workers/orbitEngine.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    try {
      const offscreen = canvas.transferControlToOffscreen();
      postWorkerMessage(
        'INIT',
        {
          canvas: offscreen,
          width: initialDimensions.width,
          height: initialDimensions.height,
        },
        [offscreen],
      );
      postWorkerMessage('UPDATE_PARAMS', paramsRef.current);
      postWorkerMessage('UPDATE_CAMERA', cameraRef.current);
    } catch (error) {
      console.error('OffscreenCanvas not supported or already transferred.', error);
    }

    const handleResize = () => {
      const dimensions = createDimensions();
      postWorkerMessage('RESIZE', dimensions);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
        moveTimeoutRef.current = null;
      }

      postWorkerMessage('STOP');
      worker.terminate();
      workerRef.current = null;

      if (containerRef.current && canvas.parentNode === containerRef.current) {
        containerRef.current.removeChild(canvas);
      }
    };
  }, [postWorkerMessage]);

  return {
    containerRef,
    params,
    updateParam,
    viewportBindings,
  };
}
