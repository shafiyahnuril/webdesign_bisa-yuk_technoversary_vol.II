export const WATER_VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform vec2 uSize;
uniform vec2 uCenterOffset;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uWavelengthScale;
uniform vec4 uWave0;
uniform vec4 uWave1;
uniform vec4 uWave2;
uniform vec3 uWaveWeights;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying float vHeightNorm;

const float TWO_PI = 6.28318530718;

void addGerstnerWave(
  vec4 wave,
  float weight,
  vec2 baseXZ,
  inout vec3 offset,
  inout vec3 dPdx,
  inout vec3 dPdz
) {
  float amp = uAmplitude * weight;
  if (amp <= 0.00001) return;

  float wavelength = max(0.1, wave.w * uWavelengthScale);
  float k = TWO_PI / wavelength;
  float c = sqrt(9.8 / k) * uSpeed;
  float h = min(amp * wave.z, 0.72 / (k * 3.0));
  float phase = k * (wave.x * baseXZ.x + wave.y * baseXZ.y) + c * uTime;
  float s = sin(phase);
  float cs = cos(phase);

  offset.x += wave.x * h * cs;
  offset.z += wave.y * h * cs;
  offset.y += amp * s;

  dPdx += vec3(
    -wave.x * wave.x * k * h * s,
    wave.x * k * amp * cs,
    -wave.x * wave.y * k * h * s
  );
  dPdz += vec3(
    -wave.x * wave.y * k * h * s,
    wave.y * k * amp * cs,
    -wave.y * wave.y * k * h * s
  );
}

void main() {
  vUv = uv;
  vec2 worldBaseXZ = position.xz * uSize + uCenterOffset;
  vec3 offset = vec3(0.0);
  vec3 dPdx = vec3(1.0, 0.0, 0.0);
  vec3 dPdz = vec3(0.0, 0.0, 1.0);

  addGerstnerWave(uWave0, uWaveWeights.x, worldBaseXZ, offset, dPdx, dPdz);
  addGerstnerWave(uWave1, uWaveWeights.y, worldBaseXZ, offset, dPdx, dPdz);
  addGerstnerWave(uWave2, uWaveWeights.z, worldBaseXZ, offset, dPdx, dPdz);

  vec3 localDisplaced = vec3(
    worldBaseXZ.x + offset.x - uCenterOffset.x,
    offset.y,
    worldBaseXZ.y + offset.z - uCenterOffset.y
  );

  vec4 worldPosition = modelMatrix * vec4(localDisplaced, 1.0);
  vWorldPos = worldPosition.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normalize(cross(dPdz, dPdx)));
  vHeightNorm = uAmplitude > 0.0001 ? clamp(offset.y / uAmplitude * 0.5 + 0.5, 0.0, 1.0) : 0.5;

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const WATER_FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uMode;
uniform float uClean;
uniform float uTurbid;
uniform float uUnderwater;
uniform float uOpacity;
uniform float uCausticsEnabled;
uniform sampler2D tCaustics;
uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uTurbidColor;
uniform vec3 uSkyColor;
uniform vec3 uFoamColor;
uniform vec3 uSunDir;
uniform float uSunIntensity;
uniform vec3 uFogColor;
uniform float uFogDensity;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying float vHeightNorm;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  vec3 viewVec = cameraPosition - vWorldPos;
  float dist = length(viewVec);
  vec3 V = dist > 0.0001 ? viewVec / dist : vec3(0.0, 1.0, 0.0);

  vec3 N = normalize(vWorldNormal);
  if (!gl_FrontFacing) {
    N = -N;
  }

  float NdotV = clamp(dot(N, V), 0.0, 1.0);
  float fresnel = 0.04 + 0.96 * pow(1.0 - NdotV, 5.0);

  // Gradien warna dalam vs dangkal + kekeruhan
  float shallowMix = clamp(vHeightNorm * 0.65 + (1.0 - NdotV) * 0.35, 0.0, 1.0);
  vec3 baseWater = mix(uDeepColor, uShallowColor, shallowMix);
  baseWater = mix(baseWater, uTurbidColor, clamp(uTurbid, 0.0, 1.0) * (1.0 - uClean));

  // Garis busa tipis dari noise + puncak gelombang
  float n1 = valueNoise(vWorldPos.xz * 1.45 + vec2(uTime * 0.35, -uTime * 0.22));
  float n2 = valueNoise(vWorldPos.xz * 3.8 - vec2(uTime * 0.45, uTime * 0.31));
  float crestFactor = smoothstep(0.64, 0.94, vHeightNorm);
  float foamMask = smoothstep(0.68, 0.86, n1 * 0.65 + n2 * 0.35 + crestFactor * 0.32);
  float foamStrength = foamMask * mix(0.28, 0.08, uClean) * (1.0 - 0.65 * uUnderwater);

  // Kilau matahari dingin (tanpa warna hangat)
  vec3 L = normalize(uSunDir);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), mix(96.0, 140.0, uClean)) * uSunIntensity;

  vec3 aboveColor = mix(baseWater, uSkyColor, fresnel * 0.72);
  aboveColor += vec3(0.95, 0.98, 1.0) * spec * 0.65;
  aboveColor = mix(aboveColor, uFoamColor, foamStrength);

  // Langit-langit bawah air (Snell window + kaustik opsional pada HIGH)
  float snellWindow = smoothstep(0.22, 0.75, NdotV);
  vec3 ceilingBase = mix(uDeepColor * 0.7, uSkyColor * 0.78, snellWindow);
  if (uCausticsEnabled > 0.5) {
    vec2 cUv1 = vWorldPos.xz * 0.14 + vec2(uTime * 0.035, uTime * 0.02);
    vec2 cUv2 = vWorldPos.xz * 0.19 - vec2(uTime * 0.025, -uTime * 0.03);
    float c1 = texture2D(tCaustics, cUv1).r;
    float c2 = texture2D(tCaustics, cUv2).r;
    float caustic = min(c1, c2) * 1.45;
    aboveColor += vec3(0.55, 0.78, 0.95) * caustic * mix(0.08, 0.25, uClean);
    ceilingBase += vec3(0.62, 0.84, 0.98) * caustic * 0.55;
  }

  float underMix = gl_FrontFacing ? clamp(uUnderwater * 0.45, 0.0, 1.0) : max(0.85, uUnderwater);
  vec3 color = mix(aboveColor, ceilingBase, underMix);

  // Kabut eksponensial (selaras FogExp2 scene)
  if (uFogDensity > 0.0001) {
    float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
    color = mix(color, uFogColor, clamp(fogFactor, 0.0, 1.0));
  }

  // Transparansi mulus dan pudar tepi lembut agar tidak memotong kasar
  float edgeX = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);
  float edgeZ = smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
  float edgeFade = mix(1.0, edgeX * edgeZ, step(uMode, 0.5) + step(2.5, uMode) * 0.5);
  float baseAlpha = mix(0.84, 0.94, fresnel);
  baseAlpha = mix(baseAlpha, 0.72, uClean);
  baseAlpha = mix(baseAlpha, 0.88, underMix);

  gl_FragColor = vec4(color, clamp(baseAlpha * edgeFade * uOpacity, 0.0, 1.0));
}
`;
