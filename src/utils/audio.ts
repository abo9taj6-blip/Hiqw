/**
 * Elegant, client-side, zero-cost audio chime trigger using Web Audio API
 */
export const playSuccessSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Smooth upbeat notification: two-tone chime
    const now = ctx.currentTime;
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.3);
    
    // Tone 2 (staggered slightly to create a pleasant chime effect)
    setTimeout(() => {
      try {
        if (ctx.state === 'closed') return;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        const now2 = ctx.currentTime;
        osc2.frequency.setValueAtTime(659.25, now2); // E5
        osc2.frequency.setValueAtTime(1046.50, now2 + 0.1); // C6
        
        gain2.gain.setValueAtTime(0.1, now2);
        gain2.gain.exponentialRampToValueAtTime(0.01, now2 + 0.4);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.start(now2);
        osc2.stop(now2 + 0.4);
      } catch (e) {
        // Safe play failover
      }
    }, 85);
  } catch (e) {
    console.warn("Audio Context failed to initialize or play sound:", e);
  }
};
