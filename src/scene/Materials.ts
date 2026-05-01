import { Color3, Scene, StandardMaterial } from "../core/Babylon";

export interface GameMaterials {
  paper: StandardMaterial;
  paperDamaged: StandardMaterial;
  foldling: StandardMaterial;
  dart: StandardMaterial;
  glider: StandardMaterial;
  boss: StandardMaterial;
  paperDot: StandardMaterial;
  pencilYellow: StandardMaterial;
  graphite: StandardMaterial;
  enemyInk: StandardMaterial;
  desk: StandardMaterial;
  cardboard: StandardMaterial;
  bookBlue: StandardMaterial;
  bookRed: StandardMaterial;
  bookGreen: StandardMaterial;
  ruler: StandardMaterial;
  eraser: StandardMaterial;
  mug: StandardMaterial;
  metal: StandardMaterial;
  pickupHealth: StandardMaterial;
  pickupBoost: StandardMaterial;
  pickupMissile: StandardMaterial;
  pickupScore: StandardMaterial;
  trail: StandardMaterial;
  stuccoBeige: StandardMaterial;
  roofTerraCotta: StandardMaterial;
  campusGrass: StandardMaterial;
  mallAsphalt: StandardMaterial;
  towerWhite: StandardMaterial;
}

function createMaterial(scene: Scene, name: string, color: string, emissive = 0): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(color);
  material.specularColor = new Color3(0.08, 0.07, 0.05);
  if (emissive > 0) {
    material.emissiveColor = Color3.FromHexString(color).scale(emissive);
  }
  return material;
}

export function createGameMaterials(scene: Scene): GameMaterials {
  return {
    paper: createMaterial(scene, "mat.paper", "#fff7df"),
    paperDamaged: createMaterial(scene, "mat.paper.damaged", "#e9c5ab"),
    foldling: createMaterial(scene, "mat.enemy.foldling", "#d66b58"),
    dart: createMaterial(scene, "mat.enemy.dart", "#bc4f7d"),
    glider: createMaterial(scene, "mat.enemy.glider", "#8c5ab7"),
    boss: createMaterial(scene, "mat.enemy.boss", "#6e3f9e", 0.15),
    paperDot: createMaterial(scene, "mat.paperDot", "#ffffff", 0.5),
    pencilYellow: createMaterial(scene, "mat.pencil", "#e6b43a"),
    graphite: createMaterial(scene, "mat.graphite", "#2a2926"),
    enemyInk: createMaterial(scene, "mat.enemyInk", "#d9503f", 0.45),
    desk: createMaterial(scene, "mat.desk", "#b98753"),
    cardboard: createMaterial(scene, "mat.cardboard", "#b9824f"),
    bookBlue: createMaterial(scene, "mat.book.blue", "#477b9f"),
    bookRed: createMaterial(scene, "mat.book.red", "#9b4d4a"),
    bookGreen: createMaterial(scene, "mat.book.green", "#4d8967"),
    ruler: createMaterial(scene, "mat.ruler", "#e1c96c"),
    eraser: createMaterial(scene, "mat.eraser", "#e7a6b3"),
    mug: createMaterial(scene, "mat.mug", "#f0efe7"),
    metal: createMaterial(scene, "mat.metal", "#a4a6a0"),
    pickupHealth: createMaterial(scene, "mat.pickup.health", "#57c785", 0.35),
    pickupBoost: createMaterial(scene, "mat.pickup.boost", "#58a6d6", 0.35),
    pickupMissile: createMaterial(scene, "mat.pickup.missile", "#e0b84a", 0.35),
    pickupScore: createMaterial(scene, "mat.pickup.score", "#f1d74f", 0.4),
    trail: createMaterial(scene, "mat.trail", "#ffffff", 0.3),
    stuccoBeige: createMaterial(scene, "mat.stucco", "#F5F5DC"),
    roofTerraCotta: createMaterial(scene, "mat.roof", "#E2725B"),
    campusGrass: createMaterial(scene, "mat.grass", "#4F7942"),
    mallAsphalt: createMaterial(scene, "mat.asphalt", "#4B4B4B"),
    towerWhite: createMaterial(scene, "mat.tower", "#F8F8F8")
  };
}
