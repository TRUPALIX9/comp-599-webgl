export const GameConfig = {
  world: {
    boundsX: 54,
    minY: 6,
    maxY: 58,
    startZ: 0,
    finishZ: 720,
    obstacleDamage: 14,
    enemyCrashDamage: 26
  },
  player: {
    maxHealth: 100,
    spawn: { x: 0, y: 22, z: 0 },
    cruiseSpeed: 24,
    minSpeed: 13,
    maxSpeed: 38,
    acceleration: 18,
    deceleration: 24,
    turnRateLowSpeed: 72,
    turnRateHighSpeed: 46,
    pitchRate: 54,
    pitchClampDeg: 34,
    rollVisualMaxDeg: 34,
    boostSpeed: 52,
    boostDrainPerSecond: 55,
    boostRegenPerSecond: 22,
    boostRegenDelay: 0.75,
    invulnerabilitySeconds: 0.8,
    collisionCooldownSeconds: 0.9,
    radius: 1.25
  },
  weapons: {
    paperDot: {
      damage: 8,
      speed: 78,
      radius: 0.42,
      fireInterval: 0.12,
      lifeSeconds: 1.8,
      heatPerShot: 6,
      heatCooldownPerSecond: 36,
      maxHeat: 100,
      spreadRadians: 0.018
    },
    missile: {
      damage: 65,
      splashDamage: 35,
      splashRadius: 5.2,
      speed: 48,
      turnRate: 5.6,
      radius: 0.75,
      cooldown: 3.4,
      ammo: 5,
      lifeSeconds: 5.2,
      lockRange: 72
    },
    enemyInk: {
      damage: 7,
      speed: 34,
      radius: 0.55,
      lifeSeconds: 3.4
    }
  },
  enemies: {
    foldling: {
      health: 26,
      speed: 16,
      damage: 12,
      fireInterval: 2.7,
      score: 100,
      radius: 1.45
    },
    dart: {
      health: 34,
      speed: 27,
      damage: 16,
      fireInterval: 2.05,
      score: 160,
      radius: 1.25
    },
    glider: {
      health: 82,
      speed: 13,
      damage: 22,
      fireInterval: 1.65,
      score: 320,
      radius: 2.0
    },
    boss: {
      health: 430,
      speed: 12,
      damage: 24,
      fireInterval: 0.85,
      score: 1200,
      radius: 3.2
    }
  },
  pickups: {
    collectRadius: 2.0,
    magnetRadius: 7,
    healthAmount: 25,
    boostAmount: 45,
    missileAmount: 2,
    scoreAmount: 250
  },
  camera: {
    distance: 12,
    boostDistance: 16,
    height: 4.6,
    lookAhead: 8,
    smoothing: 7.5,
    fovDeg: 68,
    boostFovDeg: 76
  },
  progression: {
    waveZ: [70, 170, 285, 410, 535, 650]
  },
  performance: {
    maxPlayerProjectiles: 80,
    maxEnemyProjectiles: 60,
    maxEffects: 90
  }
} as const;

export type GameConfigType = typeof GameConfig;
