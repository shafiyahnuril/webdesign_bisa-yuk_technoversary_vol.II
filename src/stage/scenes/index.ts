import type { Scene } from "../director";
import { createB1Scene } from "./b1";
import { createB2Scene } from "./b2";
import { createB3Scene } from "./b3";
import { createB4Scene } from "./b4";
import { createB5Scene } from "./b5";
import { createB6Scene } from "./b6";
import { createPunchScene } from "./punch";
import { createB7Scene } from "./b7";
import { createB8Scene } from "./b8";
import { createB9Scene } from "./b9";
import { createB10Scene } from "./b10";

export function createScenes(): Scene[] {
  return [
    createB1Scene(),
    createB2Scene(),
    createB3Scene(),
    createB4Scene(),
    createB5Scene(),
    createB6Scene(),
    createPunchScene(),
    createB7Scene(),
    createB8Scene(),
    createB9Scene(),
    createB10Scene(),
  ];
}
