import { useRef, useEffect, useCallback, useState } from "react";

/**
 * Touch gesture hook for the park map: pinch-to-zoom and drag-to-pan.
 * Returns { zoom, setZoom, panX, panY, resetView, containerRef }
 * Spread containerRef onto the scrollable map container.
 */
export function useTouchZoom(initialZoom = 1, minZoom = 0.8, maxZoom = 1.5) {
  const [zoom, setZoomState] = useState(initialZoom);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const containerRef = useRef(null);

  const pinchRef = useRef(null);
  const dragRef = useRef(null);
  const stateRef = useRef({ zoom, panX, panY });
  stateRef.current = { zoom, panX, panY };

  const setZoom = useCallback((z) => {
    setZoomState((prev) => {
      const next = typeof z === "function" ? z(prev) : z;
      return Math.max(minZoom, Math.min(maxZoom, Number(next.toFixed(2))));
    });
  }, [minZoom, maxZoom]);

  const resetView = useCallback(() => {
    setZoomState(initialZoom);
    setPanX(0);
    setPanY(0);
  }, [initialZoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getDist = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        pinchRef.current = { dist: getDist(e.touches), zoom: stateRef.current.zoom };
        dragRef.current = null;
      } else if (e.touches.length === 1 && stateRef.current.zoom > 1) {
        dragRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          panX: stateRef.current.panX,
          panY: stateRef.current.panY,
        };
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const dist = getDist(e.touches);
        const scale = dist / pinchRef.current.dist;
        setZoom(pinchRef.current.zoom * scale);
      } else if (e.touches.length === 1 && dragRef.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - dragRef.current.x;
        const dy = e.touches[0].clientY - dragRef.current.y;
        setPanX(dragRef.current.panX + dx);
        setPanY(dragRef.current.panY + dy);
      }
    };

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) pinchRef.current = null;
      if (e.touches.length === 0) dragRef.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [setZoom]);

  return { zoom, setZoom, panX, panY, resetView, containerRef };
}