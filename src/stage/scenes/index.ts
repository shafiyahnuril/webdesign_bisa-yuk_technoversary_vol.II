import type { Scene } from "../director";
import { createB1Scene } from "./b1";
import { createB2Scene } from "./b2";
import { createB3Scene } from "./b3";
import { createB4Scene } from "./b4";
import { createB7Scene } from "./b7";

export function createScenes(): Scene[] {
  return [createB1Scene(), createB2Scene(), createB3Scene(), createB4Scene(), createB7Scene()];
}
