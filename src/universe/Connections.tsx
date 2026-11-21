import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useNexus } from "@/stores/nexus-store";
import type { Vec3 } from "@/types/nexus";
import { cssColor, siteWorld } from "@/utils/space";

interface DrawnLink {
  a: Vec3;
  b: Vec3;
  color: string;
  strength: number;
}

export function Connections({ flow }: { flow: boolean }) {
  const websites = useNexus((state) => state.websites);
  const categories = useNexus((state) => state.categories);
  const connections = useNexus((state) => state.connections);
  const hidden = useNexus((state) => state.hiddenCategoryIds);

  const { links, tethers } = useMemo(() => {
    const visible = new Map<string, Vec3>();
    for (const site of websites) {
      if (!site.visible || hidden.includes(site.categoryId)) continue;
      visible.set(site.id, siteWorld(site, categories));
    }
    const nextLinks: DrawnLink[] = [];
    for (const link of connections) {
      const a = visible.get(link.sourceId);
      const b = visible.get(link.targetId);
      if (!a || !b) continue;
      const source = websites.find((site) => site.id === link.sourceId);
      const category = categories.find((item) => item.id === source?.categoryId);
      nextLinks.push({
        a,
        b,
        color: cssColor(category?.color ?? "#00d9ff"),
        strength: link.strength,
      });
    }
    const nextTethers: DrawnLink[] = categories
      .filter((category) => !hidden.includes(category.id))
      .map((category) => ({
        a: [0, 0, 0] as Vec3,
        b: category.position,
        color: cssColor(category.color),
        strength: 0.2,
      }));
    return { links: nextLinks, tethers: nextTethers };
  }, [websites, categories, connections, hidden]);

  return (
    <group>
      <SegmentSet links={tethers} opacity={0.14} />
      <SegmentSet links={links} opacity={0.55} />
      {flow ? <Sparks links={links} /> : null}
    </group>
  );
}

function SegmentSet({ links, opacity }: { links: DrawnLink[]; opacity: number }) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color();
    for (const link of links) {
      positions.push(link.a[0], link.a[1], link.a[2], link.b[0], link.b[1], link.b[2]);
      color.set(link.color);
      colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
    }
    const next = new THREE.BufferGeometry();
    next.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    next.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return next;
  }, [links]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  if (links.length === 0) return null;

  return (
    <lineSegments geometry={geometry} dispose={null}>
      <lineBasicMaterial vertexColors transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
}

function Sparks({ links }: { links: DrawnLink[] }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(Math.max(links.length, 1) * 3);
    const next = new THREE.BufferGeometry();
    next.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return next;
  }, [links.length]);
  const phases = useMemo(() => links.map((_, index) => index / Math.max(links.length, 1)), [links]);
  const linksRef = useRef(links);
  linksRef.current = links;

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    const attribute = geometry.getAttribute("position");
    if (!(attribute instanceof THREE.BufferAttribute)) return;
    const array = attribute.array as Float32Array;
    const current = linksRef.current;
    const time = state.clock.elapsedTime;
    for (let index = 0; index < current.length; index += 1) {
      const link = current[index];
      if (!link) continue;
      const travel = (phases[index] + time * (0.08 + link.strength * 0.12)) % 1;
      const ax = link.a[0];
      const ay = link.a[1];
      const az = link.a[2];
      array[index * 3] = ax + (link.b[0] - ax) * travel;
      array[index * 3 + 1] = ay + (link.b[1] - ay) * travel;
      array[index * 3 + 2] = az + (link.b[2] - az) * travel;
    }
    attribute.needsUpdate = true;
  });

  if (links.length === 0) return null;

  return (
    <points geometry={geometry} dispose={null} frustumCulled={false}>
      <pointsMaterial color="#e7eef8" size={0.18} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
    </points>
  );
}
