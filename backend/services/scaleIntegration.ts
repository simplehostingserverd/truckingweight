/**
 * Scale Integration Service
 *
 * This service handles integration with various scale systems:
 * 1. Direct API integration with digital truck scales
 * 2. IoT sensor data processing
 * 3. Camera-based weight ticket scanning
 */

import axios from 'axios'
import { createHash } from 'crypto'
import prisma from '../config/prisma'
import { setCompanyContext } from '../config/prisma'
import { logger } from '../utils/logger'

// Supported scale manufacturers and their integration methods
const SUPPORTED_SCALES = {
  RICE_LAKE: 'rice_lake',
  METTLER_TOLEDO: 'mettler_toledo',
  AVERY_WEIGH_TRONIX: 'avery_weigh_tronix',
  FAIRBANKS: 'fairbanks',
  CARDINAL: 'cardinal',
  GENERIC_MODBUS: 'generic_modbus',
  GENERIC_HTTP: 'generic_http',
}

// IoT hardware integration options
const IOT_HARDWARE = {
  RASPBERRY_PI: 'raspberry_pi',
  ARDUINO: 'arduino',
  ESP32: 'esp32',
  PARTICLE: 'particle',
  CUSTOM_BOARD: 'custom_board',
  CITY_SCALE_SYSTEM: 'city_scale_system',
}

// Scale reading types
const READING_TYPES = {
  GROSS: 'gross',
  TARE: 'tare',
  AXLE: 'axle',
  TEST: 'test',
}

/**
 * Get weight reading from a scale via API
 * @param scaleId - The ID of the scale to read from
 * @param readingType - The type of reading (gross, tare, axle)
 * @param companyId - The company ID for context
 * @param isAdmin - Whether the user is an admin
 */
export const export const getScaleReading = async (
  scaleId: number,
  readingType: string,
  companyId: number,
  isAdmin: boolean = false
): Promise<): Promise<): Promise<): Promise<): ): ): Promise<{ success: boolean; reading?: number; error?: string; rawData?: any }> => {> {> { {> { {> {
  try {
    // Set company context for Prisma queries
    setCompanyContext(companyId, isAdmin)

    // Get scale information
    const scale = await prisma.scales.findUnique({
      where: { id: scaleId },
    })

    if (!scale) {
      return { success: false, error: 'Scale not found' }
    }

    // Check if scale is active
    if (scale.status !== 'Active') {
      return { success: false, error: `Scale is ${scale.status}` }
    }

    let reading: number | undefined
    let rawData: any

    // Handle different scale types
    switch (scale.scale_type.toLowerCase()) {
      case SUPPORTED_SCALES.RICE_LAKE:
        ({ reading, rawData } = await getRiceLakeReading(scale, readingType))
        break
      case SUPPORTED_SCALES.METTLER_TOLEDO:
        ({ reading, rawData } = await getMettlerToledoReading(scale, readingType))
        break
      case SUPPORTED_SCALES.AVERY_WEIGH_TRONIX:
        ({ reading, rawData } = await getAveryWeighTronixReading(scale, readingType))
        break
      case SUPPORTED_SCALES.FAIRBANKS:
        ({ reading, rawData } = await getFairbanksReading(scale, readingType))
        break
      case SUPPORTED_SCALES.CARDINAL:
        ({ reading, rawData } = await getCardinalReading(scale, readingType))
        break
      case SUPPORTED_SCALES.GENERIC_HTTP:
        ({ reading, rawData } = await getGenericHttpReading(scale, readingType))
        break
      case SUPPORTED_SCALES.GENERIC_MODBUS:
        ({ reading, rawData } = await getGenericModbusReading(scale, readingType))
        break
      default:
        return { success: false, error: 'Unsupported scale type' }
    }

    if (!reading) {
      return { success: false, error: 'Failed to get reading from scale' }
    }

    // Save the reading to the database
    const scaleReading = await prisma.scale_readings.create({
      data: {
        scale_id: scaleId,
        reading_value: reading,
        reading_type: readingType,
        reading_source: 'api',
        raw_data: rawData,
        company_id: companyId,
      },
    })

    return { success: true, reading, rawData }
  } catch (error: any) {
    logger.error(`Error getting scale reading: ${error.message}`, { error })
    return { success: false, error: error.message }
  }
}

/**
 * Process IoT sensor data for weight readings
 * @param sensorData - The raw sensor data
 * @param scaleId - The ID of the scale
 * @param companyId - The company ID for context
 */
export const export const processIoTSensorData = async (
  sensorData: any,
  scaleId: number,
  companyId: number
): Promise<): Promise<): Promise<): Promise<): ): ): Promise<{ success: boolean; reading?: number; error?: string }> => {> {> { {> { {> {
  try {
    // Set company context for Prisma queries
    setCompanyContext(companyId)

    // Get scale information
    const scale = await prisma.scales.findUnique({
      where: { id: scaleId },
    })

    if (!scale) {
      return { success: false, error: 'Scale not found' }
    }

    // Validate sensor data
    if (!sensorData || !sensorData.weight) {
      return { success: false, error: 'Invalid sensor data' }
    }

    const reading = parseFloat(sensorData.weight)

    // Save the reading to the database
    await prisma.scale_readings.create({
      data: {
        scale_id: scaleId,
        reading_value: reading,
        reading_type: sensorData.type || READING_TYPES.GROSS,
        reading_source: 'iot',
        raw_data: sensorData,
        company_id: companyId,
      },
    })

    return { success: true, reading }
  } catch (error: any) {
    logger.error(`Error processing IoT sensor data: ${error.message}`, { error })
    return { success: false, error: error.message }
  }
}

/**
 * Process camera-scanned weight ticket
 * @param ticketImageUrl - URL to the scanned ticket image
 * @param companyId - The company ID for context
 */
export const export const processCameraScannedTicket = async (
  ticketImageUrl: string,
  companyId: number
): Promise<): Promise<): Promise<): Promise<): ): ): Promise<{ success: boolean; ticketData?: any; error?: string }> => {> {> { {> { {> {
  try {
    // Set company context for Prisma queries
    setCompanyContext(companyId)

    // TODO: Implement OCR processing for ticket images
    // This would typically use a third-party OCR service or library

    // For now, return a mock response
    const ticketData = {
      gross_weight: 32500,
      tare_weight: 15000,
      net_weight: 17500,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
    }

    return { success: true, ticketData }
  } catch (error: any) {
    logger.error(`Error processing camera-scanned ticket: ${error.message}`, { error })
    return { success: false, error: error.message }
  }
}

/**
 * Get available IoT hardware integration options
 * @returns List of available hardware options with details
 */
export const getAvailableHardwareOptions = (): { success: boolean; options?: any[]; error?: string } => {
  try {
    const options = [
      {
        id: IOT_HARDWARE.RASPBERRY_PI,
        name: 'Raspberry Pi',
        description: 'Raspberry Pi with load cell HAT or ADC converter',
        connectionTypes: ['USB', 'Ethernet', 'WiFi', 'Bluetooth'],
        supportedSensors: ['Load Cell', 'Strain Gauge', 'Digital Scale'],
        setupInstructions: 'https://docs.example.com/setup/raspberry-pi',
        isCityScaleCompatible: false
      },
      {
        id: IOT_HARDWARE.ARDUINO,
        name: 'Arduino',
        description: 'Arduino with HX711 load cell amplifier',
        connectionTypes: ['USB', 'Serial'],
        supportedSensors: ['Load Cell', 'Strain Gauge'],
        setupInstructions: 'https://docs.example.com/setup/arduino',
        isCityScaleCompatible: false
      },
      {
        id: IOT_HARDWARE.ESP32,
        name: 'ESP32',
        description: 'ESP32 with HX711 and WiFi connectivity',
        connectionTypes: ['WiFi', 'Bluetooth'],
        supportedSensors: ['Load Cell', 'Strain Gauge'],
        setupInstructions: 'https://docs.example.com/setup/esp32',
        isCityScaleCompatible: false
      },
      {
        id: IOT_HARDWARE.PARTICLE,
        name: 'Particle IoT',
        description: 'Particle Photon/Electron with cellular connectivity',
        connectionTypes: ['WiFi', 'Cellular'],
        supportedSensors: ['Load Cell', 'Strain Gauge', 'Digital Scale'],
        setupInstructions: 'https://docs.example.com/setup/particle',
        isCityScaleCompatible: false
      },
      {
        id: IOT_HARDWARE.CUSTOM_BOARD,
        name: 'Custom IoT Board',
        description: 'Custom-designed IoT board for industrial scales',
        connectionTypes: ['Ethernet', 'WiFi', 'Cellular', 'LoRaWAN'],
        supportedSensors: ['Load Cell', 'Strain Gauge', 'Digital Scale', 'Analog Output'],
        setupInstructions: 'https://docs.example.com/setup/custom-board',
        isCityScaleCompatible: false
      },
      {
        id: IOT_HARDWARE.CITY_SCALE_SYSTEM,
        name: 'City Scale System',
        description: 'Specialized hardware for municipal weighing stations',
        connectionTypes: ['Ethernet', 'Fiber', 'Cellular'],
        supportedSensors: ['Industrial Load Cell', 'Multi-Axle System', 'ALPR Camera'],
        setupInstructions: 'https://docs.example.com/setup/city-scale',
        isCityScaleCompatible: true
      }
    ]

    return { success: true, options }
  } catch (error: any) {
    logger.error(`Error getting hardware options: ${error.message}`, { error })
    return { success: false, error: error.message }
  }
}

/**
 * Configure IoT hardware for a scale
 * @param scaleId - The ID of the scale
 * @param hardwareType - The type of hardware to configure
 * @param config - Hardware configuration parameters
 * @param companyId - The company ID for context
 * @param isAdmin - Whether the user is an admin
 */
export const export const configureIoTHardware = async (
  scaleId: number,
  hardwareType: string,
  config: any,
  companyId: number,
  isAdmin: boolean = false
): Promise<): Promise<): Promise<): Promise<): ): ): Promise<{ success: boolean; message?: string; error?: string }> => {> {> { {> { {> {
  try {
    // Set company context for Prisma queries
    setCompanyContext(companyId, isAdmin)

    // Get scale information
    const scale = await prisma.scales.findUnique({
      where: { id: scaleId },
    })

    if (!scale) {
      return { success: false, error: 'Scale not found' }
    }

    // Validate hardware type
    const hardwareOptions = getAvailableHardwareOptions()
    const validHardware = hardwareOptions.options?.find(option => option.id === hardwareType)

    if (!validHardware) {
      return { success: false, error: 'Invalid hardware type' }
    }

    // Save hardware configuration to the database
    await prisma.scales.update({
      where: { id: scaleId },
      data: {
        hardware_type: hardwareType,
        hardware_config: config,
        updated_at: new Date(),
      },
    })

    return {
      success: true,
      message: `Successfully configured ${validHardware.name} for scale ${scale.name}`
    }
  } catch (error: any) {
    logger.error(`Error configuring IoT hardware: ${error.message}`, { error })
    return { success: false, error: error.message }
  }
}

// Implementation of scale-specific reading functions
// These would be implemented based on each manufacturer's API specifications

async function getRiceLakeReading(scale: any, readingType: string): Promise<): Promise<): Promise<): Promise<): ): ): Promise<{ reading?: number; rawData?: any }> => {> {> { {> { {> {
  try {
    // Mock implementation - would be replaced with actual API call
    const response = await axios.get(`${scale.api_endpoint}/weight`, {
      headers: {
        'Authorization': `Bearer ${scale.api_key}`,
        'Content-Type': 'application/json',
      },
    })

    return {
      reading: response.data.weight,
      rawData: response.data,
    }
  } catch (error) {
    logger.error(`Error getting Rice Lake reading: ${error}`)
    return {}
  }
}

async function getMettlerToledoReading(scale: any, readingType: string): Promise<): Promise<): Promise<): Promise<): ): ): Promise<{ reading?: number; rawData?: any }> => {> {> { {> { {> {
  // Mock implementation
  return {
    reading: 32500,
    rawData: { weight: 32500, unit: 'lb', timestamp: new Date().toISOString() },
  }
}

async function getAveryWeighTronixReading(scale: any, readingType: string): Promise<): Promise<): Promise<): Promise<): ): ): Promise<{ reading?: number; rawData?: any }> => {> {> { {> { {> {
  // Mock implementation
  return {
    reading: 32500,
    rawData: { weight: 32500, unit: 'lb', timestamp: new Date().toISOString() },
  }
}

async function getFairbanksReading(scale: any, readingType: string): Promise<): Promise<): Promise<): Promise<): ): ): Promise<{ reading?: number; rawData?: any }> => {> {> { {> { {> {
  // Mock implementation
  return {
    reading: 32500,
    rawData: { weight: 32500, unit: 'lb', timestamp: new Date().toISOString() },
  }
}

async function getCardinalReading(scale: any, readingType: string): Promise<): Promise<): Promise<): Promise<): ): ): Promise<{ reading?: number; rawData?: any }> => {> {> { {> { {> {
  // Mock implementation
  return {
    reading: 32500,
    rawData: { weight: 32500, unit: 'lb', timestamp: new Date().toISOString() },
  }
}

async function getGenericHttpReading(scale: any, readingType: string): Promise<): Promise<): Promise<): Promise<): ): ): Promise<{ reading?: number; rawData?: any }> => {> {> { {> { {> {
  try {
    const response = await axios.get(scale.api_endpoint, {
      headers: {
        'Authorization': `Bearer ${scale.api_key}`,
        'Content-Type': 'application/json',
      },
    })

    // Parse the response based on the expected format
    const reading = parseFloat(response.data.weight || response.data.value || '0')

    return {
      reading,
      rawData: response.data,
    }
  } catch (error) {
    logger.error(`Error getting generic HTTP reading: ${error}`)
    return {}
  }
}

async function getGenericModbusReading(scale: any, readingType: string): Promise<): Promise<): Promise<): Promise<): ): ): Promise<{ reading?: number; rawData?: any }> => {> {> { {> { {> {
  // Mock implementation - would require a Modbus TCP/IP client library
  return {
    reading: 32500,
    rawData: { weight: 32500, unit: 'lb', timestamp: new Date().toISOString() },
  }
}
