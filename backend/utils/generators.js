/**
 * Generator Utilities
 * Functions for generating unique identifiers and numbers
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('./logger');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

/**
 * Generate a unique ticket number for weigh tickets
 * Format: WT-YYYYMMDD-XXXX (e.g., WT-20230615-0001)
 * @param {number} companyId - Company ID
 * @returns {string} - Unique ticket number
 */
const generateTicketNumber = async (companyId) => {
  try {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    // Get the latest ticket number for today
    const { data, error } = await supabase
      .from('weigh_tickets')
      .select('ticket_number')
      .like('ticket_number', `WT-${dateStr}-%`)
      .order('ticket_number', { ascending: false })
      .limit(1);

    let sequenceNumber = 1;

    if (!error && data && data.length > 0) {
      // Extract the sequence number from the latest ticket
      const latestTicket = data[0].ticket_number;
      const latestSequence = parseInt(latestTicket.split('-')[2]);
      sequenceNumber = latestSequence + 1;
    }

    // Format the sequence number with leading zeros
    const formattedSequence = sequenceNumber.toString().padStart(4, '0');

    // Generate the ticket number
    const ticketNumber = `WT-${dateStr}-${formattedSequence}`;

    return ticketNumber;
  } catch (error) {
    logger.error('Error generating ticket number:', error);
    // Fallback to a UUID-based number if there's an error
    return `WT-${Date.now()}-${uuidv4().substring(0, 4)}`;
  }
};

/**
 * Generate a unique permit number for city permits
 * Format: CP-CITYID-YYYYMM-XXXX (e.g., CP-001-202306-0001)
 * @param {number} cityId - City ID
 * @returns {string} - Unique permit number
 */
const generatePermitNumber = async (cityId) => {
  try {
    const date = new Date();
    const yearMonth = date.toISOString().slice(0, 7).replace(/-/g, '');
    const cityIdStr = cityId.toString().padStart(3, '0');

    // Get the latest permit number for this month and city
    const { data, error } = await supabase
      .from('city_permits')
      .select('permit_number')
      .like('permit_number', `CP-${cityIdStr}-${yearMonth}-%`)
      .order('permit_number', { ascending: false })
      .limit(1);

    let sequenceNumber = 1;

    if (!error && data && data.length > 0) {
      // Extract the sequence number from the latest permit
      const latestPermit = data[0].permit_number;
      const latestSequence = parseInt(latestPermit.split('-')[3]);
      sequenceNumber = latestSequence + 1;
    }

    // Format the sequence number with leading zeros
    const formattedSequence = sequenceNumber.toString().padStart(4, '0');

    // Generate the permit number
    const permitNumber = `CP-${cityIdStr}-${yearMonth}-${formattedSequence}`;

    return permitNumber;
  } catch (error) {
    logger.error('Error generating permit number:', error);
    // Fallback to a UUID-based number if there's an error
    return `CP-${cityId}-${Date.now()}-${uuidv4().substring(0, 4)}`;
  }
};

/**
 * Generate a unique violation number for city violations
 * Format: CV-CITYID-YYYYMM-XXXX (e.g., CV-001-202306-0001)
 * @param {number} cityId - City ID
 * @returns {string} - Unique violation number
 */
const generateViolationNumber = async (cityId) => {
  try {
    const date = new Date();
    const yearMonth = date.toISOString().slice(0, 7).replace(/-/g, '');
    const cityIdStr = cityId.toString().padStart(3, '0');

    // Get the latest violation number for this month and city
    const { data, error } = await supabase
      .from('city_violations')
      .select('violation_number')
      .like('violation_number', `CV-${cityIdStr}-${yearMonth}-%`)
      .order('violation_number', { ascending: false })
      .limit(1);

    let sequenceNumber = 1;

    if (!error && data && data.length > 0) {
      // Extract the sequence number from the latest violation
      const latestViolation = data[0].violation_number;
      const latestSequence = parseInt(latestViolation.split('-')[3]);
      sequenceNumber = latestSequence + 1;
    }

    // Format the sequence number with leading zeros
    const formattedSequence = sequenceNumber.toString().padStart(4, '0');

    // Generate the violation number
    const violationNumber = `CV-${cityIdStr}-${yearMonth}-${formattedSequence}`;

    return violationNumber;
  } catch (error) {
    logger.error('Error generating violation number:', error);
    // Fallback to a UUID-based number if there's an error
    return `CV-${cityId}-${Date.now()}-${uuidv4().substring(0, 4)}`;
  }
};

/**
 * Generate a unique city weigh ticket number
 * Format: CWT-CITYID-YYYYMMDD-XXXX (e.g., CWT-001-20230615-0001)
 * @param {number} cityId - City ID
 * @returns {string} - Unique city weigh ticket number
 */
const generateCityWeighTicketNumber = async (cityId) => {
  try {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const cityIdStr = cityId.toString().padStart(3, '0');

    // Get the latest ticket number for today and city
    const { data, error } = await supabase
      .from('city_weigh_tickets')
      .select('ticket_number')
      .like('ticket_number', `CWT-${cityIdStr}-${dateStr}-%`)
      .order('ticket_number', { ascending: false })
      .limit(1);

    let sequenceNumber = 1;

    if (!error && data && data.length > 0) {
      // Extract the sequence number from the latest ticket
      const latestTicket = data[0].ticket_number;
      const latestSequence = parseInt(latestTicket.split('-')[3]);
      sequenceNumber = latestSequence + 1;
    }

    // Format the sequence number with leading zeros
    const formattedSequence = sequenceNumber.toString().padStart(4, '0');

    // Generate the ticket number
    const ticketNumber = `CWT-${cityIdStr}-${dateStr}-${formattedSequence}`;

    return ticketNumber;
  } catch (error) {
    logger.error('Error generating city weigh ticket number:', error);
    // Fallback to a UUID-based number if there's an error
    return `CWT-${cityId}-${Date.now()}-${uuidv4().substring(0, 4)}`;
  }
};

module.exports = {
  generateTicketNumber,
  generatePermitNumber,
  generateViolationNumber,
  generateCityWeighTicketNumber,
};
