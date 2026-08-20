/** Held-key + stick input. Screen-up is +Y on the stick (W). */

export class Input {
  readonly keys = new Set<string>();
  stickX = 0;
  stickY = 0;
  private forced: string[] | null = null;

  attach() {
    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.clear);
    document.addEventListener("visibilitychange", this.onVis);
  }

  detach() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.clear);
    document.removeEventListener("visibilitychange", this.onVis);
    this.keys.clear();
  }

  setStick(x: number, y: number) {
    this.stickX = x;
    this.stickY = y;
  }

  setKeys(codes: string[]) {
    this.forced = codes.length ? codes : null;
  }

  clearForced() {
    this.forced = null;
  }

  /** ix = right on screen, iy = up on screen, length <= 1 */
  axes(): { ix: number; iy: number } {
    const has = (c: string) => (this.forced ? this.forced.includes(c) : this.keys.has(c));
    let ix = this.stickX;
    let iy = this.stickY;
    if (has("KeyA") || has("ArrowLeft")) ix -= 1;
    if (has("KeyD") || has("ArrowRight")) ix += 1;
    if (has("KeyW") || has("ArrowUp")) iy += 1;
    if (has("KeyS") || has("ArrowDown")) iy -= 1;
    const len = Math.hypot(ix, iy);
    if (len < 0.18) return { ix: 0, iy: 0 };
    if (len > 1) return { ix: ix / len, iy: iy / len };
    return { ix, iy };
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    if (
      e.code === "ArrowUp" ||
      e.code === "ArrowDown" ||
      e.code === "ArrowLeft" ||
      e.code === "ArrowRight" ||
      e.code === "Space"
    ) {
      e.preventDefault();
    }
    this.keys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private clear = () => {
    this.keys.clear();
    this.stickX = 0;
    this.stickY = 0;
  };

  private onVis = () => {
    if (document.hidden) this.clear();
  };
}
