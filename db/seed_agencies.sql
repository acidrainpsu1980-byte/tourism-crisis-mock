-- Seed หน่วยงานภาคีจังหวัดภูเก็ต (แผนนัดหมาย 16 ต.ค. 2569) — สร้างจาก js/data/seed.js
-- รันหลัง schema.sql · ใช้ md5()::uuid ให้รหัสคงที่ · สถานะการประสานเป็นค่าจำลอง
BEGIN;
INSERT INTO core.tenant (tenant_id, name, status) VALUES (md5('T-PHUKET')::uuid, 'จังหวัดภูเก็ต (Phuket Sandbox)', 'active') ON CONFLICT DO NOTHING;
SELECT set_config('app.tenant_id', (md5('T-PHUKET')::uuid)::text, true);

INSERT INTO core.agency (tenant_id, agency_id, code, name, agency_type, tier, coord_status) VALUES
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG01')::uuid, 'AG01', 'สำนักงานจังหวัดภูเก็ต', 'provincial', 'core', 'agreement'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG02')::uuid, 'AG02', 'สำนักงานป้องกันและบรรเทาสาธารณภัยจังหวัดภูเก็ต', 'disaster', 'core', 'sample'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG03')::uuid, 'AG03', 'การท่องเที่ยวแห่งประเทศไทย สำนักงานภูเก็ต', 'tourism', 'core', 'met'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG04')::uuid, 'AG04', 'สำนักงานการท่องเที่ยวและกีฬาจังหวัดภูเก็ต', 'tourism', 'core', 'sample'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG05')::uuid, 'AG05', 'สำนักงานสาธารณสุขจังหวัดภูเก็ต', 'health', 'core', 'invited'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG06')::uuid, 'AG06', 'สำนักงานโยธาธิการและผังเมืองจังหวัดภูเก็ต', 'infrastructure', 'core', 'planned'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG07')::uuid, 'AG07', 'สำนักงานสถิติจังหวัดภูเก็ต', 'statistics', 'core', 'met'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG08')::uuid, 'AG08', 'ศูนย์ป้องกันและบรรเทาสาธารณภัย เขต 18 ภูเก็ต', 'disaster', 'core', 'invited'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG09')::uuid, 'AG09', 'สำนักงานเจ้าท่าภูมิภาคสาขาภูเก็ต', 'marine', 'core', 'met'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG10')::uuid, 'AG10', 'สำนักงานขนส่งจังหวัดภูเก็ต', 'transport', 'core', 'planned'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG11')::uuid, 'AG11', 'ตำรวจภูธรจังหวัดภูเก็ต', 'police', 'core', 'invited'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG12')::uuid, 'AG12', 'กองกำกับการ 8 กองบังคับการตำรวจน้ำ', 'police', 'core', 'invited'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG13')::uuid, 'AG13', 'ตำรวจท่องเที่ยวพื้นที่ภูเก็ต', 'police', 'core', 'met'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG14')::uuid, 'AG14', 'ท่าอากาศยานภูเก็ต (ทอท.)', 'transport', 'core', 'met'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG15')::uuid, 'AG15', 'แขวงทางหลวงภูเก็ต', 'infrastructure', 'core', 'planned'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG16')::uuid, 'AG16', 'สำนักงานทรัพยากรธรรมชาติและสิ่งแวดล้อมจังหวัดภูเก็ต', 'environment', 'core', 'invited'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG17')::uuid, 'AG17', 'โครงการชลประทานภูเก็ต', 'water', 'core', 'sample'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG18')::uuid, 'AG18', 'สำนักงานส่งเสริมการปกครองท้องถิ่นจังหวัดภูเก็ต', 'local_gov', 'core', 'planned'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG19')::uuid, 'AG19', 'องค์การบริหารส่วนจังหวัดภูเก็ต', 'local_gov', 'core', 'invited'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG20')::uuid, 'AG20', 'เทศบาลนครภูเก็ต', 'local_gov', 'core', 'met'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/SP21')::uuid, 'SP21', 'หอการค้าจังหวัดภูเก็ต', 'business', 'support', 'met'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/SP22')::uuid, 'SP22', 'สมาคมธุรกิจการท่องเที่ยวจังหวัดภูเก็ต', 'business', 'support', 'met'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/SP23')::uuid, 'SP23', 'ศูนย์อุตุนิยมวิทยาภาคใต้ฝั่งตะวันตก', 'weather', 'support', 'agreement'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/SP24')::uuid, 'SP24', 'การประปาส่วนภูมิภาคสาขาในพื้นที่นำร่องและประปาท้องถิ่น', 'utility', 'support', 'planned'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/SP25')::uuid, 'SP25', 'โรงพยาบาลวชิระภูเก็ตและหน่วยประสานการแพทย์ฉุกเฉิน', 'health', 'support', 'invited'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/SP26')::uuid, 'SP26', 'ตรวจคนเข้าเมืองจังหวัดภูเก็ต', 'immigration', 'support', 'planned'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/SP27')::uuid, 'SP27', 'ศรชล. จังหวัดภูเก็ตและหน่วยช่วยเหลือทางทะเล', 'marine', 'support', 'invited'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/SP28')::uuid, 'SP28', 'แขวงทางหลวงชนบทภูเก็ต', 'infrastructure', 'support', 'planned'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/SP29')::uuid, 'SP29', 'เทศบาลเมืองป่าตองและ อปท. นำร่องอื่น (ผ่านท้องถิ่นจังหวัด)', 'local_gov', 'support', 'met'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/SP30')::uuid, 'SP30', 'สำนักงานประชาสัมพันธ์จังหวัดภูเก็ต', 'communication', 'support', 'invited'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/SP31')::uuid, 'SP31', 'โรงแรม บริษัทนำเที่ยว ผู้ประกอบการเรือ และแหล่งท่องเที่ยวนำร่อง', 'business', 'support', 'planned'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/SP32')::uuid, 'SP32', 'กู้ชีพ มูลนิธิกู้ภัย และทีมไลฟ์การ์ดที่รับผิดชอบพื้นที่', 'volunteer_org', 'support', 'met'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/CD-DNP')::uuid, 'CD-DNP', 'อุทยานและหน่วยพื้นที่อนุรักษ์', 'environment', 'conditional', 'planned'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/CD-PEA')::uuid, 'CD-PEA', 'การไฟฟ้าส่วนภูมิภาค', 'utility', 'conditional', 'planned'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/CD-TEL')::uuid, 'CD-TEL', 'โทรคมนาคมหรือผู้ให้บริการข้อมูลการเคลื่อนที่', 'telecom', 'conditional', 'planned'),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/AG-UNI')::uuid, 'AG-UNI', 'ทีมวิจัย ม.วลัยลักษณ์', 'research', 'project', 'agreement')
ON CONFLICT (tenant_id, agency_id) DO NOTHING;

INSERT INTO ingest.data_source (tenant_id, source_id, agency_id, name, source_type, data_classification, refresh_seconds, agreement_reference, enabled) VALUES
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS01')::uuid, md5('T-PHUKET/SP23')::uuid, 'รายงานสภาพอากาศ (อุตุฯ ภาคใต้ฝั่งตะวันตก)', 'API', 'Public', 600, 'TMD Open Data API', true),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS02')::uuid, md5('T-PHUKET/AG02')::uuid, 'บันทึกเหตุสาธารณภัย (ปภ.จังหวัด)', 'Manual', 'Restricted', 60, 'ภายใน Tenant · ตัวอย่างข้อมูลได้รับแล้ว', true),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS03')::uuid, md5('T-PHUKET/AG20')::uuid, 'จุดตรวจนับคน (Smart City CCTV)', 'CCTV', 'Internal', 900, 'MOU-SMART-2569 (ร่าง)', true),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS04')::uuid, md5('T-PHUKET/AG03')::uuid, 'แหล่งท่องเที่ยว พิกัด ความจุ', 'File', 'Public', 2592000, 'TAT Data Catalog', true),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS05')::uuid, md5('T-PHUKET/CD-TEL')::uuid, 'ความหนาแน่นจากโทรศัพท์มือถือ', 'API', 'Restricted', 3600, 'รอกรณีใช้งานและงบประมาณ', false),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS06')::uuid, md5('T-PHUKET/AG-UNI')::uuid, 'Social Listening ไทย/อังกฤษ/จีน', 'Social', 'Internal', 3600, 'สัญญาผู้ให้บริการ', true),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS07')::uuid, md5('T-PHUKET/SP29')::uuid, 'เซนเซอร์ระดับน้ำ (ทม.ป่าตอง)', 'Sensor', 'Internal', 300, 'MOU-PATONG-2569', true),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS08')::uuid, md5('T-PHUKET/AG01')::uuid, 'ทำเนียบผู้ประสาน / ผู้รับแจ้งเตือน', 'File', 'Restricted', 604800, 'คำสั่งคณะทำงานข้อมูลจังหวัด', true),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS09')::uuid, md5('T-PHUKET/AG04')::uuid, 'สถิตินักท่องเที่ยวและรายได้รายเดือน', 'File', 'Public', 2592000, 'Excel สถิติรายจังหวัด 2569', true),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS10')::uuid, md5('T-PHUKET/AG05')::uuid, 'โรค/อาหารเป็นพิษ/ความจุ ER', 'API', 'Restricted', 86400, 'รอนัดกลุ่ม 2', false),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS11')::uuid, md5('T-PHUKET/AG06')::uuid, 'ผังเมืองและโครงสร้างพื้นฐาน (GIS)', 'File', 'Internal', 7776000, 'รอนัดกลุ่ม 3', false),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS12')::uuid, md5('T-PHUKET/AG07')::uuid, 'ประชากร รหัสพื้นที่ นิยามตัวแปร', 'File', 'Public', 31536000, 'บัญชีข้อมูลจังหวัด', true),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS13')::uuid, md5('T-PHUKET/AG08')::uuid, 'ทรัพยากรสนับสนุนและหอเตือนภัย เขต 18', 'File', 'Internal', 604800, 'รอนัดกลุ่ม 2', false),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS14')::uuid, md5('T-PHUKET/AG09')::uuid, 'ท่าเรือ ตารางเรือ ประกาศห้ามออกเรือ', 'File', 'Public', 86400, 'ชุดข้อมูลท่าเทียบเรือ (data.go.th)', true),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS15')::uuid, md5('T-PHUKET/AG10')::uuid, 'เส้นทางขนส่งสาธารณะ', 'File', 'Public', 2592000, 'รอนัดกลุ่ม 3', false),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS16')::uuid, md5('T-PHUKET/AG11')::uuid, 'เหตุ 191 อุบัติเหตุ จุดเสี่ยง', 'File', 'Restricted', 86400, 'รอนัดกลุ่ม 2 · API ต้องหารือ', false),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS17')::uuid, md5('T-PHUKET/AG12')::uuid, 'เหตุทางน้ำและทรัพยากรเรือ', 'File', 'Restricted', 86400, 'รอนัดกลุ่ม 2', false),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS18')::uuid, md5('T-PHUKET/AG13')::uuid, 'เหตุร้องเรียนนักท่องเที่ยว', 'File', 'Restricted', 86400, 'ตัวอย่าง CSV ไม่ระบุตัวบุคคล', true),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS19')::uuid, md5('T-PHUKET/AG14')::uuid, 'ผู้โดยสารและเที่ยวบิน HKT', 'File', 'Public', 86400, 'AOT สถิติการขนส่ง · feed สดต้องขอแยก', true),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS20')::uuid, md5('T-PHUKET/AG15')::uuid, 'ปิดถนน งานก่อสร้าง จุดเสี่ยงทางหลวง', 'File', 'Public', 86400, 'รอนัดกลุ่ม 3', false),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS21')::uuid, md5('T-PHUKET/AG16')::uuid, 'คุณภาพน้ำทะเลและชายหาด', 'File', 'Public', 604800, 'รอนัดกลุ่ม 2', false),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS22')::uuid, md5('T-PHUKET/AG17')::uuid, 'ระดับน้ำ/อ่างเก็บน้ำ (SWOC)', 'API', 'Public', 3600, 'SWOC Bearer token (ทดลอง)', true),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS23')::uuid, md5('T-PHUKET/AG18')::uuid, 'ขอบเขตตำบล/เทศบาล (Shapefile)', 'File', 'Public', 31536000, 'รอนัดกลุ่ม 3', false),
  (md5('T-PHUKET')::uuid, md5('T-PHUKET/DS24')::uuid, md5('T-PHUKET/AG19')::uuid, 'CCTV ศูนย์อพยพ ดับเพลิง (อบจ.)', 'File', 'Internal', 2592000, 'รอนัดกลุ่ม 3', false)
ON CONFLICT (tenant_id, source_id) DO NOTHING;
COMMIT;
