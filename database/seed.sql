-- Insert sample companies
INSERT INTO companies (name, address, contact_email, contact_phone)
VALUES
  ('ABC Trucking', '123 Main St, Anytown, USA', 'contact@abctrucking.com', '555-123-4567'),
  ('XYZ Logistics', '456 Oak Ave, Somewhere, USA', 'info@xyzlogistics.com', '555-987-6543');

-- Insert sample users with UUID IDs
INSERT INTO users (id, name, email, company_id, is_admin)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'John Admin', 'admin@abctrucking.com', 1, TRUE),
  ('00000000-0000-0000-0000-000000000002', 'Jane User', 'user@abctrucking.com', 1, FALSE),
  ('00000000-0000-0000-0000-000000000003', 'Bob Manager', 'manager@xyzlogistics.com', 2, TRUE),
  ('00000000-0000-0000-0000-000000000004', 'Alice Driver', 'driver@xyzlogistics.com', 2, FALSE);

-- Insert sample vehicles for ABC Trucking
INSERT INTO vehicles (name, type, license_plate, vin, make, model, year, status, max_weight, company_id)
VALUES
  ('Truck 101', 'Semi', 'ABC-1234', 'VIN12345678901234A', 'Freightliner', 'Cascadia', 2020, 'Active', '80,000 lbs', 1),
  ('Truck 203', 'Semi', 'ABC-2345', 'VIN23456789012345B', 'Peterbilt', '579', 2019, 'Active', '80,000 lbs', 1),
  ('Truck 155', 'Box Truck', 'ABC-3456', 'VIN34567890123456C', 'International', 'MV', 2021, 'Maintenance', '33,000 lbs', 1),
  ('Truck 087', 'Semi', 'ABC-4567', 'VIN45678901234567D', 'Kenworth', 'T680', 2018, 'Active', '80,000 lbs', 1);

-- Insert sample vehicles for XYZ Logistics
INSERT INTO vehicles (name, type, license_plate, vin, make, model, year, status, max_weight, company_id)
VALUES
  ('Truck A1', 'Semi', 'XYZ-1234', 'VIN56789012345678E', 'Volvo', 'VNL', 2021, 'Active', '80,000 lbs', 2),
  ('Truck B2', 'Semi', 'XYZ-2345', 'VIN67890123456789F', 'Mack', 'Anthem', 2020, 'Active', '80,000 lbs', 2),
  ('Truck C3', 'Box Truck', 'XYZ-3456', 'VIN78901234567890G', 'Hino', '338', 2019, 'Active', '33,000 lbs', 2),
  ('Truck D4', 'Semi', 'XYZ-4567', 'VIN89012345678901H', 'Western Star', '5700', 2022, 'Maintenance', '80,000 lbs', 2);

-- Insert sample drivers for ABC Trucking
INSERT INTO drivers (name, license_number, license_expiry, phone, email, status, company_id)
VALUES
  ('John Smith', 'DL12345678', '2025-06-30', '555-111-2222', 'john.smith@example.com', 'Active', 1),
  ('Sarah Johnson', 'DL23456789', '2024-08-15', '555-222-3333', 'sarah.johnson@example.com', 'Active', 1),
  ('Mike Wilson', 'DL34567890', '2023-12-01', '555-333-4444', 'mike.wilson@example.com', 'Active', 1),
  ('Lisa Brown', 'DL45678901', '2024-03-22', '555-444-5555', 'lisa.brown@example.com', 'On Leave', 1);

-- Insert sample drivers for XYZ Logistics
INSERT INTO drivers (name, license_number, license_expiry, phone, email, status, company_id)
VALUES
  ('David Miller', 'DL56789012', '2025-02-18', '555-555-6666', 'david.miller@example.com', 'Active', 2),
  ('Emily Davis', 'DL67890123', '2024-05-09', '555-666-7777', 'emily.davis@example.com', 'Active', 2),
  ('Michael Johnson', 'DL78901234', '2023-11-14', '555-777-8888', 'michael.johnson@example.com', 'Active', 2),
  ('Jessica Wilson', 'DL89012345', '2024-07-30', '555-888-9999', 'jessica.wilson@example.com', 'Inactive', 2);

-- Insert sample weights for ABC Trucking
INSERT INTO weights (vehicle_id, weight, date, time, driver_id, status, company_id)
VALUES
  (1, '32,500 lbs', '2023-05-15', '09:30 AM', 1, 'Compliant', 1),
  (2, '34,200 lbs', '2023-05-14', '10:15 AM', 2, 'Compliant', 1),
  (3, '36,100 lbs', '2023-05-13', '02:45 PM', 3, 'Warning', 1),
  (4, '38,900 lbs', '2023-05-12', '11:20 AM', 4, 'Non-Compliant', 1);

-- Insert sample weights for XYZ Logistics
INSERT INTO weights (vehicle_id, weight, date, time, driver_id, status, company_id)
VALUES
  (5, '31,800 lbs', '2023-05-15', '08:45 AM', 5, 'Compliant', 2),
  (6, '33,600 lbs', '2023-05-14', '01:30 PM', 6, 'Compliant', 2),
  (7, '35,400 lbs', '2023-05-13', '11:15 AM', 7, 'Warning', 2),
  (8, '37,200 lbs', '2023-05-12', '03:45 PM', 8, 'Warning', 2);

-- Insert sample loads for ABC Trucking
INSERT INTO loads (description, origin, destination, weight, vehicle_id, driver_id, status, company_id)
VALUES
  ('Construction materials', 'New York, NY', 'Boston, MA', '28,000 lbs', 1, 1, 'Delivered', 1),
  ('Electronics', 'Chicago, IL', 'Detroit, MI', '22,000 lbs', 2, 2, 'In Transit', 1),
  ('Furniture', 'Atlanta, GA', 'Miami, FL', '25,000 lbs', 3, 3, 'Pending', 1);

-- Insert sample loads for XYZ Logistics
INSERT INTO loads (description, origin, destination, weight, vehicle_id, driver_id, status, company_id)
VALUES
  ('Food products', 'Seattle, WA', 'Portland, OR', '26,000 lbs', 5, 5, 'Delivered', 2),
  ('Automotive parts', 'Los Angeles, CA', 'San Diego, CA', '24,000 lbs', 6, 6, 'In Transit', 2),
  ('Retail goods', 'Dallas, TX', 'Houston, TX', '27,000 lbs', 7, 7, 'Pending', 2);
