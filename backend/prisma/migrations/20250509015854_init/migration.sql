-- CreateTable
CREATE TABLE "axle_configurations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "axle_count" INTEGER NOT NULL,
    "configuration_type" VARCHAR(50) NOT NULL,
    "is_specialized" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "axle_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "axle_weights" (
    "id" SERIAL NOT NULL,
    "weigh_ticket_id" INTEGER,
    "axle_position" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "max_legal_weight" INTEGER NOT NULL,
    "compliance_status" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "axle_weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "axles" (
    "id" SERIAL NOT NULL,
    "configuration_id" INTEGER,
    "position" INTEGER NOT NULL,
    "max_legal_weight" INTEGER NOT NULL,
    "description" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "axles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo" (
    "id" SERIAL NOT NULL,
    "weigh_ticket_id" INTEGER,
    "description" TEXT NOT NULL,
    "commodity_type" VARCHAR(100),
    "is_hazmat" BOOLEAN DEFAULT false,
    "hazmat_class" VARCHAR(50),
    "volume" DECIMAL(10,2),
    "volume_unit" VARCHAR(10),
    "density" DECIMAL(10,2),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_issues" (
    "id" SERIAL NOT NULL,
    "weigh_ticket_id" INTEGER,
    "issue_type" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "severity" VARCHAR(50),
    "recommendation" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "license_number" VARCHAR(100) NOT NULL,
    "license_expiry" DATE,
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "status" VARCHAR(50) DEFAULT 'Active',
    "company_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "load_optimizations" (
    "id" SERIAL NOT NULL,
    "weigh_ticket_id" INTEGER,
    "original_distribution" JSON,
    "suggested_distribution" JSON,
    "expected_improvement" DECIMAL(5,2),
    "explanation" TEXT,
    "applied" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "load_optimizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loads" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "origin" VARCHAR(255) NOT NULL,
    "destination" VARCHAR(255) NOT NULL,
    "weight" VARCHAR(50) NOT NULL,
    "vehicle_id" INTEGER,
    "driver_id" INTEGER,
    "status" VARCHAR(50) DEFAULT 'Pending',
    "company_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictive_alerts" (
    "id" SERIAL NOT NULL,
    "vehicle_id" INTEGER,
    "driver_id" INTEGER,
    "alert_type" VARCHAR(100) NOT NULL,
    "risk_score" DECIMAL(5,2) NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT,
    "acknowledged" BOOLEAN DEFAULT false,
    "acknowledged_by" UUID,
    "acknowledged_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictive_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scale_calibrations" (
    "id" SERIAL NOT NULL,
    "scale_id" INTEGER,
    "calibration_date" DATE NOT NULL,
    "performed_by" VARCHAR(255),
    "certificate_number" VARCHAR(100),
    "notes" TEXT,
    "next_calibration_date" DATE,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scale_calibrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scale_facilities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "company_id" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scale_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scale_readings" (
    "id" SERIAL NOT NULL,
    "scale_id" INTEGER,
    "reading_value" DECIMAL(10,2) NOT NULL,
    "reading_type" VARCHAR(50) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_anomaly" BOOLEAN DEFAULT false,
    "confidence_score" DECIMAL(5,2),

    CONSTRAINT "scale_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scales" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "facility_id" INTEGER,
    "scale_type" VARCHAR(50) NOT NULL,
    "manufacturer" VARCHAR(100),
    "model" VARCHAR(100),
    "serial_number" VARCHAR(100),
    "max_capacity" INTEGER NOT NULL,
    "precision" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(10) DEFAULT 'lb',
    "ip_address" VARCHAR(45),
    "port" INTEGER,
    "protocol" VARCHAR(50),
    "last_calibration_date" DATE,
    "next_calibration_date" DATE,
    "status" VARCHAR(50) DEFAULT 'Active',
    "company_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_images" (
    "id" SERIAL NOT NULL,
    "weigh_ticket_id" INTEGER,
    "image_url" TEXT NOT NULL,
    "image_type" VARCHAR(50),
    "captured_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_signatures" (
    "id" SERIAL NOT NULL,
    "weigh_ticket_id" INTEGER,
    "signature_url" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(100),
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "company_id" INTEGER,
    "is_admin" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "license_plate" VARCHAR(50) NOT NULL,
    "vin" VARCHAR(100),
    "make" VARCHAR(100),
    "model" VARCHAR(100),
    "year" INTEGER,
    "status" VARCHAR(50) DEFAULT 'Active',
    "max_weight" VARCHAR(50),
    "company_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "axle_configuration_id" INTEGER,
    "empty_weight" INTEGER,
    "max_gross_weight" INTEGER,
    "height" INTEGER,
    "width" INTEGER,
    "length" INTEGER,
    "telematics_id" VARCHAR(100),
    "eld_integration" BOOLEAN DEFAULT false,
    "last_inspection_date" DATE,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weigh_tickets" (
    "id" SERIAL NOT NULL,
    "ticket_number" VARCHAR(50) NOT NULL,
    "vehicle_id" INTEGER,
    "driver_id" INTEGER,
    "scale_id" INTEGER,
    "facility_id" INTEGER,
    "gross_weight" INTEGER,
    "tare_weight" INTEGER,
    "net_weight" INTEGER,
    "unit" VARCHAR(10) DEFAULT 'lb',
    "date_time" TIMESTAMPTZ(6) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'Created',
    "compliance_status" VARCHAR(50),
    "capture_method" VARCHAR(50) DEFAULT 'Scale',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "notes" TEXT,
    "company_id" INTEGER,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weigh_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weights" (
    "id" SERIAL NOT NULL,
    "vehicle_id" INTEGER,
    "weight" VARCHAR(50) NOT NULL,
    "date" DATE NOT NULL,
    "time" VARCHAR(50),
    "driver_id" INTEGER,
    "status" VARCHAR(50),
    "company_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "axles_configuration_id_position_key" ON "axles"("configuration_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "vehicles"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "weigh_tickets_ticket_number_key" ON "weigh_tickets"("ticket_number");

-- AddForeignKey
ALTER TABLE "axle_weights" ADD CONSTRAINT "axle_weights_weigh_ticket_id_fkey" FOREIGN KEY ("weigh_ticket_id") REFERENCES "weigh_tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "axles" ADD CONSTRAINT "axles_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "axle_configurations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_weigh_ticket_id_fkey" FOREIGN KEY ("weigh_ticket_id") REFERENCES "weigh_tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "compliance_issues" ADD CONSTRAINT "compliance_issues_weigh_ticket_id_fkey" FOREIGN KEY ("weigh_ticket_id") REFERENCES "weigh_tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "load_optimizations" ADD CONSTRAINT "load_optimizations_weigh_ticket_id_fkey" FOREIGN KEY ("weigh_ticket_id") REFERENCES "weigh_tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "predictive_alerts" ADD CONSTRAINT "predictive_alerts_acknowledged_by_fkey" FOREIGN KEY ("acknowledged_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "predictive_alerts" ADD CONSTRAINT "predictive_alerts_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "predictive_alerts" ADD CONSTRAINT "predictive_alerts_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scale_calibrations" ADD CONSTRAINT "scale_calibrations_scale_id_fkey" FOREIGN KEY ("scale_id") REFERENCES "scales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scale_facilities" ADD CONSTRAINT "scale_facilities_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scale_readings" ADD CONSTRAINT "scale_readings_scale_id_fkey" FOREIGN KEY ("scale_id") REFERENCES "scales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scales" ADD CONSTRAINT "scales_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scales" ADD CONSTRAINT "scales_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "scale_facilities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_images" ADD CONSTRAINT "ticket_images_captured_by_fkey" FOREIGN KEY ("captured_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_images" ADD CONSTRAINT "ticket_images_weigh_ticket_id_fkey" FOREIGN KEY ("weigh_ticket_id") REFERENCES "weigh_tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_signatures" ADD CONSTRAINT "ticket_signatures_weigh_ticket_id_fkey" FOREIGN KEY ("weigh_ticket_id") REFERENCES "weigh_tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_axle_configuration_id_fkey" FOREIGN KEY ("axle_configuration_id") REFERENCES "axle_configurations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weigh_tickets" ADD CONSTRAINT "weigh_tickets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weigh_tickets" ADD CONSTRAINT "weigh_tickets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weigh_tickets" ADD CONSTRAINT "weigh_tickets_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weigh_tickets" ADD CONSTRAINT "weigh_tickets_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "scale_facilities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weigh_tickets" ADD CONSTRAINT "weigh_tickets_scale_id_fkey" FOREIGN KEY ("scale_id") REFERENCES "scales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weigh_tickets" ADD CONSTRAINT "weigh_tickets_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weights" ADD CONSTRAINT "weights_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weights" ADD CONSTRAINT "weights_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weights" ADD CONSTRAINT "weights_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
