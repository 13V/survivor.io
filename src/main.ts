import './ui/styles.css';
import { Application } from 'pixi.js';
import { Game } from './game/Game';
import { Hud } from './ui/hud';

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

  const hud = new Hud(root);
  // eslint-disable-next-line no-new
  new Game(app, hud);
}

void main();
