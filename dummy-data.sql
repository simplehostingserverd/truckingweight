-- Realistic Dummy Data for Trucking Weight Application
-- This script adds realistic test data for companies, users, vehicles, drivers, weights, and loads

-- Insert Companies
INSERT INTO companies (name, address, contact_email, contact_phone)
VALUES
  ('Midwest Express Logistics', '4287 Industrial Parkway, Columbus, OH 43228', 'dispatch@midwestexpress.com', '614-555-7823'),
  ('Mountain Range Transport', '1650 Warehouse Ave, Denver, CO 80216', 'operations@mountainrangetransport.com', '303-555-4192'),
  ('Coastal Freight Systems', '8733 Port Road, Savannah, GA 31405', 'info@coastalfreight.com', '912-555-3087'),
  ('Heartland Hauling Inc.', '2915 Trucking Blvd, Kansas City, MO 64108', 'dispatch@heartlandhauling.com', '816-555-9234'),
  ('Northern Star Carriers', '5501 Distribution Way, Minneapolis, MN 55401', 'fleet@northernstarcarriers.com', '612-555-6741');

-- Insert Users (using UUIDs that would be created by Supabase Auth)
-- Note: In a real scenario, these would be created through the auth system
-- The UUIDs below are examples and would be replaced by actual auth user IDs
INSERT INTO users (id, name, email, company_id, is_admin)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Michael Rodriguez', 'mrodriguez@midwestexpress.com', 1, true),
  ('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sjohnson@midwestexpress.com', 1, false),
  ('550e8400-e29b-41d4-a716-446655440002', 'David Thompson', 'dthompson@mountainrangetransport.com', 2, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Jennifer Wilson', 'jwilson@mountainrangetransport.com', 2, false),
  ('550e8400-e29b-41d4-a716-446655440004', 'Robert Garcia', 'rgarcia@coastalfreight.com', 3, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Lisa Martinez', 'lmartinez@coastalfreight.com', 3, false),
  ('550e8400-e29b-41d4-a716-446655440006', 'James Anderson', 'janderson@heartlandhauling.com', 4, true),
  ('550e8400-e29b-41d4-a716-446655440007', 'Patricia Taylor', 'ptaylor@heartlandhauling.com', 4, false),
  ('550e8400-e29b-41d4-a716-446655440008', 'John Williams', 'jwilliams@northernstarcarriers.com', 5, true),
  ('550e8400-e29b-41d4-a716-446655440009', 'Elizabeth Brown', 'ebrown@northernstarcarriers.com', 5, false);

-- Insert Vehicles for each company
INSERT INTO vehicles (name, type, license_plate, vin, make, model, year, status, max_weight, company_id)
VALUES
  -- Midwest Express Logistics
  ('Truck 101', 'Semi', 'OH-TR101', '1FUJGLDR7CLBP8834', 'Freightliner', 'Cascadia', 2020, 'Active', '80000', 1),
  ('Truck 102', 'Semi', 'OH-TR102', '1XKYDP9X5MJ372655', 'Kenworth', 'T680', 2021, 'Active', '80000', 1),
  ('Truck 103', 'Box Truck', 'OH-BX103', '1HTMMAAL97H435982', 'International', '4300', 2019, 'Maintenance', '26000', 1),
  
  -- Mountain Range Transport
  ('Alpine 1', 'Semi', 'CO-ALP01', '1XKAD49X9EJ389211', 'Peterbilt', '579', 2022, 'Active', '80000', 2),
  ('Alpine 2', 'Semi', 'CO-ALP02', '1FUJGHDV0NLBP3322', 'Freightliner', 'Cascadia', 2021, 'Active', '80000', 2),
  ('Rocky 3', 'Flatbed', 'CO-RKY03', '1HTWYAHT5JH567123', 'Volvo', 'VNL', 2020, 'Active', '80000', 2),
  
  -- Coastal Freight Systems
  ('Seabreeze 1', 'Semi', 'GA-SEA01', '1XKYDP9X8LJ123456', 'Kenworth', 'T680', 2021, 'Active', '80000', 3),
  ('Seabreeze 2', 'Semi', 'GA-SEA02', '1FUJGLBG3LLBP7788', 'Freightliner', 'Cascadia', 2020, 'Maintenance', '80000', 3),
  ('Harbor 3', 'Tanker', 'GA-HRB03', '1HTMMAAN6JH298765', 'Mack', 'Anthem', 2019, 'Active', '80000', 3),
  
  -- Heartland Hauling Inc.
  ('Midwest 1', 'Semi', 'MO-MID01', '1XKAD49X1GJ654321', 'Peterbilt', '389', 2020, 'Active', '80000', 4),
  ('Midwest 2', 'Semi', 'MO-MID02', '1FUJGHDV9FLBP4455', 'Freightliner', 'Cascadia', 2019, 'Active', '80000', 4),
  ('Plains 3', 'Reefer', 'MO-PLN03', '1HTWYAHT7KH112233', 'Volvo', 'VNL', 2021, 'Active', '80000', 4),
  
  -- Northern Star Carriers
  ('North 1', 'Semi', 'MN-NTH01', '1XKYDP9X3NJ987654', 'Kenworth', 'W900', 2022, 'Active', '80000', 5),
  ('North 2', 'Semi', 'MN-NTH02', '1FUJGLBG5MLBP6677', 'Freightliner', 'Cascadia', 2021, 'Active', '80000', 5),
  ('Polar 3', 'Flatbed', 'MN-POL03', '1HTMMAAN8LH445566', 'Mack', 'Anthem', 2020, 'Maintenance', '80000', 5);

-- Insert Drivers for each company
INSERT INTO drivers (name, license_number, license_expiry, phone, email, status, company_id)
VALUES
  -- Midwest Express Logistics
  ('Frank Miller', 'OH123456789', '2025-06-15', '614-555-1234', 'fmiller@midwestexpress.com', 'Active', 1),
  ('Carlos Sanchez', 'OH234567890', '2024-08-22', '614-555-2345', 'csanchez@midwestexpress.com', 'Active', 1),
  ('Diane Lewis', 'OH345678901', '2026-03-10', '614-555-3456', 'dlewis@midwestexpress.com', 'On Leave', 1),
  
  -- Mountain Range Transport
  ('Steve Johnson', 'CO12345678', '2024-11-05', '303-555-7890', 'sjohnson@mountainrangetransport.com', 'Active', 2),
  ('Maria Gonzalez', 'CO23456789', '2025-04-18', '303-555-8901', 'mgonzalez@mountainrangetransport.com', 'Active', 2),
  ('Thomas Wright', 'CO34567890', '2024-07-30', '303-555-9012', 'twright@mountainrangetransport.com', 'Active', 2),
  
  -- Coastal Freight Systems
  ('Raymond Chen', 'GA5678901234', '2025-09-12', '912-555-4567', 'rchen@coastalfreight.com', 'Active', 3),
  ('Jasmine Patel', 'GA6789012345', '2024-12-03', '912-555-5678', 'jpatel@coastalfreight.com', 'Active', 3),
  ('Derek Washington', 'GA7890123456', '2026-01-25', '912-555-6789', 'dwashington@coastalfreight.com', 'Inactive', 3),
  
  -- Heartland Hauling Inc.
  ('Kevin O''Brien', 'MO456789012', '2025-05-20', '816-555-7890', 'kobrien@heartlandhauling.com', 'Active', 4),
  ('Sophia Rodriguez', 'MO567890123', '2024-10-15', '816-555-8901', 'srodriguez@heartlandhauling.com', 'Active', 4),
  ('Marcus Johnson', 'MO678901234', '2026-02-28', '816-555-9012', 'mjohnson@heartlandhauling.com', 'Active', 4),
  
  -- Northern Star Carriers
  ('Olivia Larson', 'MN34567890', '2025-08-07', '612-555-0123', 'olarson@northernstarcarriers.com', 'Active', 5),
  ('William Peterson', 'MN45678901', '2024-11-22', '612-555-1234', 'wpeterson@northernstarcarriers.com', 'Active', 5),
  ('Emma Nguyen', 'MN56789012', '2026-04-15', '612-555-2345', 'enguyen@northernstarcarriers.com', 'On Leave', 5);

-- Insert Weights for each company
INSERT INTO weights (vehicle_id, weight, date, time, driver_id, status, company_id)
VALUES
  -- Midwest Express Logistics
  (1, '32500', '2023-10-15', '08:30:00', 1, 'Compliant', 1),
  (2, '35200', '2023-10-16', '09:45:00', 2, 'Warning', 1),
  (1, '31800', '2023-10-18', '07:15:00', 1, 'Compliant', 1),
  (3, '24500', '2023-10-20', '10:30:00', 3, 'Compliant', 1),
  (2, '36800', '2023-10-22', '14:20:00', 2, 'Non-Compliant', 1),
  
  -- Mountain Range Transport
  (4, '33400', '2023-10-14', '07:45:00', 4, 'Compliant', 2),
  (5, '34900', '2023-10-17', '11:30:00', 5, 'Warning', 2),
  (6, '32200', '2023-10-19', '08:50:00', 6, 'Compliant', 2),
  (4, '35600', '2023-10-21', '13:15:00', 4, 'Warning', 2),
  (5, '31500', '2023-10-23', '09:40:00', 5, 'Compliant', 2),
  
  -- Coastal Freight Systems
  (7, '34200', '2023-10-15', '10:15:00', 7, 'Warning', 3),
  (8, '31900', '2023-10-17', '08:30:00', 8, 'Compliant', 3),
  (9, '33700', '2023-10-19', '12:45:00', 7, 'Compliant', 3),
  (7, '36200', '2023-10-21', '14:50:00', 8, 'Non-Compliant', 3),
  (9, '32800', '2023-10-23', '09:20:00', 7, 'Compliant', 3),
  
  -- Heartland Hauling Inc.
  (10, '33100', '2023-10-16', '07:30:00', 10, 'Compliant', 4),
  (11, '35800', '2023-10-18', '11:45:00', 11, 'Warning', 4),
  (12, '32400', '2023-10-20', '09:15:00', 12, 'Compliant', 4),
  (10, '34500', '2023-10-22', '13:30:00', 10, 'Warning', 4),
  (11, '31700', '2023-10-24', '08:45:00', 11, 'Compliant', 4),
  
  -- Northern Star Carriers
  (13, '32900', '2023-10-15', '09:30:00', 13, 'Compliant', 5),
  (14, '35400', '2023-10-17', '12:15:00', 14, 'Warning', 5),
  (15, '33600', '2023-10-19', '10:45:00', 13, 'Compliant', 5),
  (13, '36500', '2023-10-21', '15:20:00', 14, 'Non-Compliant', 5),
  (14, '32200', '2023-10-23', '08:10:00', 13, 'Compliant', 5);

-- Insert Loads for each company
INSERT INTO loads (description, origin, destination, weight, vehicle_id, driver_id, status, company_id)
VALUES
  -- Midwest Express Logistics
  ('Consumer Electronics', 'Columbus, OH', 'Chicago, IL', '28500', 1, 1, 'Delivered', 1),
  ('Auto Parts', 'Detroit, MI', 'Columbus, OH', '31200', 2, 2, 'Delivered', 1),
  ('Household Goods', 'Columbus, OH', 'Indianapolis, IN', '27800', 1, 1, 'In Transit', 1),
  ('Office Supplies', 'Cincinnati, OH', 'Columbus, OH', '22500', 3, 3, 'Pending', 1),
  ('Manufacturing Equipment', 'Columbus, OH', 'Cleveland, OH', '32800', 2, 2, 'Pending', 1),
  
  -- Mountain Range Transport
  ('Construction Materials', 'Denver, CO', 'Salt Lake City, UT', '29400', 4, 4, 'Delivered', 2),
  ('Retail Merchandise', 'Phoenix, AZ', 'Denver, CO', '30900', 5, 5, 'In Transit', 2),
  ('Food Products', 'Denver, CO', 'Albuquerque, NM', '28200', 6, 6, 'Delivered', 2),
  ('Medical Supplies', 'Cheyenne, WY', 'Denver, CO', '31600', 4, 4, 'Pending', 2),
  ('Electronics', 'Denver, CO', 'Boise, ID', '27500', 5, 5, 'Pending', 2),
  
  -- Coastal Freight Systems
  ('Furniture', 'Savannah, GA', 'Jacksonville, FL', '30200', 7, 7, 'Delivered', 3),
  ('Textiles', 'Charleston, SC', 'Savannah, GA', '27900', 8, 8, 'In Transit', 3),
  ('Paper Products', 'Savannah, GA', 'Atlanta, GA', '29700', 9, 7, 'Delivered', 3),
  ('Automotive Parts', 'Miami, FL', 'Savannah, GA', '32200', 7, 8, 'Pending', 3),
  ('Home Appliances', 'Savannah, GA', 'Charlotte, NC', '28800', 9, 7, 'Pending', 3),
  
  -- Heartland Hauling Inc.
  ('Agricultural Equipment', 'Kansas City, MO', 'Omaha, NE', '29100', 10, 10, 'Delivered', 4),
  ('Grain Products', 'Des Moines, IA', 'Kansas City, MO', '31800', 11, 11, 'In Transit', 4),
  ('Livestock Feed', 'Kansas City, MO', 'Wichita, KS', '28400', 12, 12, 'Delivered', 4),
  ('Farm Machinery', 'Tulsa, OK', 'Kansas City, MO', '30500', 10, 10, 'Pending', 4),
  ('Packaged Foods', 'Kansas City, MO', 'St. Louis, MO', '27700', 11, 11, 'Pending', 4),
  
  -- Northern Star Carriers
  ('Building Materials', 'Minneapolis, MN', 'Duluth, MN', '28900', 13, 13, 'Delivered', 5),
  ('Industrial Supplies', 'Milwaukee, WI', 'Minneapolis, MN', '31400', 14, 14, 'In Transit', 5),
  ('Retail Goods', 'Minneapolis, MN', 'Fargo, ND', '29600', 15, 13, 'Delivered', 5),
  ('Manufacturing Components', 'Sioux Falls, SD', 'Minneapolis, MN', '32500', 13, 14, 'Pending', 5),
  ('Packaged Consumer Goods', 'Minneapolis, MN', 'Green Bay, WI', '28200', 14, 13, 'Pending', 5);
