import { useRef, useEffect, useCallback, useState } from "react";
import { calculateParkFitZoom, clampParkPan, zoomParkAtPoint } from "@/lib/parkCamera";

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
  // Start at readable scale. Only the explicit Fit button enables overview.
  const autoFitRef = useRef(false);
  const suppressGestureClickRef = useRef(false);
  const stateRef = useRef({ zoom, panX, panY });
  stateRef.current = { zoom, panX, panY };

  const setZoom = useCallback((z) => {
    autoFitRef.current = false;
    setZoomState((prev) => {
      const next = typeof z === "function" ? z(prev) : z;
      return Math.max(minZoom, Math.min(maxZoom, Number(next.toFixed(2))));
    });
  }, [minZoom, maxZoom]);

  const resetView = useCallback(() => {
    autoFitRef.current = false;
    setZoomState(initialZoom);
    setPanX(0);
    setPanY(0);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    }
  }, [initialZoom]);

  const fitToWidth = useCallback(() => {
    const viewport = containerRef.current;
    if (!viewport) return;
    const playfield = viewport.querySelector(".park-playfield");
    const contentWidth = playfield?.offsetWidth || 704;
    autoFitRef.current = true;
    setZoomState(calculateParkFitZoom(viewport.clientWidth, contentWidth, minZoom, maxZoom));
    setPanX(0);
    setPanY(0);
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
  }, [minZoom, maxZoom]);

  // Automatically show the whole eight-column park on a phone instead of
  // beginning with most attractions off-screen. Refit on orientation changes,
  // but never override a player's chosen camera magnification.
  useEffect(() => {
    const viewport = containerRef.current;
    if (!viewport) return;
    const fitNarrowScreen = () => {
      if (!autoFitRef.current) return;
      const width = viewport.querySelector('.park-playfield')?.offsetWidth || 704;
      const available = viewport.clientWidth;
      if (!available) return;
      const next = available < width
        ? calculateParkFitZoom(available, width, minZoom, maxZoom)
        : initialZoom;
      setZoomState((current) => current === next ? current : next);
    };
    fitNarrowScreen();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fitNarrowScreen) : null;
    observer?.observe(viewport);
    window.addEventListener('resize', fitNarrowScreen);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', fitNarrowScreen);
    };
  }, [initialZoom, minZoom, maxZoom]);


  useEffect(() => {
    const viewport = containerRef.current;
    if (!viewport) return;
    const focusTile = event => {
      const tile = event.target.closest('[data-park-tile]');
      const world = viewport.querySelector('.park-playfield');
      if (!tile || !world) return;
      autoFitRef.current = false;
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
      const col = Number(tile.dataset.parkTile) % 8;
      const row = Math.floor(Number(tile.dataset.parkTile) / 8);
      const rows = world.querySelectorAll('[data-park-tile]').length / 8;
      const z = stateRef.current.zoom;
      setPanX(clampParkPan(viewport.clientWidth / 2 - (col + .5) * world.offsetWidth / 8 * z, viewport.clientWidth, world.offsetWidth, z));
      setPanY(clampParkPan(viewport.clientHeight / 2 - (row + .5) * world.offsetHeight / rows * z, viewport.clientHeight, world.offsetHeight, z));
    };
    viewport.addEventListener('park-focus-tile', focusTile);
    return () => viewport.removeEventListener('park-focus-tile', focusTile);
  }, []);

  const onMapClickCapture = useCallback((event) => {
    if (!suppressGestureClickRef.current) return;
    suppressGestureClickRef.current = false;
    // A drag/pinch must not purchase a ride on the plot underneath the finger.
    event.preventDefault();
    event.stopPropagation();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getDist = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };
    const midpoint = touches => ({
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    });
    const bounds = () => {
      const playfield = el.querySelector(".park-playfield");
      return {
        width: el.clientWidth,
        height: el.clientHeight,
        contentWidth: playfield?.offsetWidth || 704,
        contentHeight: playfield?.offsetHeight || el.clientHeight,
      };
    };
    const relative = point => {
      const rect = el.getBoundingClientRect();
      return { x: point.x - rect.left - el.clientLeft, y: point.y - rect.top - el.clientTop };
    };
    const onTouchStart = e => {
      if (e.touches.length === 1) {
        suppressGestureClickRef.current = false;
        pinchRef.current = null;
        // Allow one-finger map exploration at ALL zoom levels, including the
        // default auto-fit level below 100% on narrow Android screens.
        dragRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          panX: stateRef.current.panX,
          panY: stateRef.current.panY,
          engaged: false,
        };
      } else if (e.touches.length >= 2) {
        suppressGestureClickRef.current = true;
        const center = relative(midpoint(e.touches));
        pinchRef.current = {
          dist: Math.max(1, getDist(e.touches)),
          zoom: stateRef.current.zoom,
          panX: stateRef.current.panX,
          panY: stateRef.current.panY,
          center,
        };
        dragRef.current = null;
      }
    };
    const onTouchMove = e => {
      if (e.touches.length >= 2 && pinchRef.current) {
        e.preventDefault();
        autoFitRef.current = false;
        suppressGestureClickRef.current = true;
        const dist = getDist(e.touches);
        const scale = dist / pinchRef.current.dist;
        const nextZoom = Math.max(minZoom, Math.min(maxZoom, pinchRef.current.zoom * scale));
        const currentCenter = relative(midpoint(e.touches));
        const nextCamera = zoomParkAtPoint({
          zoom: pinchRef.current.zoom,
          panX: pinchRef.current.panX + currentCenter.x - pinchRef.current.center.x,
          panY: pinchRef.current.panY + currentCenter.y - pinchRef.current.center.y,
        }, nextZoom, currentCenter, bounds());
        setZoomState(Number(nextCamera.zoom.toFixed(2)));
        setPanX(nextCamera.panX);
        setPanY(nextCamera.panY);
      } else if (e.touches.length === 1 && dragRef.current) {
        const dx = e.touches[0].clientX - dragRef.current.x;
        const dy = e.touches[0].clientY - dragRef.current.y;
        // A small finger wobble must not steal a tap on a ride or empty plot.
        if (!dragRef.current.engaged && Math.hypot(dx, dy) < 8) return;
        dragRef.current.engaged = true;
        suppressGestureClickRef.current = true;
        autoFitRef.current = false;
        e.preventDefault();
        const frame = bounds();
        setPanX(clampParkPan(dragRef.current.panX + dx, frame.width, frame.contentWidth, stateRef.current.zoom));
        setPanY(clampParkPan(dragRef.current.panY + dy, frame.height, frame.contentHeight, stateRef.current.zoom));
      }
    };
    const onTouchEnd = e => {
      if (e.touches.length < 2) pinchRef.current = null;
      if (e.touches.length === 0) dragRef.current = null;
      // After a pinch ends with one finger, don't reinterpret the second half
      // as a tile tap. The next independent touch starts normally.
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
  }, [maxZoom, minZoom]);

  return { zoom, setZoom, panX, panY, resetView, fitToWidth, containerRef, onMapClickCapture };
}