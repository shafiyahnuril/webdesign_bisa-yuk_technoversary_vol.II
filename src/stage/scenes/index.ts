import type { Scene } from "../director";
import { createB1Scene } from "./b1";

export function createScenes(): Scene[] {
  return [createB1Scene()];
}
