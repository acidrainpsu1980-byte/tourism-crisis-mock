-- =====================================================================
-- Tourism Crisis Intelligence · Phuket Sandbox — ร่าง DDL อ้างอิง PostgreSQL 17 + PostGIS
-- จัดตามพจนานุกรมข้อมูลในเอกสาร Tourism_Crisis_System_Design (35 ตาราง / 6 schema)
-- หลักการ: UUID เป็นรหัสภายใน · Composite FK มี tenant_id · timestamptz (UTC) ·
--          geometry SRID 4326 (lon, lat) · numeric สำหรับคะแนน · JSONB เฉพาะ config/สูตร/คำอธิบาย
-- หมายเหตุ: ไฟล์นี้สอดคล้องกับข้อมูลจำลองใน js/data/seed.js (ชื่อคอลัมน์หลัก) เป็นจุดเริ่ม Migration
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS core;       -- Tenant หน่วยงาน ผู้ใช้ บทบาท ขอบเขตสิทธิ์ แหล่งท่องเที่ยว
CREATE SCHEMA IF NOT EXISTS ingest;     -- Source Batch คุณภาพ สัญญาณออนไลน์
CREATE SCHEMA IF NOT EXISTS ops;        -- ประเภทภัย เหตุ SOS อาสาสมัคร ภารกิจ ประกาศ Outbox
CREATE SCHEMA IF NOT EXISTS geo;        -- พื้นที่ พื้นที่เสี่ยง Grid ข้อมูลจำนวนเชิงพื้นที่
CREATE SCHEMA IF NOT EXISTS analytics;  -- โมเดล คะแนนความเสี่ยง Heatmap KPI Dashboard
CREATE SCHEMA IF NOT EXISTS audit;      -- ประวัติการกระทำ (append-only)

-- ---------------------------------------------------------------- core
CREATE TABLE core.tenant (
  tenant_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  status      text NOT NULL CHECK (status IN ('active','planned','suspended')),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE core.agency (
  tenant_id           uuid NOT NULL REFERENCES core.tenant(tenant_id),
  agency_id           uuid NOT NULL DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  agency_type         text NOT NULL,
  contact_ciphertext  bytea,                       -- เข้ารหัสระดับแอป (Envelope Encryption)
  PRIMARY KEY (tenant_id, agency_id)
);
CREATE TABLE core.app_user (
  tenant_id           uuid NOT NULL REFERENCES core.tenant(tenant_id),
  user_id             uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_subject        text NOT NULL,               -- Subject จาก OIDC ไม่เก็บรหัสผ่าน
  display_name        text NOT NULL,
  preferred_language  text NOT NULL DEFAULT 'th' CHECK (preferred_language IN ('th','en','zh')),
  active              boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id),
  UNIQUE (tenant_id, auth_subject)
);
CREATE TABLE core.role (
  tenant_id  uuid NOT NULL REFERENCES core.tenant(tenant_id),
  role_code  text NOT NULL,     -- commander | dispatcher | agency | steward | volunteer | tourist | admin
  name       text NOT NULL,
  PRIMARY KEY (tenant_id, role_code)
);
CREATE TABLE geo.area (
  tenant_id       uuid NOT NULL REFERENCES core.tenant(tenant_id),
  area_id         uuid NOT NULL DEFAULT gen_random_uuid(),
  parent_area_id  uuid,
  official_code   text NOT NULL,
  name            text NOT NULL,
  level           text NOT NULL,                   -- province | district | subdistrict | zone
  boundary        geometry(MultiPolygon, 4326),
  PRIMARY KEY (tenant_id, area_id),
  UNIQUE (tenant_id, official_code),
  FOREIGN KEY (tenant_id, parent_area_id) REFERENCES geo.area(tenant_id, area_id)
);
CREATE INDEX area_boundary_gist ON geo.area USING gist (boundary);
CREATE TABLE core.user_role (
  tenant_id uuid NOT NULL, user_id uuid NOT NULL, role_code text NOT NULL,
  PRIMARY KEY (tenant_id, user_id, role_code),
  FOREIGN KEY (tenant_id, user_id)   REFERENCES core.app_user(tenant_id, user_id),
  FOREIGN KEY (tenant_id, role_code) REFERENCES core.role(tenant_id, role_code)
);
CREATE TABLE core.user_area_scope (
  tenant_id uuid NOT NULL, user_id uuid NOT NULL, area_id uuid NOT NULL,
  PRIMARY KEY (tenant_id, user_id, area_id),
  FOREIGN KEY (tenant_id, user_id) REFERENCES core.app_user(tenant_id, user_id),
  FOREIGN KEY (tenant_id, area_id) REFERENCES geo.area(tenant_id, area_id)
);
CREATE TABLE core.user_agency (
  tenant_id uuid NOT NULL, user_id uuid NOT NULL, agency_id uuid NOT NULL,
  PRIMARY KEY (tenant_id, user_id, agency_id),
  FOREIGN KEY (tenant_id, user_id)   REFERENCES core.app_user(tenant_id, user_id),
  FOREIGN KEY (tenant_id, agency_id) REFERENCES core.agency(tenant_id, agency_id)
);
CREATE TABLE core.tourism_asset (
  tenant_id   uuid NOT NULL, asset_id uuid NOT NULL DEFAULT gen_random_uuid(),
  area_id     uuid NOT NULL,
  name        text NOT NULL,
  asset_type  text NOT NULL,
  capacity    integer,
  location    geometry(Point, 4326) NOT NULL,
  PRIMARY KEY (tenant_id, asset_id),
  FOREIGN KEY (tenant_id, area_id) REFERENCES geo.area(tenant_id, area_id)
);

-- ---------------------------------------------------------------- ingest
CREATE TABLE ingest.data_source (
  tenant_id            uuid NOT NULL REFERENCES core.tenant(tenant_id),
  source_id            uuid NOT NULL DEFAULT gen_random_uuid(),
  agency_id            uuid,
  name                 text NOT NULL,
  source_type          text NOT NULL CHECK (source_type IN ('API','File','Sensor','CCTV','Social','Manual')),
  data_classification  text NOT NULL CHECK (data_classification IN ('Public','Internal','Restricted')),
  refresh_seconds      integer,
  secret_reference     text,                       -- ตัวอ้างอิง Secret Manager (ไม่เก็บ secret)
  agreement_reference  text,
  enabled              boolean NOT NULL DEFAULT true,
  PRIMARY KEY (tenant_id, source_id),
  FOREIGN KEY (tenant_id, agency_id) REFERENCES core.agency(tenant_id, agency_id)
);
CREATE TABLE ingest.import_batch (
  tenant_id           uuid NOT NULL, batch_id uuid NOT NULL DEFAULT gen_random_uuid(),
  source_id           uuid NOT NULL,
  external_batch_key  text NOT NULL,              -- คีย์ชุดข้อมูลต้นทางเพื่อกันซ้ำ (FR03)
  raw_object_key      text,                       -- ไฟล์ต้นฉบับใน Object Storage
  started_at          timestamptz NOT NULL DEFAULT now(),
  finished_at         timestamptz,
  status              text NOT NULL CHECK (status IN ('queued','running','loaded','failed','rejected')),
  accepted_rows       bigint NOT NULL DEFAULT 0,
  rejected_rows       bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, batch_id),
  UNIQUE (tenant_id, source_id, external_batch_key),
  FOREIGN KEY (tenant_id, source_id) REFERENCES ingest.data_source(tenant_id, source_id)
);
CREATE TABLE ingest.quality_issue (
  tenant_id         uuid NOT NULL, issue_id uuid NOT NULL DEFAULT gen_random_uuid(),
  batch_id          uuid NOT NULL,
  rule_code         text NOT NULL,                -- GEO_OUT_OF_AREA | DUPLICATE_EVENT_KEY | NEGATIVE_COUNT | TIMESTAMP_FUTURE | SOURCE_STALE
  record_reference  text,
  message           text NOT NULL,
  resolved_at       timestamptz,
  PRIMARY KEY (tenant_id, issue_id),
  FOREIGN KEY (tenant_id, batch_id) REFERENCES ingest.import_batch(tenant_id, batch_id)
);
CREATE TABLE ingest.social_signal (
  tenant_id            uuid NOT NULL, signal_id uuid NOT NULL DEFAULT gen_random_uuid(),
  source_id            uuid NOT NULL,
  batch_id             uuid,
  area_id              uuid,
  external_id          text NOT NULL,
  published_at         timestamptz NOT NULL,
  observed_at          timestamptz NOT NULL,
  language             text NOT NULL,
  topic                text NOT NULL,
  sentiment            numeric(5,4) CHECK (sentiment BETWEEN -1 AND 1),
  confidence           numeric(5,4) CHECK (confidence BETWEEN 0 AND 1),
  evidence_object_key  text,
  verification_status  text NOT NULL CHECK (verification_status IN ('unverified','verified','rejected')),
  PRIMARY KEY (tenant_id, signal_id),
  UNIQUE (tenant_id, source_id, external_id),
  FOREIGN KEY (tenant_id, source_id) REFERENCES ingest.data_source(tenant_id, source_id),
  FOREIGN KEY (tenant_id, batch_id)  REFERENCES ingest.import_batch(tenant_id, batch_id),
  FOREIGN KEY (tenant_id, area_id)   REFERENCES geo.area(tenant_id, area_id)
);

-- ---------------------------------------------------------------- ops / geo (เหตุ, SOS, ภารกิจ)
CREATE TABLE ops.hazard_type (
  tenant_id uuid NOT NULL REFERENCES core.tenant(tenant_id), hazard_code text NOT NULL, name text NOT NULL,
  PRIMARY KEY (tenant_id, hazard_code)
);
CREATE TABLE geo.risk_zone (
  tenant_id           uuid NOT NULL, zone_id uuid NOT NULL DEFAULT gen_random_uuid(),
  area_id             uuid NOT NULL, hazard_code text NOT NULL,
  boundary            geometry(MultiPolygon, 4326) NOT NULL,
  valid_from          timestamptz NOT NULL, valid_to timestamptz,
  level               smallint NOT NULL CHECK (level BETWEEN 1 AND 5),
  evidence_reference  text NOT NULL,
  PRIMARY KEY (tenant_id, zone_id),
  FOREIGN KEY (tenant_id, area_id)     REFERENCES geo.area(tenant_id, area_id),
  FOREIGN KEY (tenant_id, hazard_code) REFERENCES ops.hazard_type(tenant_id, hazard_code)
);
CREATE INDEX risk_zone_gist ON geo.risk_zone USING gist (boundary);

CREATE TABLE analytics.model_version (
  tenant_id    uuid NOT NULL, model_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name         text NOT NULL, version text NOT NULL,
  artifact_key text NOT NULL,
  metrics      jsonb NOT NULL DEFAULT '{}'::jsonb,
  approved_by  uuid, approved_at timestamptz,
  PRIMARY KEY (tenant_id, model_id), UNIQUE (tenant_id, name, version),
  FOREIGN KEY (tenant_id, approved_by) REFERENCES core.app_user(tenant_id, user_id)
);
CREATE TABLE analytics.risk_assessment (
  tenant_id     uuid NOT NULL, assessment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  area_id       uuid NOT NULL, hazard_code text NOT NULL,
  model_id      uuid,                              -- NULL เมื่อใช้กฎ (method)
  assessed_at   timestamptz NOT NULL DEFAULT now(),
  horizon_days  integer NOT NULL,
  probability   numeric(5,4) CHECK (probability BETWEEN 0 AND 1),
  impact        smallint NOT NULL CHECK (impact BETWEEN 1 AND 5),
  risk_score    numeric(6,2) NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  confidence    numeric(5,4) CHECK (confidence BETWEEN 0 AND 1),
  method        text NOT NULL,                     -- เช่น rule-v1.2
  explanation   jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (tenant_id, assessment_id),
  FOREIGN KEY (tenant_id, area_id)     REFERENCES geo.area(tenant_id, area_id),
  FOREIGN KEY (tenant_id, hazard_code) REFERENCES ops.hazard_type(tenant_id, hazard_code),
  FOREIGN KEY (tenant_id, model_id)    REFERENCES analytics.model_version(tenant_id, model_id)
);
CREATE INDEX risk_assessment_area_time ON analytics.risk_assessment (tenant_id, area_id, hazard_code, assessed_at DESC);

CREATE TABLE ops.incident (
  tenant_id    uuid NOT NULL, incident_id uuid NOT NULL DEFAULT gen_random_uuid(),
  area_id      uuid NOT NULL, hazard_code text NOT NULL,
  title        text NOT NULL,
  status       text NOT NULL CHECK (status IN ('reported','verified','escalated','notified','tracking','closed')),  -- Crisis Response Protocol
  severity     smallint NOT NULL CHECK (severity BETWEEN 1 AND 5),
  location     geometry(Point, 4326) NOT NULL,
  occurred_at  timestamptz NOT NULL,
  verified_by  uuid,
  created_at   timestamptz NOT NULL DEFAULT now(),
  closed_at    timestamptz,
  version      integer NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, incident_id),
  FOREIGN KEY (tenant_id, area_id)     REFERENCES geo.area(tenant_id, area_id),
  FOREIGN KEY (tenant_id, hazard_code) REFERENCES ops.hazard_type(tenant_id, hazard_code),
  FOREIGN KEY (tenant_id, verified_by) REFERENCES core.app_user(tenant_id, user_id)
);
CREATE INDEX incident_status_time ON ops.incident (tenant_id, status, occurred_at DESC);
CREATE INDEX incident_gist ON ops.incident USING gist (location);

CREATE TABLE ops.sos_request (
  tenant_id            uuid NOT NULL, sos_id uuid NOT NULL DEFAULT gen_random_uuid(),
  incident_id          uuid,                       -- ว่างจนเจ้าหน้าที่คัดกรอง
  area_id              uuid NOT NULL,
  requester_id         uuid,                       -- ผู้แจ้งถ้ามีบัญชี (แจ้งแทนผ่านเจ้าหน้าที่ได้)
  idempotency_key      text NOT NULL,              -- ส่งซ้ำด้วย Key เดิมได้เลขเดิม (FR10)
  request_detail       text NOT NULL,
  contact_ciphertext   bytea,
  location             geometry(Point, 4326) NOT NULL,
  location_accuracy_m  numeric(9,2),
  people_count         integer,
  urgency              smallint NOT NULL CHECK (urgency BETWEEN 1 AND 5),
  status               text NOT NULL CHECK (status IN ('received','screened','closed','cancelled')),
  created_at           timestamptz NOT NULL DEFAULT now(),
  expires_at           timestamptz,
  PRIMARY KEY (tenant_id, sos_id),
  UNIQUE (tenant_id, idempotency_key),
  FOREIGN KEY (tenant_id, incident_id)  REFERENCES ops.incident(tenant_id, incident_id),
  FOREIGN KEY (tenant_id, area_id)      REFERENCES geo.area(tenant_id, area_id),
  FOREIGN KEY (tenant_id, requester_id) REFERENCES core.app_user(tenant_id, user_id)
);
CREATE INDEX sos_status_time ON ops.sos_request (tenant_id, status, created_at DESC);

CREATE TABLE ops.volunteer (
  tenant_id            uuid NOT NULL, volunteer_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL,
  agency_id            uuid,
  verification_status  text NOT NULL CHECK (verification_status IN ('pending','verified','suspended')),
  availability         text NOT NULL CHECK (availability IN ('available','busy','off')),
  max_active_tasks     integer NOT NULL DEFAULT 1,
  last_location        geometry(Point, 4326),
  location_updated_at  timestamptz,
  PRIMARY KEY (tenant_id, volunteer_id), UNIQUE (tenant_id, user_id),
  FOREIGN KEY (tenant_id, user_id)   REFERENCES core.app_user(tenant_id, user_id),
  FOREIGN KEY (tenant_id, agency_id) REFERENCES core.agency(tenant_id, agency_id)
);
CREATE TABLE ops.volunteer_skill (
  tenant_id uuid NOT NULL, volunteer_id uuid NOT NULL, skill_code text NOT NULL,
  valid_until      date,                           -- หมดอายุ → ไม่ถูกเสนอภารกิจที่ต้องใช้ทักษะนั้น (FR12)
  proof_object_key text,
  PRIMARY KEY (tenant_id, volunteer_id, skill_code),
  FOREIGN KEY (tenant_id, volunteer_id) REFERENCES ops.volunteer(tenant_id, volunteer_id)
);
CREATE TABLE ops.rescue_task (
  tenant_id              uuid NOT NULL, task_id uuid NOT NULL DEFAULT gen_random_uuid(),
  sos_id                 uuid NOT NULL,
  assigned_agency_id     uuid,
  task_type              text NOT NULL,
  required_skill         text,
  priority_score         numeric(6,2) NOT NULL CHECK (priority_score BETWEEN 0 AND 100),
  priority_reason        jsonb NOT NULL DEFAULT '{}'::jsonb,   -- องค์ประกอบ 35/25/20/20 + override + เหตุผล
  priority_rule_version  text NOT NULL,
  status                 text NOT NULL CHECK (status IN ('pending','offered','accepted','en_route','on_scene','completed','cancelled')),
  created_at             timestamptz NOT NULL DEFAULT now(),
  due_at                 timestamptz,
  completed_at           timestamptz,
  version                integer NOT NULL DEFAULT 1,  -- Expected Version สำหรับ POST /v1/tasks/{id}/events
  PRIMARY KEY (tenant_id, task_id),
  FOREIGN KEY (tenant_id, sos_id)             REFERENCES ops.sos_request(tenant_id, sos_id),
  FOREIGN KEY (tenant_id, assigned_agency_id) REFERENCES core.agency(tenant_id, agency_id)
);
CREATE INDEX rescue_task_queue ON ops.rescue_task (tenant_id, status, priority_score DESC, created_at);

CREATE TABLE ops.task_assignment (
  tenant_id      uuid NOT NULL, assignment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id        uuid NOT NULL,
  volunteer_id   uuid NOT NULL,
  assigned_by    uuid NOT NULL,
  status         text NOT NULL CHECK (status IN ('offered','accepted','declined','expired','released')),
  offered_at     timestamptz NOT NULL DEFAULT now(),
  responded_at   timestamptz,
  expires_at     timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, assignment_id),
  FOREIGN KEY (tenant_id, task_id)      REFERENCES ops.rescue_task(tenant_id, task_id),
  FOREIGN KEY (tenant_id, volunteer_id) REFERENCES ops.volunteer(tenant_id, volunteer_id),
  FOREIGN KEY (tenant_id, assigned_by)  REFERENCES core.app_user(tenant_id, user_id)
);
-- หัวหน้าภารกิจที่ยัง Active ได้เพียงหนึ่งคน (ป้องกัน Concurrent Assignment, FR13)
CREATE UNIQUE INDEX task_assignment_one_active_lead
  ON ops.task_assignment (tenant_id, task_id) WHERE status IN ('offered','accepted');

CREATE TABLE ops.task_event (
  tenant_id        uuid NOT NULL, event_id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id          uuid NOT NULL,
  actor_id         uuid NOT NULL,
  event_type       text NOT NULL,                  -- created | offered | accepted | declined | offer_expired | status | priority_override | support_requested
  previous_status  text, new_status text,
  occurred_at      timestamptz NOT NULL DEFAULT now(),
  note             text,
  PRIMARY KEY (tenant_id, event_id),
  FOREIGN KEY (tenant_id, task_id)  REFERENCES ops.rescue_task(tenant_id, task_id),
  FOREIGN KEY (tenant_id, actor_id) REFERENCES core.app_user(tenant_id, user_id)
);
CREATE INDEX task_event_task_time ON ops.task_event (tenant_id, task_id, occurred_at);

-- ---------------------------------------------------------------- ops (ประกาศ)
CREATE TABLE ops.alert (
  tenant_id      uuid NOT NULL, alert_id uuid NOT NULL DEFAULT gen_random_uuid(),
  area_id        uuid NOT NULL,
  incident_id    uuid, assessment_id uuid,
  level          smallint NOT NULL CHECK (level BETWEEN 1 AND 5),
  status         text NOT NULL CHECK (status IN ('draft','review','approved','rejected','published','expired')),
  approved_by    uuid,
  published_at   timestamptz, expires_at timestamptz,
  PRIMARY KEY (tenant_id, alert_id),
  FOREIGN KEY (tenant_id, area_id)       REFERENCES geo.area(tenant_id, area_id),
  FOREIGN KEY (tenant_id, incident_id)   REFERENCES ops.incident(tenant_id, incident_id),
  FOREIGN KEY (tenant_id, assessment_id) REFERENCES analytics.risk_assessment(tenant_id, assessment_id),
  FOREIGN KEY (tenant_id, approved_by)   REFERENCES core.app_user(tenant_id, user_id),
  CHECK (status <> 'published' OR approved_by IS NOT NULL)   -- อนุมัติก่อนเผยแพร่ (FR09)
);
CREATE TABLE ops.alert_translation (
  tenant_id uuid NOT NULL, alert_id uuid NOT NULL, language text NOT NULL CHECK (language IN ('th','en','zh')),
  title       text NOT NULL, message text NOT NULL,
  reviewed_by uuid,
  PRIMARY KEY (tenant_id, alert_id, language),
  FOREIGN KEY (tenant_id, alert_id)    REFERENCES ops.alert(tenant_id, alert_id),
  FOREIGN KEY (tenant_id, reviewed_by) REFERENCES core.app_user(tenant_id, user_id)
);
CREATE TABLE ops.notification_delivery (
  tenant_id           uuid NOT NULL, delivery_id uuid NOT NULL DEFAULT gen_random_uuid(),
  alert_id            uuid NOT NULL, user_id uuid NOT NULL, channel text NOT NULL,
  status              text NOT NULL CHECK (status IN ('queued','sent','delivered','acknowledged','failed')),  -- ส่งสำเร็จ ≠ ผู้ใช้ตอบรับ
  attempt_count       integer NOT NULL DEFAULT 0,
  provider_reference  text,
  next_attempt_at     timestamptz, delivered_at timestamptz,
  PRIMARY KEY (tenant_id, delivery_id),
  UNIQUE (tenant_id, alert_id, user_id, channel),
  FOREIGN KEY (tenant_id, alert_id) REFERENCES ops.alert(tenant_id, alert_id),
  FOREIGN KEY (tenant_id, user_id)  REFERENCES core.app_user(tenant_id, user_id)
);
CREATE TABLE ops.outbox_event (
  tenant_id     uuid NOT NULL REFERENCES core.tenant(tenant_id), outbox_id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_type    text NOT NULL, aggregate_id uuid NOT NULL,
  payload       jsonb NOT NULL,                    -- หลีกเลี่ยง PII
  created_at    timestamptz NOT NULL DEFAULT now(), published_at timestamptz,
  PRIMARY KEY (tenant_id, outbox_id)
);
CREATE INDEX outbox_unpublished ON ops.outbox_event (tenant_id, created_at) WHERE published_at IS NULL;

-- ---------------------------------------------------------------- geo / analytics (Mobility)
CREATE TABLE geo.mobility_cell (
  tenant_id     uuid NOT NULL, cell_id text NOT NULL,
  area_id       uuid NOT NULL,
  grid_version  text NOT NULL,                     -- เช่น utm47n-300m-v1 (ไม่แบ่งองศาเป็นเมตรโดยตรง)
  boundary      geometry(Polygon, 4326) NOT NULL,
  area_m2       numeric(14,2) NOT NULL,
  PRIMARY KEY (tenant_id, cell_id),
  FOREIGN KEY (tenant_id, area_id) REFERENCES geo.area(tenant_id, area_id)
);
CREATE TABLE geo.mobility_observation (
  tenant_id           uuid NOT NULL,
  observed_at         timestamptz NOT NULL,
  source_id           uuid NOT NULL,
  external_event_key  text NOT NULL,               -- คงเดิมเมื่อ Retry (กันซ้ำ)
  cell_id             text NOT NULL,
  batch_id            uuid,
  window_seconds      integer NOT NULL,
  population_group    text NOT NULL CHECK (population_group IN ('All','Tourist','Affected','Unknown')),
  count_value         integer NOT NULL CHECK (count_value >= 0),
  count_method        text NOT NULL CHECK (count_method IN ('flow','occupancy')),
  quality_score       numeric(5,4),
  PRIMARY KEY (tenant_id, observed_at, source_id, external_event_key),
  FOREIGN KEY (tenant_id, source_id) REFERENCES ingest.data_source(tenant_id, source_id),
  FOREIGN KEY (tenant_id, cell_id)   REFERENCES geo.mobility_cell(tenant_id, cell_id),
  FOREIGN KEY (tenant_id, batch_id)  REFERENCES ingest.import_batch(tenant_id, batch_id)
) PARTITION BY RANGE (observed_at);
CREATE TABLE geo.mobility_observation_2026_10 PARTITION OF geo.mobility_observation FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE geo.mobility_observation_2026_11 PARTITION OF geo.mobility_observation FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE geo.mobility_observation_2026_12 PARTITION OF geo.mobility_observation FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');
CREATE INDEX mobility_observation_brin ON geo.mobility_observation USING brin (observed_at);

CREATE TABLE analytics.heatmap_cell (
  tenant_id          uuid NOT NULL,
  window_start       timestamptz NOT NULL, window_seconds integer NOT NULL,
  cell_id            text NOT NULL,
  population_group   text NOT NULL,
  fusion_version     text NOT NULL,
  estimated_count    numeric(14,2),                -- NULL = No data (ห้ามแทนด้วย 0, ไม่แสดงสีปลอดภัย)
  confidence         numeric(5,4),
  source_count       integer NOT NULL DEFAULT 0,
  coverage_fraction  numeric(5,4) CHECK (coverage_fraction > 0 AND coverage_fraction <= 1),
  is_suppressed      boolean NOT NULL DEFAULT false,   -- ปิดบังค่าน้อย (<10) ในมุมมองสาธารณะ
  updated_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, window_start, window_seconds, cell_id, population_group, fusion_version),
  FOREIGN KEY (tenant_id, cell_id) REFERENCES geo.mobility_cell(tenant_id, cell_id)
) PARTITION BY RANGE (window_start);
CREATE TABLE analytics.heatmap_cell_2026_10 PARTITION OF analytics.heatmap_cell FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE analytics.heatmap_cell_2026_11 PARTITION OF analytics.heatmap_cell FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE analytics.heatmap_cell_2026_12 PARTITION OF analytics.heatmap_cell FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- ---------------------------------------------------------------- analytics (KPI / Dashboard)
CREATE TABLE analytics.kpi_definition (
  tenant_id        uuid NOT NULL REFERENCES core.tenant(tenant_id),
  kpi_code         text NOT NULL, version integer NOT NULL,
  name             text NOT NULL, unit text NOT NULL,
  formula_spec     jsonb NOT NULL,                 -- สูตร นิยาม Grain ข้อจำกัดการตีความ
  owner_agency_id  uuid,
  PRIMARY KEY (tenant_id, kpi_code, version),
  FOREIGN KEY (tenant_id, owner_agency_id) REFERENCES core.agency(tenant_id, agency_id)
);
CREATE TABLE analytics.kpi_value (
  tenant_id      uuid NOT NULL,
  period_start   timestamptz NOT NULL, period_end timestamptz NOT NULL,
  area_id        uuid NOT NULL,
  kpi_code       text NOT NULL, kpi_version integer NOT NULL,
  source_id      uuid NOT NULL,
  value          numeric(20,4),                    -- NULL เมื่อ Missing
  quality_status text NOT NULL CHECK (quality_status IN ('Valid','Estimated','Missing')),
  loaded_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, period_start, period_end, area_id, kpi_code, kpi_version, source_id),
  FOREIGN KEY (tenant_id, area_id)               REFERENCES geo.area(tenant_id, area_id),
  FOREIGN KEY (tenant_id, kpi_code, kpi_version) REFERENCES analytics.kpi_definition(tenant_id, kpi_code, version),
  FOREIGN KEY (tenant_id, source_id)             REFERENCES ingest.data_source(tenant_id, source_id)
) PARTITION BY RANGE (period_start);
CREATE TABLE analytics.kpi_value_2026_10 PARTITION OF analytics.kpi_value FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE analytics.kpi_value_2026_11 PARTITION OF analytics.kpi_value FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE analytics.kpi_value_2026_12 PARTITION OF analytics.kpi_value FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE TABLE analytics.dashboard (
  tenant_id      uuid NOT NULL, dashboard_id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_user_id  uuid NOT NULL,
  name           text NOT NULL,
  visibility     text NOT NULL CHECK (visibility IN ('Private','Tenant','Public')),
  config         jsonb NOT NULL DEFAULT '{}'::jsonb,
  version        integer NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, dashboard_id),
  FOREIGN KEY (tenant_id, owner_user_id) REFERENCES core.app_user(tenant_id, user_id)
);

-- ---------------------------------------------------------------- audit (append-only)
CREATE TABLE audit.audit_log (
  tenant_id       uuid NOT NULL,
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  log_id          uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id        uuid,
  action          text NOT NULL,
  entity_type     text NOT NULL, entity_id text NOT NULL,
  request_id      text NOT NULL,
  change_summary  jsonb NOT NULL DEFAULT '{}'::jsonb,   -- ไม่เก็บข้อมูลส่วนบุคคลเต็ม
  PRIMARY KEY (tenant_id, occurred_at, log_id)
) PARTITION BY RANGE (occurred_at);
CREATE TABLE audit.audit_log_2026_10 PARTITION OF audit.audit_log FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE audit.audit_log_2026_11 PARTITION OF audit.audit_log FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE audit.audit_log_2026_12 PARTITION OF audit.audit_log FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- ---------------------------------------------------------------- Tenant RLS (ตัวอย่าง — บังคับ Tenant Isolation; สิทธิ์รายพื้นที่ตรวจที่ API)
-- Runtime ต้อง SET LOCAL app.tenant_id = '<uuid>' ภายในทุก Transaction (Transaction Pooling)
CREATE OR REPLACE FUNCTION core.current_tenant() RETURNS uuid LANGUAGE sql STABLE AS
  $$ SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid $$;
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT table_schema, table_name FROM information_schema.columns
           WHERE column_name = 'tenant_id' AND table_schema IN ('core','ingest','ops','geo','analytics','audit')
           GROUP BY table_schema, table_name LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', t.table_schema, t.table_name);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I.%I USING (tenant_id = core.current_tenant()) WITH CHECK (tenant_id = core.current_tenant())', t.table_schema, t.table_name);
  END LOOP;
END $$;
-- ผู้ใช้ Runtime ต้องไม่ใช่ Owner / Superuser / BYPASSRLS และไม่ให้สิทธิ์เข้าตาราง Partition ลูกโดยตรง

-- ---------------------------------------------------------------- VIEW: KPI สรุปสำหรับ GET /v1/dashboard/summary
CREATE VIEW analytics.v_dashboard_summary AS
SELECT i.tenant_id, i.area_id,
       count(*) FILTER (WHERE i.status <> 'reported')                                         AS incidents_confirmed,
       (SELECT count(*) FROM ops.sos_request s WHERE s.tenant_id = i.tenant_id AND s.area_id = i.area_id AND s.status IN ('received','screened')) AS sos_open,
       (SELECT count(*) FROM ops.rescue_task t JOIN ops.sos_request s USING (tenant_id, sos_id) WHERE s.tenant_id = i.tenant_id AND s.area_id = i.area_id AND t.status = 'pending') AS tasks_pending,
       (SELECT count(*) FROM ops.volunteer v WHERE v.tenant_id = i.tenant_id AND v.verification_status = 'verified' AND v.availability = 'available') AS volunteers_ready
FROM ops.incident i GROUP BY i.tenant_id, i.area_id;
