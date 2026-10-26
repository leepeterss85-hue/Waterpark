// Legacy CommonJS wrapper supplied by canvas-confetti in some builds.
declare var module: any;
// Vite import.meta.env provided at runtime.
interface ImportMeta { readonly env: Record<string, string>; }
interface Window { webkitAudioContext?: typeof AudioContext; }
