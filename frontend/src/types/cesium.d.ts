/**
 * Type definitions for Cesium
 * This file provides TypeScript type definitions for Cesium when used with Next.js
 */

declare module 'cesium' {
  export const Ion: any;
  export const Viewer: any;
  export const Cartesian3: any;
  export const HeadingPitchRoll: any;
  export const Transforms: any;
  export const VerticalOrigin: any;
  export const LabelStyle: any;
  export const Cartesian2: any;
  export const Color: any;
  export const Math: any;
  export const createWorldTerrain: any;
  export const createWorldTerrainAsync: any;
  export const Entity: any;
  export const PolylineGraphics: any;
  export const PolylineDashMaterialProperty: any;
  export const CallbackProperty: any;
  export const JulianDate: any;
  export const ClockRange: any;
  export const TimeIntervalCollection: any;
  export const TimeInterval: any;
  export const SampledPositionProperty: any;
  export const HorizontalOrigin: any;
  export const BillboardCollection: any;
  export const ImageMaterialProperty: any;
  export const PolygonGraphics: any;
  export const PolygonHierarchy: any;
  export const Material: any;
  export const MaterialProperty: any;
  export const PolylineArrowMaterialProperty: any;
  export const PolylineGlowMaterialProperty: any;
  export const PolylineOutlineMaterialProperty: any;
  export const ColorMaterialProperty: any;
  export const PolylineMaterialAppearance: any;
  export const PerInstanceColorAppearance: any;
  export const GeometryInstance: any;
  export const PolylineGeometry: any;
  export const Primitive: any;
  export const PrimitiveCollection: any;
  export const Appearance: any;
  export const Material: any;
  export const MaterialAppearance: any;
  export const EllipsoidSurfaceAppearance: any;
  export const PerInstanceColorAppearance: any;
  export const DebugAppearance: any;
  export const PolylineMaterialAppearance: any;
  export const PolylineColorAppearance: any;
  export const PolylineArrowMaterialProperty: any;
  export const PolylineGlowMaterialProperty: any;
  export const PolylineOutlineMaterialProperty: any;
  export const ColorMaterialProperty: any;
  export const PolylineMaterialAppearance: any;
  export const PerInstanceColorAppearance: any;
  export const GeometryInstance: any;
  export const PolylineGeometry: any;
  export const Primitive: any;
  export const PrimitiveCollection: any;
  export const Appearance: any;
  export const Material: any;
  export const MaterialAppearance: any;
  export const EllipsoidSurfaceAppearance: any;
  export const PerInstanceColorAppearance: any;
  export const DebugAppearance: any;
  export const PolylineMaterialAppearance: any;
  export const PolylineColorAppearance: any;
}

declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}
