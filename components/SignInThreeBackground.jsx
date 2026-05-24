"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function SignInThreeBackground({ className }) {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 800;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    // Lights
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 5, 5);
    scene.add(dir);
    const amb = new THREE.AmbientLight(0x111111, 0.7);
    scene.add(amb);

    // Spheres with emissive materials
    const createSphere = (color, radius, x, y, z) => {
      const geo = new THREE.SphereGeometry(radius, 48, 48);
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, roughness: 0.4, metalness: 0.2 });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      scene.add(m);
      return m;
    };

    const s1 = createSphere(0xa78bfa, 1.6, -2, 0.8, -1);
    const s2 = createSphere(0x06b6d4, 1.1, 1.6, -0.6, 0);
    const s3 = createSphere(0xff77ff, 0.9, 0.6, 1.2, -0.5);

    let raf = null;
    const clock = new THREE.Clock();
    function resize() {
      const w = mount.clientWidth || width;
      const h = mount.clientHeight || height;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function animate() {
      const t = clock.getElapsedTime();
      s1.rotation.y = t * 0.12;
      s2.rotation.y = -t * 0.14;
      s3.rotation.y = t * 0.2;
      s1.position.x = -2 + Math.sin(t * 0.6) * 0.2;
      s2.position.y = -0.6 + Math.cos(t * 0.8) * 0.18;
      s3.position.x = 0.6 + Math.sin(t * 0.9) * 0.16;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      renderer.domElement && mount.removeChild(renderer.domElement);
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className={className || 'absolute inset-0'} style={{ position: 'absolute', inset: 0 }} />;
}
