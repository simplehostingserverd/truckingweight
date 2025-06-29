import React from 'react';

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
 */

/**
 * Type definitions for Cesium
 * This file provides TypeScript type definitions for Cesium when used with Next.js
 */

// We're not using the module import approach anymore, so we don't need to declare the module
// Instead, we're using a global declaration for Cesium

declare namespace Cesium {
  const Ion: unknown;
  const Viewer: unknown;
  const Cartesian3: unknown;
  const HeadingPitchRoll: unknown;
  const Transforms: unknown;
  const VerticalOrigin: unknown;
  const LabelStyle: React.FormEvent;
  const Cartesian2: unknown;
  const Color: unknown;
  const Math: unknown;
  const createWorldTerrain: unknown;
  const createWorldTerrainAsync: unknown;
  const Entity: unknown;
  const PolylineGraphics: unknown;
  const PolylineDashMaterialProperty: unknown;
  const CallbackProperty: unknown;
  const JulianDate: React.FormEvent;
  const ClockRange: React.FormEvent;
  const TimeIntervalCollection: unknown;
  const TimeInterval: unknown;
  const SampledPositionProperty: unknown;
  const HorizontalOrigin: unknown;
  const BillboardCollection: unknown;
  const ImageMaterialProperty: unknown;
  const PolygonGraphics: unknown;
  const PolygonHierarchy: unknown;
  const Material: unknown;
  const MaterialProperty: unknown;
  const PolylineArrowMaterialProperty: unknown;
  const PolylineGlowMaterialProperty: unknown;
  const PolylineOutlineMaterialProperty: unknown;
  const ColorMaterialProperty: unknown;
  const PolylineMaterialAppearance: React.FormEvent;
  const PerInstanceColorAppearance: React.FormEvent;
  const GeometryInstance: React.FormEvent;
  const PolylineGeometry: unknown;
  const Primitive: React.FormEvent;
  const PrimitiveCollection: unknown;
  const Appearance: React.FormEvent;
  const ScreenSpaceEventHandler: unknown;
  const ScreenSpaceEventType: React.FormEvent;
  const defined: unknown;
  const ConstantPositionProperty: unknown;
  const SampledProperty: unknown;
  const Quaternion: unknown;
}

declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}
