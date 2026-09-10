import * as THREE from 'three';

// PBR surface response with gently stepped direct diffuse illumination. The
// physical specular lobe stays continuous so wood, ceramic and metal stay distinct.
export function animeMaterial(color, extra = {}) {
 const material = new THREE.MeshStandardMaterial({ color, roughness: .83, metalness: 0, ...extra });
 material.onBeforeCompile = shader => {
  const physical = THREE.ShaderChunk.lights_physical_pars_fragment.replace(
   'reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );',
   `float celLevel = 0.10 + 0.26 * smoothstep(0.17, 0.24, dotNL)
      + 0.29 * smoothstep(0.44, 0.51, dotNL)
      + 0.35 * smoothstep(0.73, 0.80, dotNL);
    float stylizedNL = mix(dotNL, celLevel, 0.48);
    reflectedLight.directDiffuse += directLight.color * stylizedNL * BRDF_Lambert(material.diffuseColor);`
  );
  shader.fragmentShader = shader.fragmentShader.replace('#include <lights_physical_pars_fragment>', physical);
 };
 material.customProgramCacheKey = () => 'hakurei-anime-pbr-v1';
 return material;
}
