import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.querySelector('#orb-canvas');
const stage = document.querySelector('.webgl-stage');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const PALETTE = {
  cyan: new THREE.Color(0x4fd6ff),
  blue: new THREE.Color(0x3b5bff),
  violet: new THREE.Color(0x9a5cff),
  pink: new THREE.Color(0xff5fb8),
  white: new THREE.Color(0xffffff)
};

// Gaussian-ish random, used to cluster particles around spiral arms.
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

if (canvas && stage && !reducedMotion) {
  try {
    const constrainedDevice = (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    let qualityScale = constrainedDevice ? 0.82 : 1;
    let qualityReduced = constrainedDevice;
    let performanceSampled = false;
    const dprCap = () => (constrainedDevice || qualityReduced ? 1 : 1.25);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !constrainedDevice,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, dprCap()) * qualityScale);
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020208);

    const camera = new THREE.PerspectiveCamera(43, innerWidth / innerHeight, 0.03, 100);
    camera.position.set(-0.7, 0.3, 8.5);

    // --- Environment: dark space with coloured light strips, so the glass
    // reflects cyan / violet / pink edges instead of a bright white room.
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x000000);
    const strip = (color, strength, w, h, pos, look) => {
      const m = new THREE.Mesh(
        new THREE.CircleGeometry(Math.max(w, h) / 2, 48),
        new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(strength), side: THREE.DoubleSide })
      );
      m.position.set(...pos);
      m.lookAt(...look);
      envScene.add(m);
    };
    strip(PALETTE.cyan, 1.4, 4, 4, [-6, 5, 5], [0, 0, 0]);
    strip(PALETTE.white, 3, 1.2, 1.2, [-4, 6, 3], [0, 0, 0]);
    strip(PALETTE.pink, 1.2, 4, 4, [6, -4, 4], [0, 0, 0]);
    strip(PALETTE.violet, 2.5, 14, 8, [0, 1, -10], [0, 0, 0]);
    strip(PALETTE.blue, 1.5, 14, 3, [0, -8, 0], [0, 0, 0]);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(envScene, 0.02).texture;
    pmrem.dispose();

    const orbGroup = new THREE.Group();
    scene.add(orbGroup);
    const ORB_R = 1.62;

    // --- Glass shell. depthWrite off so ribbons and sparkles inside stay visible.
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdde2ff,
      transmission: 1,
      transparent: true,
      depthWrite: false,
      roughness: 0.09,
      metalness: 0,
      ior: 1.45,
      thickness: 0.55,
      attenuationColor: new THREE.Color(0x6d52ff),
      attenuationDistance: 5,
      dispersion: 0.9,
      iridescence: 0.65,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 720],
      envMapIntensity: 0.9,
      clearcoat: 1,
      clearcoatRoughness: 0.12
    });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(ORB_R, 96, 64), glassMaterial);
    orbGroup.add(orb);

    // --- Fresnel rim: the glowing edge that shifts cyan to violet to pink.
    const rimMaterial = new THREE.ShaderMaterial({
      uniforms: { uIntro: { value: 0 }, uTime: { value: 0 } },
      vertexShader: `
        varying vec3 vN; varying vec3 vV; varying vec3 vP;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          vP = normalize(position);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform float uIntro; uniform float uTime;
        varying vec3 vN; varying vec3 vV; varying vec3 vP;
        void main() {
          float f = pow(1.0 - clamp(dot(vN, vV), 0.0, 1.0), 5.0);
          vec3 cyan = vec3(0.31, 0.84, 1.0), violet = vec3(0.6, 0.36, 1.0), pink = vec3(1.0, 0.37, 0.72);
          float t = clamp(0.5 - 0.5 * vP.y + 0.18 * vP.x + 0.08 * sin(uTime * 0.3), 0.0, 1.0);
          vec3 col = t < 0.5 ? mix(cyan, violet, t * 2.0) : mix(violet, pink, (t - 0.5) * 2.0);
          gl_FragColor = vec4(col * f * 0.9 * uIntro, 1.0);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const rim = new THREE.Mesh(new THREE.SphereGeometry(ORB_R * 1.005, 96, 64), rimMaterial);
    orbGroup.add(rim);

    // A strip that lies on the sphere's surface along a curve; its width swells
    // in the middle so each ribbon reads as a curved crescent of glass.
    function surfaceBand(curve, width, segments) {
      const pos = [], uv = [], idx = [];
      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const p = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t);
        const across = tangent.clone().cross(p.clone().normalize()).normalize();
        const w = width * Math.sin(Math.PI * t) ** 0.8;
        const q = p.clone().add(across.multiplyScalar(w)).normalize().multiplyScalar(p.length() * 0.985);
        pos.push(p.x, p.y, p.z, q.x, q.y, q.z);
        uv.push(t, 0, t, 1);
        if (s < segments) {
          const k = s * 2;
          idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      return g;
    }

    // --- Light ribbons: sweeping arcs inside the glass with a pulse of light
    // travelling along each one. They draw on during the intro.
    const ribbonMaterials = [];
    const ribbonGroup = new THREE.Group();
    orbGroup.add(ribbonGroup);
    const ribbonColours = [
      [PALETTE.cyan, PALETTE.violet], [PALETTE.violet, PALETTE.pink], [PALETTE.white, PALETTE.cyan],
      [PALETTE.pink, PALETTE.violet], [PALETTE.blue, PALETTE.cyan], [PALETTE.violet, PALETTE.white],
      [PALETTE.cyan, PALETTE.pink]
    ];
    ribbonColours.forEach(([a, b], i) => {
      const axis = new THREE.Vector3(gauss(), gauss() + 0.4, gauss()).normalize();
      const u = new THREE.Vector3(1, 0, 0).cross(axis).normalize();
      const v = axis.clone().cross(u).normalize();
      const start = Math.random() * Math.PI * 2;
      const span = Math.PI * (0.9 + Math.random() * 0.7);
      const radius = ORB_R * (0.86 + Math.random() * 0.12);
      const phase = Math.random() * 6.28;
      const points = [];
      for (let s = 0; s <= 48; s++) {
        const th = start + span * (s / 48);
        const r = radius * (1 + 0.07 * Math.sin(2 * th + phase));
        const lift = 0.28 * Math.sin(th * 1.3 + phase) * radius;
        points.push(u.clone().multiplyScalar(Math.cos(th) * r)
          .add(v.clone().multiplyScalar(Math.sin(th) * r))
          .add(axis.clone().multiplyScalar(lift)));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const width = ORB_R * (i % 3 === 0 ? 0.34 : 0.14 + Math.random() * 0.12);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 }, uReveal: { value: 0 },
          uA: { value: a }, uB: { value: b },
          uSpeed: { value: 0.05 + Math.random() * 0.06 }, uOffset: { value: Math.random() },
          uGain: { value: i % 3 === 0 ? 1.4 : 0.95 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          uniform float uTime, uReveal, uSpeed, uOffset, uGain; uniform vec3 uA, uB;
          varying vec2 vUv;
          void main() {
            if (vUv.x > uReveal) discard;
            float taper = pow(sin(3.14159 * vUv.x), 1.6);
            // A bright leading edge that fades softly across the sheet.
            float edge = exp(-vUv.y * 38.0) * 1.3 + exp(-vUv.y * 4.0) * 0.22;
            float head = fract(vUv.x - uTime * uSpeed - uOffset);
            float pulse = smoothstep(0.8, 1.0, head) * 1.8;
            vec3 col = mix(uA, uB, vUv.x);
            gl_FragColor = vec4(col * taper * edge * (0.45 + pulse) * uGain, 1.0);
          }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      ribbonMaterials.push(mat);
      ribbonGroup.add(new THREE.Mesh(surfaceBand(curve, width, 240), mat));
    });

    // --- Shared soft point shader for sparkles, dust and bokeh.
    const pointMaterials = [];
    function makePoints({ positions, colors, sizes, seeds, bokeh = false, scaleIn = 1 }) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 }, uIntro: { value: 0 },
          uPixelRatio: { value: renderer.getPixelRatio() },
          uBokeh: { value: bokeh ? 1 : 0 }, uScaleIn: { value: scaleIn }
        },
        vertexShader: `
          attribute float aSize; attribute float aSeed;
          uniform float uTime, uIntro, uPixelRatio, uScaleIn;
          varying vec3 vColor; varying float vAlpha;
          void main() {
            // Each point arrives on its own schedule, spiralling inward.
            float t = clamp(uIntro * 1.6 - aSeed * 0.6, 0.0, 1.0);
            t = 1.0 - pow(1.0 - t, 3.0);
            vec3 p = position;
            float ang = (1.0 - t) * 1.8;
            p.xz = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p.xz * mix(uScaleIn, 1.0, t);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * uPixelRatio * (60.0 / max(-mv.z, 0.1));
            vColor = color;
            vAlpha = t * (0.65 + 0.35 * sin(uTime * (0.8 + aSeed * 2.5) + aSeed * 40.0));
          }`,
        fragmentShader: `
          uniform float uBokeh;
          varying vec3 vColor; varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float a = uBokeh > 0.5
              ? (smoothstep(0.5, 0.3, d) * 0.22 + exp(-d * d * 10.0) * 0.12)
              : exp(-d * d * 30.0) + exp(-d * d * 6.0) * 0.25;
            gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
          }`,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      pointMaterials.push(mat);
      return new THREE.Points(geo, mat);
    }
    const pick = (weights) => {
      let r = Math.random() * weights.reduce((s, w) => s + w[1], 0);
      for (const [c, w] of weights) { if ((r -= w) <= 0) return c; }
      return weights[0][0];
    };
    function buildCloud(count, place, colourWeights, sizeFn) {
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const seeds = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const [x, y, z] = place(i);
        positions.set([x, y, z], i * 3);
        const c = pick(colourWeights);
        colors.set([c.r, c.g, c.b], i * 3);
        sizes[i] = sizeFn();
        seeds[i] = Math.random();
      }
      return { positions, colors, sizes, seeds };
    }

    // Galaxy: a deliberately imperfect swirl. Lopsided arms, clumps, dust
    // gaps and broken rings keep it from looking machine-drawn. Stars wander
    // gently along their orbits so the pattern never repeats exactly, the
    // disc is slightly warped, and about one star in six periodically lifts
    // off and evaporates upward, faster while you scroll.
    const galaxy = new THREE.Group();
    galaxy.rotation.set(0.42, 0, -0.14);
    scene.add(galaxy);
    const galaxyCount = constrainedDevice ? 4500 : 7500;
    const LIFT_SHARE = 1 / 70;

    const arms = [
      { offset: 0, pitch: 1.3, width: 0.26, rMax: 7.0, bright: 1.0 },
      { offset: Math.PI + 0.35, pitch: 1.55, width: 0.42, rMax: 5.4, bright: 0.72 }
    ];
    const clumps = Array.from({ length: 12 }, (_, k) => {
      const arm = arms[k % 2];
      const r = 2.5 + Math.random() * (arm.rMax - 2.8);
      return { r, a: arm.offset + Math.log(r) * arm.pitch + gauss() * 0.15, size: 0.1 + Math.random() * 0.16 };
    });
    const gaps = Array.from({ length: 5 }, () => ({
      r: 2.6 + Math.random() * 3.5, a: Math.random() * Math.PI * 2, size: 0.35 + Math.random() * 0.45
    }));
    const ringRadii = [2.22, 2.47, 2.86, 3.28, 3.47].map(r => ({
      r, k1: 2 + Math.floor(Math.random() * 3), k2: 5 + Math.floor(Math.random() * 4),
      p1: Math.random() * 6.28, p2: Math.random() * 6.28, cut: -0.75 + Math.random() * 0.45
    }));
    const inGap = (x, z) => gaps.some(g => {
      const dx = x - Math.cos(g.a) * g.r, dz = z - Math.sin(g.a) * g.r;
      return dx * dx + dz * dz < g.size * g.size;
    });

    function galaxyStar() {
      for (let tries = 0; tries < 12; tries++) {
        const roll = Math.random();
        let r, a, y, bright = 1;
        if (roll < 0.36) {
          // Broken rings: arcs with uneven gaps and a slight wobble.
          const ring = ringRadii[Math.floor(Math.random() * ringRadii.length)];
          a = Math.random() * Math.PI * 2;
          if (Math.sin(a * ring.k1 + ring.p1) + 0.6 * Math.sin(a * ring.k2 + ring.p2) < ring.cut) continue;
          r = ring.r * (1 + 0.02 * Math.sin(3 * a + ring.p1)) + gauss() * 0.03;
          y = gauss() * 0.03;
        } else if (roll < 0.42) {
          // Clumps of stars sitting along the arms.
          const c = clumps[Math.floor(Math.random() * clumps.length)];
          const cx = Math.cos(c.a) * c.r + gauss() * c.size * 1.3, cz = Math.sin(c.a) * c.r + gauss() * c.size * 1.3;
          r = Math.hypot(cx, cz); a = Math.atan2(cz, cx); y = gauss() * 0.08; bright = 1.0;
        } else if (roll < 0.5) {
          // Loose halo scatter between the arms.
          r = 2.15 + Math.random() * 5.2; a = Math.random() * Math.PI * 2; y = gauss() * 0.25; bright = 0.6;
        } else {
          const arm = arms[Math.random() < 0.58 ? 0 : 1];
          r = 2.15 + Math.pow(Math.random(), 1.1) * (arm.rMax - 2.15);
          const ragged = arm.width * (1 + 0.6 * Math.sin(r * 2.3 + arm.offset * 3));
          a = arm.offset + Math.log(r) * arm.pitch + gauss() * (ragged + r * 0.03);
          y = gauss() * (0.06 + r * 0.025); bright = arm.bright;
        }
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        if (r > 2.5 && inGap(x, z) && Math.random() < 0.85) continue;
        return { r, a, y, bright };
      }
      return { r: 3 + Math.random() * 3, a: Math.random() * Math.PI * 2, y: 0, bright: 0.6 };
    }

    const galaxyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uIntro: { value: 0 }, uLiftClock: { value: 0 }, uStretch: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() }
      },
      vertexShader: `
        attribute vec3 aOrbit;   // radius, angle, height in the disc
        attribute float aSize; attribute float aSeed; attribute float aLift; attribute float aBright;
        uniform float uTime, uIntro, uLiftClock, uPixelRatio;
        varying vec3 vColor; varying float vAlpha; varying float vRising;
        void main() {
          float t = clamp(uIntro * 1.6 - aSeed * 0.6, 0.0, 1.0);
          t = 1.0 - pow(1.0 - t, 3.0);
          float r = aOrbit.x;
          // Bounded wander along the orbit: inner stars sway faster, so the
          // pattern keeps shifting without winding itself up.
          float wander = sin(uTime * (0.35 / r + 0.02) + aSeed * 50.0) * (0.22 / sqrt(r));
          float ang = aOrbit.y + wander + (1.0 - t) * 1.8;
          float rr = r * (1.0 + 0.015 * sin(uTime * 0.2 + aSeed * 30.0)) * mix(2.4, 1.0, t);
          vec3 p = vec3(cos(ang) * rr, aOrbit.z, sin(ang) * rr);
          // Gentle warp: the disc's outer edge bends up on one side, down on the other.
          p.y += 0.35 * pow(r / 7.0, 2.0) * sin(ang + 0.8);

          // Evaporation cycle for lifters: rest in the disc for most of the
          // cycle, then rise, sway, swell and fade before settling back.
          float h = 0.0; float settle = 1.0;
          if (aLift > 0.5) {
            float c = fract(uLiftClock * (0.6 + aSeed * 0.8) + aSeed * 13.0);
            if (c < 0.7) settle = smoothstep(0.0, 0.12, c);
            else h = (c - 0.7) / 0.3;
          }
          vec4 wp = modelMatrix * vec4(p, 1.0);
          wp.y += h * h * 5.5 + h * 1.2;
          wp.x += sin(uTime * 0.6 + aSeed * 40.0 + h * 6.0) * 0.4 * h;
          vec4 mv = viewMatrix * wp;
          gl_Position = projectionMatrix * mv;
          float size = aSize * (1.0 + h * 1.4);
          gl_PointSize = min(size * uPixelRatio * (60.0 / max(-mv.z, 0.1)), 48.0 * uPixelRatio);
          vColor = mix(color, vec3(0.78, 0.8, 1.0), h * 0.5) * aBright;
          float twinkle = 0.65 + 0.35 * sin(uTime * (0.8 + aSeed * 2.5) + aSeed * 40.0);
          vAlpha = t * twinkle * settle * (1.0 - smoothstep(0.35, 1.0, h));
          vRising = step(0.001, h);
        }`,
      fragmentShader: `
        uniform float uStretch;
        varying vec3 vColor; varying float vAlpha; varying float vRising;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          c.x *= 1.0 + uStretch * 1.5 * vRising;   // rising stars streak while you scroll
          float d = length(c);
          if (d > 0.5) discard;
          float a = exp(-d * d * 30.0) + exp(-d * d * 6.0) * 0.25;
          gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
        }`,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    pointMaterials.push(galaxyMaterial);

    {
      const orbit = new Float32Array(galaxyCount * 3);
      const pos = new Float32Array(galaxyCount * 3);
      const colors = new Float32Array(galaxyCount * 3);
      const sizes = new Float32Array(galaxyCount);
      const seeds = new Float32Array(galaxyCount);
      const lift = new Float32Array(galaxyCount);
      const bright = new Float32Array(galaxyCount);
      const colourWeights = [[PALETTE.blue, 3], [PALETTE.cyan, 2], [PALETTE.violet, 3], [PALETTE.pink, 1], [PALETTE.white, 1.2]];
      for (let i = 0; i < galaxyCount; i++) {
        const s = galaxyStar();
        orbit.set([s.r, s.a, s.y], i * 3);
        pos.set([Math.cos(s.a) * s.r, s.y, Math.sin(s.a) * s.r], i * 3);
        const c = pick(colourWeights);
        colors.set([c.r, c.g, c.b], i * 3);
        sizes[i] = 0.25 + Math.pow(Math.random(), 4) * 1.1;
        seeds[i] = Math.random();
        lift[i] = Math.random() < LIFT_SHARE ? 1 : 0;
        bright[i] = s.bright;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aOrbit', new THREE.BufferAttribute(orbit, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
      geo.setAttribute('aLift', new THREE.BufferAttribute(lift, 1));
      geo.setAttribute('aBright', new THREE.BufferAttribute(bright, 1));
      const galaxyPoints = new THREE.Points(geo, galaxyMaterial);
      galaxyPoints.frustumCulled = false;
      galaxy.add(galaxyPoints);
    }
    const LIFT_IDLE = 0.004;    // evaporation rate when not scrolling
    const LIFT_SCROLL = 0.15;    // extra evaporation while scrolling

    // Sparkles inside the glass, weighted toward the lower half.
    orbGroup.add(makePoints({
      ...buildCloud(constrainedDevice ? 90 : 160, () => {
        const v = new THREE.Vector3(gauss(), gauss() - 0.25, gauss()).normalize();
        return v.multiplyScalar(ORB_R * Math.cbrt(Math.random()) * 0.92).toArray();
      }, [[PALETTE.white, 3], [PALETTE.pink, 1.5], [PALETTE.cyan, 1.5], [PALETTE.violet, 1]],
      () => 0.3 + Math.pow(Math.random(), 4) * 1.6),
      scaleIn: 0.2
    }));

    // Dust: faint stars filling the whole volume.
    scene.add(makePoints({
      ...buildCloud(constrainedDevice ? 500 : 900, () => {
        const v = new THREE.Vector3(gauss(), gauss(), gauss()).normalize();
        return v.multiplyScalar(6 + Math.random() * 16).toArray();
      }, [[PALETTE.white, 2], [PALETTE.cyan, 1], [PALETTE.violet, 1]], () => 0.5 + Math.random() * 0.7)
    }));

    // Bokeh: a few large, soft out-of-focus dots for depth.
    const bokeh = makePoints({
      ...buildCloud(constrainedDevice ? 24 : 42, () => [
        (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 9, -6 + Math.random() * 12
      ], [[PALETTE.pink, 2], [PALETTE.violet, 2], [PALETTE.blue, 2], [PALETTE.cyan, 1]],
      () => 4 + Math.random() * 10),
      bokeh: true
    });
    bokeh.material.uniforms.uBokeh.value = 1;
    scene.add(bokeh);

    // --- Lens flares on the rim. They follow the orb but not its spin,
    // so the highlights stay put like real reflections of a light.
    function flareTexture() {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const g = c.getContext('2d');
      const glow = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      glow.addColorStop(0, 'rgba(255,255,255,1)');
      glow.addColorStop(0.08, 'rgba(255,240,255,0.8)');
      glow.addColorStop(0.3, 'rgba(180,140,255,0.18)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = glow;
      g.fillRect(0, 0, 256, 256);
      const streak = (w, h) => {
        const s = g.createRadialGradient(128, 128, 0, 128, 128, 128);
        s.addColorStop(0, 'rgba(255,255,255,0.9)');
        s.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = s;
        g.fillRect(128 - w / 2, 128 - h / 2, w, h);
      };
      streak(256, 3);
      streak(3, 170);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }
    const flareTex = flareTexture();
    const flareGroup = new THREE.Group();
    scene.add(flareGroup);
    const flares = [
      { dir: [-0.55, 0.72, 0.42], scale: 1.1, tint: 0xdff4ff },
      { dir: [0.5, -0.7, 0.5], scale: 0.85, tint: 0xffd6f0 }
    ].map(({ dir, scale, tint }) => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: flareTex, color: tint, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, opacity: 0
      }));
      sprite.position.copy(new THREE.Vector3(...dir).normalize().multiplyScalar(ORB_R * 1.01));
      sprite.scale.setScalar(scale);
      sprite.userData.base = scale;
      flareGroup.add(sprite);
      return sprite;
    });

    // --- Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomBase = constrainedDevice ? 0.55 : 0.8;
    const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), bloomBase, 0.55, 0.2);
    let bloomEnabled = true;
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    const cameraPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.7, 0.3, 8.5),
      new THREE.Vector3(0.9, 0.15, 6.2),
      new THREE.Vector3(-1.2, 0.42, 4.25),
      new THREE.Vector3(0.55, 0.08, 2.55),
      new THREE.Vector3(0.12, 0.02, 0.9),
      new THREE.Vector3(-0.08, 0, -0.35),
      new THREE.Vector3(0.35, -0.1, -3.6)
    ], false, 'catmullrom', 0.48);
    const lookPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.1, 0, 0),
      new THREE.Vector3(0, 0, -0.3),
      new THREE.Vector3(0, 0, -1.5),
      new THREE.Vector3(0, 0, -4.5)
    ]);

    let targetProgress = 0;
    let easedProgress = 0;
    let pointerX = 0;
    let pointerY = 0;
    let running = true;
    let framesRendered = 0;
    let lastProgress = 0;
    let stretch = 0;
    let liftClock = 0;
    let sampledFrames = 0;
    let sampledTime = 0;
    const INTRO_SECONDS = 2.4;

    function updateProgress() {
      targetProgress = THREE.MathUtils.clamp(
        scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight), 0, 1);
    }
    updateProgress();
    addEventListener('scroll', updateProgress, { passive: true });
    addEventListener('pointermove', event => {
      pointerX = (event.clientX / innerWidth - 0.5) * 0.18;
      pointerY = (event.clientY / innerHeight - 0.5) * 0.1;
    }, { passive: true });
    document.addEventListener('visibilitychange', () => { running = !document.hidden; });

    function setPixelRatio() {
      const pr = Math.min(devicePixelRatio, dprCap()) * qualityScale;
      renderer.setPixelRatio(pr);
      composer.setPixelRatio(pr);
      pointMaterials.forEach(m => { m.uniforms.uPixelRatio.value = pr; });
    }

    renderer.compile(scene, camera);
    const clock = new THREE.Clock();
    function render() {
      requestAnimationFrame(render);
      if (!running) return;

      const rawDelta = clock.getDelta();
      const delta = Math.min(rawDelta, 0.05);
      const elapsed = clock.elapsedTime;
      const intro = Math.min(elapsed / INTRO_SECONDS, 1);
      const introEased = 1 - Math.pow(1 - intro, 3);

      easedProgress = THREE.MathUtils.damp(easedProgress, targetProgress, 3.2, delta);
      const pathT = THREE.MathUtils.smoothstep(easedProgress, 0, 1);

      // Keep the orb clear of the hero copy, then bring it to centre as the journey begins.
      orbGroup.position.x = 1.35 * (1 - THREE.MathUtils.smoothstep(pathT, 0.02, 0.28));
      orbGroup.scale.setScalar(0.82 + 0.18 * introEased);
      galaxy.position.x = orbGroup.position.x;
      flareGroup.position.copy(orbGroup.position);
      flareGroup.scale.copy(orbGroup.scale);

      const position = cameraPath.getPoint(pathT);
      camera.position.set(position.x + pointerX, position.y - pointerY, position.z);
      camera.lookAt(lookPath.getPoint(THREE.MathUtils.clamp((pathT - 0.52) / 0.48, 0, 1)));

      orbGroup.rotation.y = elapsed * 0.1 + pathT * 0.7;
      orbGroup.rotation.x = Math.sin(elapsed * 0.22) * 0.07;
      ribbonGroup.rotation.y = elapsed * 0.05;
      ribbonGroup.rotation.z = Math.sin(elapsed * 0.13) * 0.12;
      galaxy.rotation.y = -elapsed * 0.02 + pathT * 0.45;
      const scrollSpeed = Math.abs(easedProgress - lastProgress) / Math.max(delta, 0.001);
      lastProgress = easedProgress;
      liftClock += delta * (LIFT_IDLE + Math.min(scrollSpeed, 0.6) * LIFT_SCROLL);
      stretch = THREE.MathUtils.damp(stretch, Math.min(scrollSpeed * 2.5, 0.8), 4, delta);
      galaxyMaterial.uniforms.uLiftClock.value = liftClock;
      galaxyMaterial.uniforms.uStretch.value = stretch;

      ribbonMaterials.forEach((m, i) => {
        m.uniforms.uTime.value = elapsed;
        m.uniforms.uReveal.value = THREE.MathUtils.clamp(intro * 1.5 - i * 0.06, 0, 1);
      });
      pointMaterials.forEach(m => {
        m.uniforms.uTime.value = elapsed;
        m.uniforms.uIntro.value = intro;
      });
      rimMaterial.uniforms.uTime.value = elapsed;
      rimMaterial.uniforms.uIntro.value = introEased;

      // Flares fade in late in the intro and fade out once the camera heads inside.
      const flareVis = THREE.MathUtils.smoothstep(intro, 0.6, 1) * (1 - THREE.MathUtils.smoothstep(pathT, 0.3, 0.5));
      flares.forEach((f, i) => {
        const shimmer = 0.85 + 0.15 * Math.sin(elapsed * (1.1 + i * 0.4) + i * 2);
        f.material.opacity = flareVis * shimmer;
        f.scale.setScalar(f.userData.base * (0.9 + 0.1 * shimmer));
      });

      glassMaterial.dispersion = 0.8 + Math.sin(elapsed * 0.35) * 0.12;
      if (bloomEnabled) {
        // Starts bright as it "materialises", then settles.
        bloom.strength = bloomBase * (1 + 1.4 * (1 - introEased)) + Math.sin(elapsed * 0.42) * 0.05;
      }

      sampledFrames += 1;
      sampledTime += rawDelta;
      if (!performanceSampled && sampledFrames >= 120) {
        const sampledFps = sampledFrames / Math.max(sampledTime, 0.001);
        performanceSampled = true;
        if (sampledFps < 45) {
          qualityReduced = true;
          qualityScale = 0.72;
          setPixelRatio();
          if (sampledFps < 32 && bloomEnabled) {
            bloom.enabled = false;
            bloomEnabled = false;
          }
        }
      }

      composer.render();
      // Reveal after a few frames so shader compilation hitches stay hidden.
      if (++framesRendered === 3) document.documentElement.classList.add('webgl-ready');
    }
    render();

    addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      composer.setSize(innerWidth, innerHeight);
      bloom.setSize(innerWidth, innerHeight);
      setPixelRatio();
    });
  } catch (error) {
    console.error('WebGL experience unavailable:', error);
    document.documentElement.classList.add('webgl-failed');
  }
}
