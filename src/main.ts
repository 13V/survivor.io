import './ui/styles.css';
import { Application } from 'pixi.js';
import { Game } from './game/Game';
import { Hud } from './ui/hud';
import { TitleScreen } from './ui/menu';
import { SettingsPanel } from './ui/settings';
import { Minimap } from './ui/minimap';
import { audio } from './audio/sfx';
import { meta, formatTime } from './meta/save';
import { registerSW, enableTapFullscreen } from './pwa';
import { CHARACTERS } from './game/data';
import { CharSelect } from './ui/charselect';

async function main(): Promise<void> {
  const app = new Application();
  await app.init({
    background: '#0e1016',
    antialias: true,
    resizeTo: window,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });

  const root = document.getElementById('app');
  if (!root) throw new Error('#app not found');
  root.appendChild(app.canvas);

  registerSW();
  enableTapFullscreen();

  // Unlock audio on the first user gesture (browsers block autoplay).
  const unlockAudio = (): void => {
    audio.unlock();
    audio.startMusic();
    window.removeEventListener('pointerdown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio);

  const hud = new Hud(root);
  const minimap = new Minimap(root);
  minimap.setVisible(false);
  const charSelect = new CharSelect(root, Object.values(CHARACTERS));

  new SettingsPanel(root, {
    onPause: () => app.ticker.stop(),
    onResume: () => app.ticker.start(),
  });

  // Title screen gates the run start.
  let started = false;
  const title = new TitleScreen(root);
  const best = meta.getProfile().bestTimeSec;
  if (best > 0) title.setStats(`Best time ${formatTime(best)}`);
  title.onPlay(() => {
    if (started) return;
    started = true;
    title.hide();
    charSelect.setVisible(false);
    minimap.setVisible(true);
    // eslint-disable-next-line no-new
    new Game(app, hud, minimap, charSelect.selected);
  });
  title.show();
  charSelect.setVisible(true);
}

void main();
