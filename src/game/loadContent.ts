// Eagerly import every content module so its top-level register*() runs.
// Kept separate from registry.ts so the registry is fully initialized before
// any content executes (avoids a circular-import ordering hazard).
import.meta.glob('./content/**/*.ts', { eager: true });
