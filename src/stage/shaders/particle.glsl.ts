export const PARTICLE_VERTEX_SHADER = /* glsl */ `
attribute vec3 aSeed;
attribute vec4 aRand;
attribute float aSize;

uniform float uBreak;
uniform float uFlow;
uniform vec3 uAttract[3];
uniform float uSettle;
uniform float uTime;
uniform float uSizeScale;
uniform float uFade;

varying float vAlpha;

const float TWO_PI = 6.28318530718;

void main() {
  // 1. Keluar dari permukaan botol + drift curl-like deterministik (tanpa integrasi Euler)
  vec3 outDir = vec3(aSeed.x, (aSeed.y - 1.0) * 0.35, aSeed.z);
  float outLen = length(outDir);
  vec3 radial = outLen > 0.0001 ? outDir / outLen : vec3(0.0, 1.0, 0.0);

  float curlX = sin(aSeed.y * 3.1 + uTime * 0.7 + aRand.x * TWO_PI) * 0.45 +
                cos(uTime * 0.4 + aRand.y * TWO_PI) * 0.25;
  float curlY = cos(aSeed.x * 3.7 + uTime * 0.6 + aRand.y * TWO_PI) * 0.35 +
                sin(uTime * 0.5 + aRand.z * TWO_PI) * 0.2;
  float curlZ = sin(aSeed.z * 3.3 - uTime * 0.65 + aRand.z * TWO_PI) * 0.45 +
                cos(uTime * 0.35 + aRand.w * TWO_PI) * 0.25;

  vec3 driftOffset = radial * (0.75 + 2.2 * aRand.w) + vec3(curlX, curlY, curlZ);
  vec3 driftPos = aSeed + driftOffset * uBreak;

  // 2. Tarikan ke posisi 3 ikan (uAttract[0..2]) dengan spiral halus saat uFlow naik
  int fishIdx = int(mod(floor(aRand.w * 3.0), 3.0));
  vec3 attractTarget = fishIdx == 0 ? uAttract[0] : (fishIdx == 1 ? uAttract[1] : uAttract[2]);
  vec3 funnelOffset = vec3(
    cos(aRand.x * TWO_PI + uFlow * 5.0),
    sin(aRand.y * TWO_PI + uFlow * 4.0) * 0.5,
    sin(aRand.x * TWO_PI + uFlow * 5.0)
  ) * (1.0 - uFlow) * 0.45;
  float flowMix = smoothstep(0.0, 1.0, uFlow);
  vec3 flowPos = mix(driftPos, attractTarget + funnelOffset, flowMix);

  // 3. Mengendap di atas filet di piring top-down (uSettle)
  float r = sqrt(clamp(aRand.x, 0.0, 1.0));
  float ang = aRand.y * TWO_PI;
  vec3 filletTarget = vec3(cos(ang) * r * 1.05, 0.24 + aRand.z * 0.08, sin(ang) * r * 0.42);
  float settleMix = smoothstep(0.0, 1.0, uSettle);
  vec3 finalPos = mix(flowPos, filletTarget, settleMix);

  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float flowShrink = mix(1.0, 0.22, smoothstep(0.35, 1.0, uFlow) * (1.0 - settleMix));
  float perspectiveScale = clamp(7.0 / max(1.5, -mvPosition.z), 0.6, 2.0);
  gl_PointSize = max(1.2, aSize * uSizeScale * flowShrink * perspectiveScale);

  // Opasitas lembut: terlihat saat keluar dari botol atau saat menyatu kembali di punchline
  float breakVis = smoothstep(0.0, 0.08, max(uBreak, max(uFlow, uSettle)));
  vAlpha = uFade * mix(0.25, 0.92, breakVis);
}
`;

export const PARTICLE_FRAGMENT_SHADER = /* glsl */ `
precision mediump float;

uniform vec3 uColor;
varying float vAlpha;

void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float dist = length(centered);
  float mask = smoothstep(0.5, 0.14, dist);
  float alpha = mask * vAlpha;
  if (alpha <= 0.002) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`;
