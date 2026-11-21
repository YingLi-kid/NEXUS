import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import * as THREE from "three";

export interface SharedGeometries {
  node: THREE.SphereGeometry;
  halo: THREE.SphereGeometry;
  ring: THREE.TorusGeometry;
  core: THREE.SphereGeometry;
  ico: THREE.IcosahedronGeometry;
  coreRing: THREE.TorusGeometry;
}

const GeoContext = createContext<SharedGeometries | null>(null);

export function GeometryScope({ children }: { children: ReactNode }) {
  const geos = useMemo<SharedGeometries>(
    () => ({
      node: new THREE.SphereGeometry(0.42, 28, 28),
      halo: new THREE.SphereGeometry(0.76, 18, 18),
      ring: new THREE.TorusGeometry(0.72, 0.014, 8, 48),
      core: new THREE.SphereGeometry(0.55, 32, 32),
      ico: new THREE.IcosahedronGeometry(1.22, 1),
      coreRing: new THREE.TorusGeometry(1.62, 0.012, 8, 72),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geos).forEach((geometry) => geometry.dispose());
    },
    [geos],
  );
  return <GeoContext.Provider value={geos}>{children}</GeoContext.Provider>;
}

export function useGeometries(): SharedGeometries {
  const value = useContext(GeoContext);
  if (!value) throw new Error("Shared geometries are only available inside the universe scene.");
  return value;
}
