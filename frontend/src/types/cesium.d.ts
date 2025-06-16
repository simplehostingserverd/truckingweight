/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

/**
 * Type definitions for Cesium
 * This file provides TypeScript type definitions for Cesium when used with Next.js
 */

// We're not using the module import approach anymore, so we don't need to declare the module
// Instead, we're using a global declaration for Cesium

declare namespace Cesium {
  const Ion: any;
  const Viewer: any;
  const Cartesian3: any;
  const HeadingPitchRoll: any;
  const Transforms: any;
  const VerticalOrigin: any;
  const LabelStyle: any;
  const Cartesian2: any;
  const Color: any;
  const Math: any;
  const createWorldTerrain: any;
  const createWorldTerrainAsync: any;
  const Entity: any;
  const PolylineGraphics: any;
  const PolylineDashMaterialProperty: any;
  const CallbackProperty: any;
  const JulianDate: any;
  const ClockRange: any;
  const TimeIntervalCollection: any;
  const TimeInterval: any;
  const SampledPositionProperty: any;
  const HorizontalOrigin: any;
  const BillboardCollection: any;
  const ImageMaterialProperty: any;
  const PolygonGraphics: any;
  const PolygonHierarchy: any;
  const Material: any;
  const MaterialProperty: any;
  const PolylineArrowMaterialProperty: any;
  const PolylineGlowMaterialProperty: any;
  const PolylineOutlineMaterialProperty: any;
  const ColorMaterialProperty: any;
  const PolylineMaterialAppearance: any;
  const PerInstanceColorAppearance: any;
  const GeometryInstance: any;
  const PolylineGeometry: any;
  const Primitive: any;
  const PrimitiveCollection: any;
  const Appearance: any;
  const ScreenSpaceEventHandler: any;
  const ScreenSpaceEventType: any;
  const defined: any;
  const ConstantPositionProperty: any;
  const SampledProperty: any;
  const Quaternion: any;
}

declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}
