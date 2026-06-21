import './ui/styles.css';
import { Application } from 'pixi.js';
import { Game } from './game/Game';
import { preloadAssetPack } from './game/assetPack';
import { preloadSurvivor } from './game/survivorSprite';
import { preloadZombies } from './game/zombieSprite';
import { preloadEnv } from './game/environment';
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
import { CollectionScreen } from './ui/collection';
import { PetSelect } from './ui/petselect';
import { MetaShop } from './ui/shop';

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
  // HD zombie enemy sheets (falls back to the pixel zombie if absent).
  await preloadZombies();
  // Urban environment scenery + blood decals.
  await preloadEnv();

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

  // Lobby owns the pre-game UI; the pickers mount inside it and flow as sections.
  const title = new TitleScreen(root);
  const best = meta.getProfile().bestTimeSec;
  if (best > 0) title.setStats(`Best time ${formatTime(best)}`);

  const stageSelect = new StageSelect(title.mount, STAGES);
  const charSelect = new CharSelect(title.mount, Object.values(CHARACTERS));
  const petSelect = new PetSelect(title.mount, Object.values(PETS));
  const gearScreen = new GearScreen(root); // floating loadout button + full-screen modal
  const collectionScreen = new CollectionScreen(root); // floating arsenal/achievements button + modal
  const shop = new MetaShop(root); // floating power-ups button + modal (spends coins)

  new SettingsPanel(root, {
    onPause: () => app.ticker.stop(),
    onResume: () => app.ticker.start(),
  });

  let started = false;
  title.onPlay(() => {
    if (started) return;
    started = true;
    title.hide();
    gearScreen.setVisible(false);
    collectionScreen.setVisible(false);
    shop.setVisible(false);
    minimap.setVisible(true);
    // eslint-disable-next-line no-new
    new Game(app, hud, minimap, charSelect.selected, stageSelect.selected, petSelect.selected);
  });
  title.show();
  stageSelect.setVisible(true);
  charSelect.setVisible(true);
  petSelect.setVisible(true);
  gearScreen.setVisible(true);
  collectionScreen.setVisible(true);
  shop.setVisible(true);
}

void main();
