// WebGL2 Worker for Black Hole Simulation
// Runs on a separate thread to avoid blocking the React Main Thread

const vertexShaderSource = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 fragColor;
in vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_mass;
uniform float u_spin;
uniform vec2 u_camera;
uniform float u_quality;

// Hash and Noise functions for Accretion Disk turbulence
float hash(float n) { return fract(sin(n)*43758.5453); }
float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float n = p.x + p.y*57.0 + 113.0*p.z;
    return mix(mix(mix(hash(n+0.0), hash(n+1.0),f.x),
                   mix(hash(n+57.0), hash(n+58.0),f.x),f.y),
               mix(mix(hash(n+113.0), hash(n+114.0),f.x),
                   mix(hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
}

// Fractional Brownian Motion
float fbm(vec3 p) {
    float f = 0.0;
    f += 0.5000*noise(p); p = p*2.02;
    f += 0.2500*noise(p); p = p*2.03;
    f += 0.1250*noise(p); p = p*2.01;
    f += 0.0625*noise(p);
    return f;
}

// Starfield background
vec3 getStarfield(vec3 rd) {
    float n1 = noise(rd * 150.0);
    float n2 = noise(rd * 350.0);
    float star1 = pow(n1, 25.0) * 2.5;
    float star2 = pow(n2, 35.0) * 3.0;
    
    vec3 color1 = vec3(0.6, 0.7, 1.0);
    vec3 color2 = vec3(1.0, 0.7, 0.5);
    
    vec3 bg = vec3(0.01, 0.01, 0.03); // Deep space dark blue
    return bg + star1 * color1 + star2 * color2;
}

void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= u_resolution.x / u_resolution.y;

    // Camera Setup
    float camYaw = u_camera.x;
    float camPitch = u_camera.y;
    
    vec3 ro = vec3(cos(camYaw)*cos(camPitch)*12.0, sin(camPitch)*12.0, sin(camYaw)*cos(camPitch)*12.0);
    vec3 ta = vec3(0.0, 0.0, 0.0);
    vec3 ww = normalize(ta - ro);
    vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
    vec3 vv = normalize(cross(uu, ww));
    vec3 rd = normalize(uv.x*uu + uv.y*vv + 1.5*ww);

    vec3 col = vec3(0.0);
    
    // Adaptive Sampling
    int maxSteps = int(mix(80.0, 200.0, u_quality));
    float dt_mult = mix(0.08, 0.02, u_quality);
    
    vec3 p = ro;
    float m = u_mass;
    float a = u_spin * m;
    float r_plus = m + sqrt(max(0.0, m*m - a*a)); // Kerr Event Horizon
    
    float accumulatedDensity = 0.0;
    float hitHorizon = 0.0;

    // Raymarching Loop (Non-Euclidean Space)
    for(int i=0; i<maxSteps; i++) {
        float r2 = dot(p, p);
        float r = sqrt(r2);

        // Event Horizon Intersection (Occlusion)
        if(r < r_plus * 0.98) {
            hitHorizon = 1.0;
            break; 
        }

        // Adaptive Step Size: smaller steps near the black hole
        float step_dt = r * dt_mult;

        // 1. Gravitational Lensing (Orthogonal deflection for tangential distortion)
        vec3 force = -normalize(p) * (m / r2);
        vec3 deflection = force - dot(force, rd) * rd; // Keep orthogonal to ray
        
        // 2. Frame Dragging (Lense-Thirring effect for Kerr Metric)
        vec3 spinVec = vec3(0.0, 1.0, 0.0) * a;
        vec3 frameDrag = cross(spinVec, p) / (r2 * r);
        
        // Bend the ray (GR deflection is ~2x Newtonian)
        rd = normalize(rd + (deflection * 2.0 + frameDrag * 3.0) * step_dt);
        p += rd * step_dt;

        // 3. Accretion Disk Rendering
        if(abs(p.y) < 1.5 && r > r_plus * 1.01 && r < r_plus * 12.0) {
            float dist = r;
            // Smoother radial falloff
            float diskDensity = smoothstep(r_plus*12.0, r_plus*2.0, dist) * smoothstep(r_plus*1.01, r_plus*2.5, dist);
            
            // Rotation based on Keplerian velocity
            float angle = atan(p.z, p.x) - u_time * (2.0 / sqrt(dist));
            vec3 diskPos = vec3(cos(angle)*dist, 0.0, sin(angle)*dist);
            
            // Turbulence
            float n = fbm(diskPos * 3.0 + u_time * 0.5);
            
            // Smoother vertical falloff to eliminate the sharp horizontal line
            float verticalFade = exp(-abs(p.y) * 5.0) * smoothstep(1.5, 0.0, abs(p.y));
            diskDensity *= n * verticalFade;

            // 4. Doppler Boosting (Relativistic Beaming)
            vec3 velocity = normalize(cross(vec3(0.0, 1.0, 0.0), p));
            float doppler = dot(rd, velocity) * u_spin * 2.0; 
            
            // 5. Gravitational Redshift
            float redshift = smoothstep(r_plus*1.0, r_plus*4.0, r);
            
            float brightness = diskDensity * 0.25 * pow(1.0 + doppler, 2.0) * redshift;
            
            // Brand Colors: Primary #668aff, Accent #9c87bc
            vec3 colorBlue = vec3(0.40, 0.65, 1.00); 
            vec3 colorPurple = vec3(0.85, 0.35, 0.35); // Reddish for receding side
            
            // Shift color based on Doppler effect (Asymmetric)
            vec3 diskColor = mix(colorPurple, colorBlue, smoothstep(-1.0, 1.0, doppler));
            
            // 6. Secondary Photon Sphere
            float photonRing = smoothstep(r_plus*1.6, r_plus*1.4, r) * smoothstep(r_plus*1.2, r_plus*1.4, r);
            diskColor += vec3(1.0, 0.9, 0.8) * photonRing * 4.0 * pow(1.0 + max(0.0, doppler), 2.0);

            // 7. Selective Bloom
            float bloom = smoothstep(r_plus*2.5, r_plus*1.05, r);
            diskColor += colorBlue * bloom * 1.5;

            // Accumulate using step_dt to maintain consistent brightness regardless of step size
            col += diskColor * brightness * step_dt * 6.0;
            accumulatedDensity += brightness * step_dt * 3.0;
            
            // Early exit if opaque
            if(accumulatedDensity > 1.0) break;
        }
        
        if(r > 40.0) {
            break;
        }
    }

    // 8. Background Stars (Starfield Warp)
    if (hitHorizon < 0.5 && accumulatedDensity < 1.0) {
        vec3 stars = getStarfield(rd);
        col += stars * (1.0 - accumulatedDensity);
    }

    // ACES Tone Mapping for cinematic look
    col = col * 1.4;
    col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
    
    // Gamma correction
    col = pow(col, vec3(1.0/2.2));
    
    fragColor = vec4(col, 1.0);
}
`;

const TARGET_FPS = 60;
const TARGET_FRAME_MS = 1000 / TARGET_FPS;
const MIN_RENDER_SCALE = 0.5;
const MAX_RENDER_SCALE = 1.0;
const MIN_AUTO_QUALITY = 0.2;
const MAX_QUALITY = 1.0;
const PERF_WARMUP_FRAMES = 30;
const PERF_ADJUST_INTERVAL = 20;
const EWMA_ALPHA = 0.12;

let gl = null;
let program = null;
let uniforms = {
    u_resolution: null,
    u_time: null,
    u_mass: null,
    u_spin: null,
    u_camera: null,
    u_quality: null
};
let params = { mass: 1.0, spin: 0.8 };
let camera = { yaw: 0.0, pitch: 0.3 };
let quality = 1.0;
let interactionQuality = 1.0;
let autoQuality = 1.0;
let renderScale = 1.0;
let baseCanvasWidth = 800;
let baseCanvasHeight = 600;
let canvasWidth = 800;
let canvasHeight = 600;
let frameTimeEwma = TARGET_FRAME_MS;
let lastFrameTime = 0;
let sampledFrames = 0;
let framesSinceAdjust = 0;
let isRunning = false;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getInitialRenderScale(width, height) {
    const pixelCount = width * height;
    if (pixelCount > 4200000) return 0.72;
    if (pixelCount > 3000000) return 0.82;
    if (pixelCount > 2200000) return 0.9;
    return 1.0;
}

function updateEffectiveQuality() {
    quality = clamp(Math.min(interactionQuality, autoQuality), MIN_AUTO_QUALITY, MAX_QUALITY);
}

function applyRenderScale() {
    if (!gl || !gl.canvas) return;

    canvasWidth = Math.max(1, Math.round(baseCanvasWidth * renderScale));
    canvasHeight = Math.max(1, Math.round(baseCanvasHeight * renderScale));

    if (gl.canvas.width !== canvasWidth || gl.canvas.height !== canvasHeight) {
        gl.canvas.width = canvasWidth;
        gl.canvas.height = canvasHeight;
    }
}

function tunePerformance() {
    const isSlow = frameTimeEwma > TARGET_FRAME_MS + 1.2;
    const isFast = frameTimeEwma < TARGET_FRAME_MS - 1.8;
    let changed = false;

    if (isSlow) {
        if (renderScale > 0.55) {
            renderScale = clamp(renderScale - 0.05, MIN_RENDER_SCALE, MAX_RENDER_SCALE);
            applyRenderScale();
            changed = true;
        } else if (autoQuality > MIN_AUTO_QUALITY) {
            autoQuality = clamp(autoQuality - 0.08, MIN_AUTO_QUALITY, MAX_QUALITY);
            changed = true;
        }
    } else if (isFast) {
        if (autoQuality < MAX_QUALITY) {
            autoQuality = clamp(autoQuality + 0.05, MIN_AUTO_QUALITY, MAX_QUALITY);
            changed = true;
        } else if (renderScale < MAX_RENDER_SCALE) {
            renderScale = clamp(renderScale + 0.04, MIN_RENDER_SCALE, MAX_RENDER_SCALE);
            applyRenderScale();
            changed = true;
        }
    }

    if (changed) {
        updateEffectiveQuality();
    }
}

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initWebGL(canvas) {
    gl = canvas.getContext('webgl2', { antialias: false, powerPreference: "high-performance" });
    if (!gl) {
        console.error('WebGL2 not supported');
        return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vs || !fs) return;

    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
    }

    // Fullscreen quad
    const vertices = new Float32Array([
        -1, -1,  1, -1, -1,  1,
        -1,  1,  1, -1,  1,  1
    ]);
    
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    uniforms = {
        u_resolution: gl.getUniformLocation(program, 'u_resolution'),
        u_time: gl.getUniformLocation(program, 'u_time'),
        u_mass: gl.getUniformLocation(program, 'u_mass'),
        u_spin: gl.getUniformLocation(program, 'u_spin'),
        u_camera: gl.getUniformLocation(program, 'u_camera'),
        u_quality: gl.getUniformLocation(program, 'u_quality')
    };

    renderScale = getInitialRenderScale(baseCanvasWidth, baseCanvasHeight);
    applyRenderScale();
    updateEffectiveQuality();
    isRunning = true;
    lastFrameTime = 0;
    sampledFrames = 0;
    framesSinceAdjust = 0;
    frameTimeEwma = TARGET_FRAME_MS;
    requestAnimationFrame(render);
}

function render(time) {
    if (!isRunning || !gl || !program) return;

    if (lastFrameTime > 0) {
        const frameMs = time - lastFrameTime;
        frameTimeEwma = frameTimeEwma * (1 - EWMA_ALPHA) + frameMs * EWMA_ALPHA;
        sampledFrames += 1;
        framesSinceAdjust += 1;

        if (sampledFrames > PERF_WARMUP_FRAMES && framesSinceAdjust >= PERF_ADJUST_INTERVAL) {
            tunePerformance();
            framesSinceAdjust = 0;
        }
    }
    lastFrameTime = time;

    gl.viewport(0, 0, canvasWidth, canvasHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform2f(uniforms.u_resolution, canvasWidth, canvasHeight);
    gl.uniform1f(uniforms.u_time, time * 0.001);
    gl.uniform1f(uniforms.u_mass, params.mass);
    gl.uniform1f(uniforms.u_spin, params.spin);
    gl.uniform2f(uniforms.u_camera, camera.yaw, camera.pitch);
    gl.uniform1f(uniforms.u_quality, quality);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}

self.onmessage = (e) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'INIT':
            baseCanvasWidth = payload.width;
            baseCanvasHeight = payload.height;
            initWebGL(payload.canvas);
            break;
        case 'UPDATE_PARAMS':
            params = { ...params, ...payload };
            break;
        case 'UPDATE_CAMERA':
            camera = payload;
            break;
        case 'UPDATE_QUALITY':
            interactionQuality = clamp(payload, 0.0, MAX_QUALITY);
            updateEffectiveQuality();
            break;
        case 'RESIZE':
            baseCanvasWidth = payload.width;
            baseCanvasHeight = payload.height;
            applyRenderScale();
            break;
        case 'STOP':
            isRunning = false;
            break;
    }
};
