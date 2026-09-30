import type { CanvasAddonMountContext } from "../generated/mywallpaper-runtime";
import { drawing } from "./drawing";
import "./style.css";
function seeded(seed: number) {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export function mount(context: CanvasAddonMountContext) {
  let values = context.layer.settings.get();
  const view = drawing(
    context,
    "Quelques lucioles chaudes dans l’obscurité. Trajectoires douces et lumière intermittente.",
    (g, w, h, t) => {
      g.fillStyle = String(values.background ?? "#091713");
      g.fillRect(0, 0, w, h);
      const rng = seeded(6173),
        count = Number(values.density ?? 24),
        speed = Number(values.speed ?? 1),
        color = String(values.light ?? "#c6d895");
      for (let i = 0; i < count; i++) {
        const depth = 0.3 + rng() * 0.7,
          phase = rng() * 6.28,
          x = rng() * w + Math.sin(t * speed * 0.17 + phase) * w * 0.05,
          y = rng() * h + Math.cos(t * speed * 0.12 + phase) * h * 0.04,
          r = 1 + depth * 1.5,
          intensity =
            0.2 + 0.65 * Math.pow((Math.sin(t * 0.7 + phase) + 1) / 2, 2);
        g.globalAlpha = intensity;
        const glow = g.createRadialGradient(x, y, 0, x, y, r * 7);
        glow.addColorStop(0, color + "88");
        glow.addColorStop(1, color + "00");
        g.fillStyle = glow;
        g.fillRect(x - r * 7, y - r * 7, r * 14, r * 14);
        g.fillStyle = color;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
      }
    },
  );
  const update = (next: typeof values) => {
    values = next;
    view.invalidate(next.motion !== false);
  };
  update(values);
  const stop = context.layer.settings.subscribe(update);
  return () => {
    stop();
    view.dispose();
  };
}
