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
  const Ion: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Viewer: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Cartesian3: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const HeadingPitchRoll: unknown;
  const Transforms: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const VerticalOrigin: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const LabelStyle: React.FormEvent;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Cartesian2: unknown;
  const Color: unknown;
  const Math: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createWorldTerrain: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createWorldTerrainAsync: unknown;
  const Entity: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const PolylineGraphics: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const PolylineDashMaterialProperty: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const CallbackProperty: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const JulianDate: React.FormEvent;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ClockRange: React.FormEvent;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const TimeIntervalCollection: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const TimeInterval: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const SampledPositionProperty: unknown;
  const HorizontalOrigin: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const BillboardCollection: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ImageMaterialProperty: unknown;
  const PolygonGraphics: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const PolygonHierarchy: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Material: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MaterialProperty: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const PolylineArrowMaterialProperty: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const PolylineGlowMaterialProperty: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const PolylineOutlineMaterialProperty: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ColorMaterialProperty: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const PolylineMaterialAppearance: React.FormEvent;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const PerInstanceColorAppearance: React.FormEvent;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const GeometryInstance: React.FormEvent;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const PolylineGeometry: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Primitive: React.FormEvent;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const PrimitiveCollection: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Appearance: React.FormEvent;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ScreenSpaceEventHandler: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ScreenSpaceEventType: React.FormEvent;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const defined: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ConstantPositionProperty: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const SampledProperty: unknown;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Quaternion: unknown;
}

declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}
