import confetti from 'canvas-confetti';

/**
 * Standard celebratory confetti blast from center
 */
export function fireConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
      disableForReducedMotion: true,
    });
  } catch (e) {
    console.error('Confetti error:', e);
  }
}

/**
 * Spectacular Scholar Enrollment & Registration Celebration
 * Fires a multi-wave celebratory cannon from left and right corners
 * plus a central star explosion to make adding a scholar unforgettable!
 */
export function fireScholarCelebration() {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      disableForReducedMotion: true,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Wave 1: Dense fast bursts
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });

    fire(0.2, {
      spread: 60,
      colors: ['#6366f1', '#ec4899', '#14b8a6'],
    });

    // Wave 2: Wide decorative spread
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#3b82f6', '#10b981', '#fbbf24', '#a855f7'],
    });

    // Wave 3: Stars and big particles
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      shapes: ['star', 'circle'],
      colors: ['#fbbf24', '#f59e0b', '#10b981'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#2563eb', '#38bdf8', '#34d399'],
    });

    // Side cannons after 250ms for extra drama
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.75 },
        colors: ['#10b981', '#3b82f6', '#f59e0b'],
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.75 },
        colors: ['#6366f1', '#f59e0b', '#10b981'],
      });
    }, 250);
  } catch (e) {
    console.error('Scholar celebration confetti error:', e);
  }
}

/**
 * Achievement submission & approval celebration
 */
export function fireAchievementCelebration() {
  try {
    const end = Date.now() + 1000;
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (e) {
    console.error('Achievement confetti error:', e);
  }
}

/**
 * Gold & Emerald shimmer for Certificate downloads or issues
 */
export function fireCertificateCelebration() {
  try {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#d97706', '#10b981', '#059669', '#ffffff'],
      shapes: ['star', 'circle'],
      scalar: 1.1,
    });
  } catch (e) {
    console.error('Certificate confetti error:', e);
  }
}
