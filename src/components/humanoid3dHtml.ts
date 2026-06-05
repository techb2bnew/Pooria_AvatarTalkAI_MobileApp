import { getAvatar3DConfig } from '../constants/avatar3dConfig';
import { EMOTION_3D_CLIP } from '../constants/personalityAvatar';

export type Humanoid3DBuildOptions = {
  avatarGender: string;
  personalityId: string;
  accentColor: string;
};

export const buildHumanoid3DHtml = ({
  avatarGender,
  personalityId,
  accentColor,
}: Humanoid3DBuildOptions): string => {
  const cfg = getAvatar3DConfig(avatarGender, personalityId);
  const clipsJson = JSON.stringify(EMOTION_3D_CLIP);
  const modelUrl = cfg.modelUrl.replace(/'/g, "\\'");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
    #c { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="c"></div>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
  <script>
    const ACCENT = '${accentColor}';
    const MODEL = '${modelUrl}';
    const IS_RPM = ${cfg.isRpm ? 'true' : 'false'};
    const AUTO_FRAME = ${cfg.useAutoFrame ? 'true' : 'false'};
    const TINT = '${cfg.tintHex}';
    const TINT_STRENGTH = ${cfg.tintStrength};
    const CLIPS = ${clipsJson};
    let scene, camera, renderer, mixer, model, activeAction, clock, talkSpeed = 1;

    function post(payload) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }

    function tintMeshes(root, hex, strength) {
      if (strength <= 0) return;
      const c = new THREE.Color(hex);
      root.traverse((node) => {
        if (!node.isMesh || !node.material) return;
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach((mat) => {
          if (!mat.color) return;
          if (!mat.userData._base) mat.userData._base = mat.color.clone();
          mat.color.copy(mat.userData._base).lerp(c, strength);
        });
      });
    }

    function frameModel(root) {
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = IS_RPM ? 1.75 / maxDim : 1.8 / maxDim;
      root.scale.multiplyScalar(scale);
      root.position.sub(center.multiplyScalar(scale));
      const h = size.y * scale;
      camera.position.set(0, h * 0.55, h * 1.35);
      camera.lookAt(0, h * 0.45, 0);
    }

    function init() {
      const el = document.getElementById('c');
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(32, el.clientWidth / el.clientHeight, 0.1, 100);
      camera.position.set(0, 1.05, 2.5);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2, 2.5));
      renderer.setSize(el.clientWidth, el.clientHeight);
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c0cc, 1.55));
      const key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(2, 8, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(ACCENT, 0.35);
      rim.position.set(-3, 4, -2);
      scene.add(rim);
      const accent = new THREE.PointLight(ACCENT, 1.2, 20);
      accent.name = 'accentLight';
      accent.position.set(-1.2, 2, 2.4);
      scene.add(accent);

      clock = new THREE.Clock();
      const clipMap = {};
      let loaded = false;
      const fail = () => { if (!loaded) post({ type: 'error' }); };
      setTimeout(fail, 25000);

      if (typeof THREE === 'undefined' || !THREE.GLTFLoader) {
        fail();
        return;
      }

      new THREE.GLTFLoader().load(
        MODEL,
        (gltf) => {
          loaded = true;
          model = gltf.scene;
          scene.add(model);
          if (AUTO_FRAME) frameModel(model);
          else {
            model.scale.set(0.013, 0.013, 0.013);
            model.position.set(0, -0.95, 0);
          }
          tintMeshes(model, TINT, TINT_STRENGTH);
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((c) => { clipMap[c.name] = c; });
          window._clips = clipMap;
          playEmotion('idle');
          post({ type: 'ready', rpm: IS_RPM });
        },
        undefined,
        fail,
      );

      window.addEventListener('resize', () => {
        camera.aspect = el.clientWidth / el.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(el.clientWidth, el.clientHeight);
      });
      animate();
    }

    function resolveClip(emotion) {
      const preferred = CLIPS[emotion] || 'idle';
      const tries = [
        preferred, 'idle', 'Idle', 'stand', 'Walk', 'walk', 'Run', 'run',
        'agree', 'Agree', 'headShake', 'Wave', 'wave', 'Talking', 'talking',
      ];
      for (let i = 0; i < tries.length; i++) {
        if (window._clips && window._clips[tries[i]]) return tries[i];
      }
      const names = Object.keys(window._clips || {});
      return names[0] || null;
    }

    function playClip(name, speed) {
      const clips = window._clips;
      if (!mixer || !clips || !clips[name]) return;
      const next = mixer.clipAction(clips[name]);
      if (activeAction === next) {
        next.setEffectiveTimeScale(speed || 1);
        return;
      }
      if (activeAction) activeAction.fadeOut(0.25);
      next.reset().setEffectiveTimeScale(speed || 1).fadeIn(0.25).play();
      activeAction = next;
    }

    function playEmotion(emotion) {
      const clip = resolveClip(emotion);
      if (!clip) return;
      const speed = emotion === 'talking' ? talkSpeed : emotion === 'excited' ? 0.7 : 1;
      playClip(clip, speed);
    }

    function setTalking(active) {
      talkSpeed = active ? 1.75 : 1;
      playEmotion(active ? 'talking' : 'idle');
    }

    function onMessage(raw) {
      try {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (data.type === 'emotion') playEmotion(data.emotion || 'idle');
        if (data.type === 'talking') setTalking(!!data.active);
        if (data.type === 'accent' && data.color) {
          scene.children.forEach((ch) => {
            if (ch.name === 'accentLight' && ch.isPointLight) ch.color.set(data.color);
          });
        }
      } catch (e) {}
    }

    function animate() {
      requestAnimationFrame(animate);
      const dt = clock ? clock.getDelta() : 0;
      if (mixer) mixer.update(dt);
      if (renderer && scene && camera) renderer.render(scene, camera);
    }

    window.handleAvatarCommand = onMessage;
    document.addEventListener('message', (e) => onMessage(e.data));
    window.addEventListener('message', (e) => onMessage(e.data));
    init();
  </script>
</body>
</html>`;
};
