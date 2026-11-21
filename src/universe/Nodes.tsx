import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useNexus } from "@/stores/nexus-store";
import { categoryName as localizeCategory, siteName as localizeSite } from "@/lib/localize";
import { useI18n } from "@/lib/use-i18n";
import { CORE_ID, type Category, type Website } from "@/types/nexus";
import { useGeometries } from "@/universe/geometry";
import { scenePointer } from "@/universe/scene-pointer";
import { cssColor } from "@/utils/space";
import { textMatches } from "@/utils/search";
import { openSafeUrl } from "@/utils/url";

export function Horizon() {
  return (
    <group position={[0, -3.4, 0]}>
      {[8, 16, 26].map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.012, 6, 96]} />
          <meshBasicMaterial color="#00d9ff" transparent opacity={0.12} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function useGlowTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) return null;
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(0,217,255,0.9)");
    gradient.addColorStop(0.4, "rgba(0,217,255,0.18)");
    gradient.addColorStop(1, "rgba(0,217,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    const next = new THREE.CanvasTexture(canvas);
    next.colorSpace = THREE.SRGBColorSpace;
    return next;
  }, []);
  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

export function CoreNode({ reduced }: { reduced: boolean }) {
  const geos = useGeometries();
  const glow = useGlowTexture();
  const group = useRef<THREE.Group>(null);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const focusOn = useNexus((state) => state.focusOn);
  const selected = useNexus((state) => state.selectedId === CORE_ID);
  const { t } = useI18n();

  useFrame((_, delta) => {
    const current = group.current;
    if (!current || reducedRef.current) return;
    current.rotation.y += Math.min(delta, 0.05) * 0.18;
    current.rotation.x = Math.sin(current.rotation.y) * 0.08;
  });

  return (
    <group>
      {glow ? (
        <sprite scale={[7.5, 7.5, 1]}>
          <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ) : null}
      <group ref={group}>
        <mesh geometry={geos.ico} dispose={null}>
          <meshBasicMaterial color="#00d9ff" wireframe transparent opacity={0.45} toneMapped={false} />
        </mesh>
        <mesh geometry={geos.coreRing} dispose={null} rotation={[Math.PI / 2.3, 0.2, 0]}>
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.55} toneMapped={false} />
        </mesh>
        <mesh geometry={geos.core} dispose={null}>
          <meshBasicMaterial color={selected ? "#e7eef8" : "#00d9ff"} toneMapped={false} />
        </mesh>
      </group>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          if (scenePointer.dragged) return;
          focusOn(CORE_ID);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[1.7, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html position={[0, 2.15, 0]} center distanceFactor={26} zIndexRange={[2, 0]} style={{ pointerEvents: "none" }}>
        <div className="font-display text-sm font-semibold text-cyan">{t("universe.core")}</div>
      </Html>
    </group>
  );
}

export function Galaxies({ reduced }: { reduced: boolean }) {
  const categories = useNexus((state) => state.categories);
  const websites = useNexus((state) => state.websites);
  const hidden = useNexus((state) => state.hiddenCategoryIds);
  const query = useNexus((state) => state.query);

  return (
    <group>
      {categories
        .filter((category) => !hidden.includes(category.id))
        .map((category) => (
          <Galaxy
            key={category.id}
            category={category}
            websites={websites.filter((site) => site.visible && site.categoryId === category.id)}
            query={query}
            reduced={reduced}
          />
        ))}
    </group>
  );
}

function Galaxy({
  category,
  websites,
  query,
  reduced,
}: {
  category: Category;
  websites: Website[];
  query: string;
  reduced: boolean;
}) {
  const color = cssColor(category.color);
  const lang = useNexus((state) => state.lang);
  const label = localizeCategory(lang, category);
  return (
    <group position={category.position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.15, 0.012, 8, 80]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <Html position={[0, 2.45, 0]} center distanceFactor={28} zIndexRange={[2, 0]} style={{ pointerEvents: "none" }}>
        <div className="font-display text-sm font-semibold" style={{ color }}>
          {label}
        </div>
      </Html>
      {websites.map((site) => (
        <SiteNode
          key={site.id}
          site={site}
          color={color}
          categoryName={category.name}
          categoryNameZh={category.nameZh}
          query={query}
          reduced={reduced}
        />
      ))}
    </group>
  );
}

function SiteNode({
  site,
  color,
  categoryName,
  categoryNameZh,
  query,
  reduced,
}: {
  site: Website;
  color: string;
  categoryName: string;
  categoryNameZh?: string;
  query: string;
  reduced: boolean;
}) {
  const geos = useGeometries();
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [hot, setHot] = useState(false);
  const selected = useNexus((state) => state.selectedId === site.id);
  const focusOn = useNexus((state) => state.focusOn);
  const markVisited = useNexus((state) => state.markVisited);
  const lang = useNexus((state) => state.lang);
  const dimmed =
    query.trim().length > 0 &&
    !textMatches(
      [site.name, site.nameZh ?? "", site.description, site.descriptionZh ?? "", site.tags.join(" "), site.url, categoryName, categoryNameZh ?? ""],
      query,
    );
  const world = useMemo(() => site.position, [site.position]);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  useFrame((_, delta) => {
    const current = group.current;
    if (!current) return;
    const step = Math.min(delta, 0.05);
    const target = selected ? 1.22 : hot ? 1.1 : 1;
    const scale = THREE.MathUtils.damp(current.scale.x, target, 7, step);
    current.scale.setScalar(scale);
    if (ring.current && !reducedRef.current) ring.current.rotation.z += step * 0.4;
  });

  return (
    <group position={world} ref={group}>
      <mesh
        geometry={geos.node}
        dispose={null}
        onClick={(event) => {
          event.stopPropagation();
          if (scenePointer.dragged) return;
          focusOn(site.id);
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();
          if (openSafeUrl(site.url)) markVisited(site.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHot(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHot(false);
          document.body.style.cursor = "";
        }}
      >
        <meshBasicMaterial color={color} transparent={dimmed} opacity={dimmed ? 0.16 : 1} toneMapped={false} />
      </mesh>
      <mesh geometry={geos.halo} dispose={null}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={selected ? 0.32 : dimmed ? 0.04 : 0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {site.featured || selected ? (
        <mesh ref={ring} geometry={geos.ring} dispose={null} rotation={[Math.PI / 2.4, 0.2, 0]}>
          <meshBasicMaterial color={selected ? "#e7eef8" : color} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      ) : null}
      {hot || selected ? (
        <Html position={[0, 0.95, 0]} center zIndexRange={[3, 0]} style={{ pointerEvents: "none" }}>
          <div className="glass whitespace-nowrap rounded-full px-2.5 py-1 text-xs text-fg">{localizeSite(lang, site)}</div>
        </Html>
      ) : null}
    </group>
  );
}
