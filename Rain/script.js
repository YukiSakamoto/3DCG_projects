import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";
//import GUI from 'lil-gui';
import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.20/+esm";
const vertexShader = `
varying vec2 vUv;
void main() {
    gl_Position = vec4(position, 1.0);
    vUv = uv;
}
`;
const fragmentShader = `
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uTime;
uniform float mipLevel;
varying vec2 vUv;
float N(vec2 p) {
  p = fract(p*vec2(123.34, 345.45));
  p += dot(p, p+34.345);
  return fract(p.x * p.y);
}

vec3 Layer(vec2 vUv, float t) {
  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
  float s = 2.0;
  vec2 aspect = vec2(2.0, 1.0);
  uv = uv * s * aspect;
  uv.y += t * 0.25;
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);
  float n = N(id);
  t += n * 2.0 *3.1415;

  float w = vUv.y * 10.0;
  float x = (n - 0.5) * 0.8;
  x += (0.4-abs(x)) * sin(w) * pow(sin(w), 3.0);
  float y = -sin(t+sin(t+sin(t)*0.5)) * 0.45;
  y -= (gv.x - x) * (gv.x - x);

  vec2 dropPos = (gv - vec2(x,y)) / aspect;
  float drop = smoothstep(0.05, 0.03, length(dropPos));

  vec2 trailPos = (gv - vec2(x, t*0.25)) / aspect;
  trailPos.y = (fract(trailPos.y*8.0)-0.5) / 8.0;
  float trail = smoothstep(0.03, 0.01, length(trailPos));
  float fogTrail = smoothstep(-0.05, 0.05, dropPos.y);
  fogTrail *= smoothstep(0.5, y, gv.y);
  trail *= fogTrail;
  fogTrail *= smoothstep(0.05, 0.04, abs(dropPos.x));

  vec2 offs = dropPos * drop + trailPos * trail;
  return vec3(offs, fogTrail);
}
void main3() {
  float distortion = 1.0;
  float st = 1.0;
  float t = mod(uTime * st, 100.0);

  vec3 drops = Layer(vUv, t);
  drops += Layer(vUv * 1.23 - 9.87, t);
  drops += Layer(vUv * 1.34 + 6.54, t);
  drops += Layer(vUv * 2.45 - 3.21, t);
  //float mipLevel = 6.0;
  float blar = mipLevel * (1.0 - drops.z);

  float windowAspect = uResolution.x / uResolution.y;
  float textureAspect = 1.0;  // 正方形の場合
  vec2 uv0 = vUv;
  if (windowAspect > textureAspect) {
    uv0.y *= textureAspect / windowAspect;
    uv0.y -= (textureAspect / windowAspect - 1.0) * 0.5;
  } else {
    uv0.x *= windowAspect / textureAspect;
    uv0.x -= (windowAspect / textureAspect - 1.0) * 0.5;
  }

  vec4 textureColor = textureLod(uTexture, uv0 + drops.xy * distortion, blar);
  gl_FragColor = textureColor;
}

void main2() {
  // テクスチャのスケーリング
  float windowAspect = uResolution.x / uResolution.y;
  float textureAspect = 1.0;  // 正方形の場合
  vec2 uv0 = vUv;
  if (windowAspect > textureAspect) {
    uv0.y *= textureAspect / windowAspect;
    uv0.y -= (textureAspect / windowAspect - 1.0) * 0.5;
  } else {
    uv0.x *= windowAspect / textureAspect;
    uv0.x -= (windowAspect / textureAspect - 1.0) * 0.5;
  }

    float st = 1.0;
    float t = mod(uTime * st, 100.0);

    vec4 col = vec4(1.0, 0.0, 0.0, 1.0);
    vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    float s = 2.0;
    vec2 aspect = vec2(2.0, 1.0);
    uv = uv * s * aspect;
    // uv座標をy軸方向に時間と共に移動
    uv.y += t * 0.25;

    vec2 gv = fract(uv) - 0.5;
    // uv座標を10倍にスケーリングすることで高周波にする
    float w = vUv.y * 10.0;

    // 各セルに対する整数IDを生成
    vec2 id = floor(uv);
    float n = N(id);
    // 時間にnを使用して周期的なオフセットを追加
    t += n*6.2831;

    //float x = sin(w)*pow(sin(w), 3.0);
    // nは0, 1の範囲を-0.4, 0.4の範囲にする
    float x = (n-0.5) * 0.8;
    // xの絶対値を引くことでxが中心に近いほど波が大きくなり、遠いほど小さくなる
    x += (0.4 - abs(x)) * sin(w)*pow(sin(w), 3.0);
    float y = -sin(t+sin(t+sin(t)*0.5)) * 0.45;
    // y位置はx位置からの距離の２乗に応じて変化
    y -= (gv.x - x) * (gv.x - x);
    
    // 雨粒
    vec2 dropPos = (gv - vec2(x,y)) / aspect;
    float drop = smoothstep(0.05, 0.03, length(dropPos));

    // 雨粒の跡
    //  時間tに基づいて移動する位置を引くことで止まっているように見せる
    vec2 trailPos = (gv - vec2(x, t*0.25)) / aspect;
    // 繰り返しパターンを生成して、元のスケールに戻す
    trailPos.y = (fract(trailPos.y * 8.0) - 0.5) / 8.0;
    float trail = smoothstep(0.03, 0.01, length(trailPos));

    //  雨粒の跡trailの強度はfogTrailで調整する
    float fogTrail = smoothstep(-0.05, 0.05, dropPos.y);
    fogTrail*= smoothstep(0.5, y, gv.y);

    // dropPos.y が-0.05以下のときtrailは完全に消えるので粒の大きさを考慮しても雨粒の下には描画されない
    //trail *= smoothstep(-0.05, 0.05, dropPos.y);
    trail *= fogTrail;
    
    //dropPos.xの絶対値に基づく
    fogTrail *= smoothstep(0.05, 0.04, abs(dropPos.x));

    col += fogTrail*0.5;
    col += drop;
    col += trail;

  vec2 offs = dropPos * drop + trailPos * trail;
  //distorsionの値を変えてテクスチャのシフト量を制御する
  float distortion = 8.0;
  float mipLevel = 6.0;
  float blar = mipLevel * (1.0 - fogTrail);
  vec4 textureColor = texture2D(uTexture, uv0 + offs * distortion, blar);
  gl_FragColor = textureColor;
}
void main1() {
    float st = 1.0;
    float t = mod(uTime * st, 100.0);

    vec4 col = vec4(1.0, 0.0, 0.0, 1.0);
    vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    float s = 2.0;
    vec2 aspect = vec2(2.0, 1.0);
    uv = uv * s * aspect;
    // uv座標をy軸方向に時間と共に移動
    uv.y += t * 0.25;

    vec2 gv = fract(uv) - 0.5;
    // uv座標を10倍にスケーリングすることで高周波にする
    float w = vUv.y * 10.0;

    // 各セルに対する整数IDを生成
    vec2 id = floor(uv);
    float n = N(id);
    // 時間にnを使用して周期的なオフセットを追加
    t += n*6.2831;

    //float x = sin(w)*pow(sin(w), 3.0);
    // nは0, 1の範囲を-0.4, 0.4の範囲にする
    float x = (n-0.5) * 0.8;
    // xの絶対値を引くことでxが中心に近いほど波が大きくなり、遠いほど小さくなる
    x += (0.4 - abs(x)) * sin(w)*pow(sin(w), 3.0);
    float y = -sin(t+sin(t+sin(t)*0.5)) * 0.45;
    // y位置はx位置からの距離の２乗に応じて変化
    y -= (gv.x - x) * (gv.x - x);
    
    // 雨粒
    vec2 dropPos = (gv - vec2(x,y)) / aspect;
    float drop = smoothstep(0.05, 0.03, length(dropPos));

    // 雨粒の跡
    //  時間tに基づいて移動する位置を引くことで止まっているように見せる
    vec2 trailPos = (gv - vec2(x, t*0.25)) / aspect;
    // 繰り返しパターンを生成して、元のスケールに戻す
    trailPos.y = (fract(trailPos.y * 8.0) - 0.5) / 8.0;
    float trail = smoothstep(0.03, 0.01, length(trailPos));

    //  雨粒の跡trailの強度はfogTrailで調整する
    float fogTrail = smoothstep(-0.05, 0.05, dropPos.y);
    fogTrail*= smoothstep(0.5, y, gv.y);

    // dropPos.y が-0.05以下のときtrailは完全に消えるので粒の大きさを考慮しても雨粒の下には描画されない
    //trail *= smoothstep(-0.05, 0.05, dropPos.y);
    trail *= fogTrail;
    
    //dropPos.xの絶対値に基づく
    fogTrail *= smoothstep(0.05, 0.04, abs(dropPos.x));

    col += fogTrail*0.5;
    col += drop;
    col += trail;
    gl_FragColor = col;
}

void main() {
  main3();
}
`;

const canvas = document.querySelector(".webgl");
//Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
//const myTexture = textureLoader.load('./bp.jpg');
//const myTexture = textureLoader.load('./hakodate.jpeg');
const myTexture = textureLoader.load('./umeda.jpg');

const material = new THREE.ShaderMaterial({
 vertexShader: vertexShader,
 fragmentShader: fragmentShader,
 wireframe: false,
 uniforms: {
  uTime: { value: 0 },
  uResolution: {value: new THREE.Vector2(sizes.width, sizes.height)},
  uTexture: {value: myTexture},
  mipLevel: {value: 2.0},
 } 
});
const params = {
  mipLevel: 2.0,
};
const geometry = new THREE.PlaneGeometry(1.5, 1.5);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
const camera = new THREE.Camera();
scene.add(camera);
const renderer = new THREE.WebGLRenderer({ 
  canvas: canvas 
});

const gui = new GUI();
const folder = gui.addFolder('Parameters');
folder.add(params, 'mipLevel', 0, 10.0, 1.0).onChange(value => {material.uniforms.mipLevel.value = value});

function handleResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  material.uniforms.uResolution.value.set(sizes.width, sizes.height);
}
const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  material.uniforms.uTime.value = elapsedTime;
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
handleResize();
tick();
window.addEventListener('resize', handleResize);
