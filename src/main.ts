import './ui/styles.css';
import { Application } from 'pixi.js';
import { Game } from './game/Game';
import { preloadAssetPack } from './game/assetPack';
import { preloadSurvivor } from './game/survivorSprite';
import { Hud } from './ui/hud';
import { TitleScreen } from './ui/menu';
import { SettingsPanel } from './ui/settings';
import { Minimap } from './ui/minimap';
import { audio } from './audio/sfx';
import { meta, formatTime } from './meta/save';
import { registerSW, enableTapFullscreen } from './pwa';
import { CHARACTERS, STAGES, PETS } from './game/data';
import { CharSelect } from './ui/charselect';
import { StageSelect } from './ui/stageselect';
import { GearScreen } from './ui/gearscreen';
import { PetSelect } from './ui/petselect';

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

  // Load the CC0 art pack (Kenney top-down shooter) once before any run starts;
  // procedural art is the fallback if it fails.
  await preloadAssetPack();
  // 8-direction HD survivor player sheets (falls back to procedural hero if absent).
  await preloadSurvivor();

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
  const stageSelect = new StageSelect(root, STAGES);
  const gearScreen = new GearScreen(root);
  const petSelect = new PetSelect(root, Object.values(PETS));

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
    stageSelect.setVisible(false);
    gearScreen.setVisible(false);
    petSelect.setVisible(false);
    minimap.setVisible(true);
    // eslint-disable-next-line no-new
    new Game(app, hud, minimap, charSelect.selected, stageSelect.selected, petSelect.selected);
  });
  title.show();
  charSelect.setVisible(true);
  stageSelect.setVisible(true);
  gearScreen.setVisible(true);
  petSelect.setVisible(true);
}

void main();
