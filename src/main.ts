import "./styles.css";
import { GameApp } from "./core/GameApp";

const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
const uiRoot = document.querySelector<HTMLDivElement>("#ui-root");

if (!canvas || !uiRoot) {
  throw new Error("Paper Plane Assault requires #game-canvas and #ui-root.");
}

const app = new GameApp(canvas, uiRoot);
app.start();
