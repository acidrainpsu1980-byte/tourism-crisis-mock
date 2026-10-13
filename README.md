# Tourism Crisis Intelligence · Phuket Sandbox — เว็บจำลอง (ข้อมูล mock)

เว็บต้นแบบจำลอง "ระบบอัจฉริยะเพื่อบริหารความเสี่ยงและตอบสนองภาวะวิกฤติการท่องเที่ยวไทย" ปรับตามเอกสาร
`Tourism_Crisis_System_Design-1.docx` (รายงานออกแบบระบบและฐานข้อมูล PostgreSQL 10 ต.ค. 2569)
ใช้ **ข้อมูลจำลองทั้งหมด** ไม่มี backend และไม่มีการส่งข้อมูลออกภายนอก

## เปิดใช้งาน
```bash
cd tourism-crisis-mock
python3 -m http.server 8080      # แล้วเปิด http://localhost:8080
```
(เปิดไฟล์ `index.html` ตรงๆ ก็ได้) · เปิดหน้าจอตรงๆ ด้วย `index.html?screen=command&scenario=boat&role=dispatcher`

## สิ่งที่ปรับตามเอกสารออกแบบ
| หัวข้อในเอกสาร | สิ่งที่อยู่ในเว็บ |
|---|---|
| §3 บทบาท 7 แบบ + Tenant/Agency/Area Scope | เลือกบทบาทมุมขวาบน → เมนูและสิทธิ์เปลี่ยนตาม (ผู้บัญชาการอนุมัติประกาศ, ศูนย์สั่งการคัดกรอง/มอบหมาย, อาสาสมัครเห็นเฉพาะงานตน, นักท่องเที่ยวเห็นเฉพาะคำขอตน, ผู้ดูแลระบบไม่เห็นข้อมูลอ่อนไหว) |
| §4 FR01–FR18 | ทุกหน้าจอติดรหัส FR ที่รองรับ · หน้า Administration ทดสอบสิทธิ์ข้าม Tenant/Area Scope ได้ |
| §5.1 ข้อมูลและ BI | observed time / ingestion time แยกกัน · Stale เมื่อเกิน 2×รอบอัปเดต · Missing = NULL ไม่ใช่ 0 · กันชุดข้อมูลซ้ำด้วย external_batch_key |
| §5.2 SOS และมอบหมาย | POST /v1/sos แบบ Idempotency Key + Rate limit → เลขติดตาม · คัดกรอง → rescue_task · คะแนนลำดับ 0–100 (เร่งด่วน 35 / เปราะบาง 25 / ความรุนแรงพื้นที่ 20 / เวลารอ 20) + Hard Priority + ปรับได้พร้อมเหตุผล · เสนออาสาสมัครที่ผ่านตรวจสอบ ใบรับรองยังใช้ได้ ไม่เกิน max_active_tasks · Offered → Accepted → En route → On scene → Completed · หมดเวลาตอบรับคืนคิวอัตโนมัติ · Expected Version + State transition |
| §5.3 Mobility | Heatmap ราย cell (grid UTM 47N) · Occupancy vs Flow · coverage_fraction · ความหนาแน่น คน/ตร.กม. จากพื้นที่ที่สังเกตได้จริง · fusion_version · confidence · No data ไม่แสดงสีปลอดภัย · มุมมองสาธารณะปิดบังค่า < 10 |
| §6 หน้าจอ 9 หน้า | Executive Dashboard · Command Center · Analytical Dashboard · Risk Map · Mobility Heatmap · SOS Form & Tracking · Volunteer My Tasks · Data Management · Administration (+ ประกาศหลายภาษา, ทดสอบ & QA, Audit Log) |
| §6 KPI | เหตุยืนยัน · SOS ใหม่/ค้าง · เวลาเริ่มตอบสนอง P50/P95 (SOS บันทึก → คัดกรอง) · อัตราเสร็จตาม SLA · อัตราตอบรับ · อาสาพร้อม · ข้อมูลตรงเวลา · ความหนาแน่นในพื้นที่เสี่ยง — ทุก KPI มีสูตร หน่วย grain เวอร์ชัน และข้อจำกัด |
| §8 ฐานข้อมูล | `db/schema.sql` 35 ตาราง 6 schema (core/ingest/ops/geo/analytics/audit) · tenant_id ใน composite key · Partial Unique Index กันหัวหน้าภารกิจซ้ำ · Partition รายเดือน · Tenant RLS |
| §9 API | ชื่อฟังก์ชันใน `js/api.js` อิง POST /v1/sos, /v1/tasks/{id}/assign, /v1/tasks/{id}/events, GET /v1/dashboard/summary, /v1/maps/heatmap, POST /v1/imports, /v1/alerts/{id}/publish |
| §10–11 Cloud/SLO | สรุปสเปกระดับ A และ SLO ในหน้า Administration / QA |
| §12 แผนทดสอบ | หน้า QA รันชุดทดสอบ 12 กรณีจริงกับ Mock API (Batch ซ้ำ, SOS ซ้ำ, Rate limit, Concurrent assignment, เพดานงาน, ใบรับรองหมดอายุ, State transition, Version ล้าสมัย, หมดเวลาตอบรับ, เงื่อนไขอนุมัติประกาศ, สิทธิ์ข้าม Tenant/พื้นที่) |

## หน่วยงานภาคี (แผนนัดหมายประสานข้อมูลจังหวัดภูเก็ต 16 ต.ค. 2569)
หน้า **หน่วยงานภาคี (20 หน่วย)** แสดงหน่วยงานหลัก 20 หน่วย (AG01–AG20) หน่วยงานสนับสนุน 12 หน่วย (SP21–SP32) และกลุ่มที่เพิ่มตามความเสี่ยง (CD-*)
พร้อมตำแหน่งที่เชิญ ประเด็นหารือ ลิงก์ Data Catalog ข้อมูลที่ขอ ช่วงนัด 1–4 และสถานะการประสาน (ค่าจำลอง)
แต่ละหน่วยเชื่อมกับแหล่งข้อมูล (DS01–DS24) ผู้ใช้ ภารกิจ อาสาสมัคร บทบาท Lead/Support/รับทราบในแต่ละเหตุการณ์ และประกาศที่ต้องตอบรับ
SQL seed ของหน่วยงานและแหล่งข้อมูลอยู่ที่ `db/seed_agencies.sql`

## เหตุการณ์หลักจำลอง 3 เหตุการณ์
SIM-FL-001 น้ำท่วมฉับพลันป่าตอง · SIM-SEA-002 เรือประสบเหตุอ่าวฉลอง · SIM-CR-003 คนหนาแน่นเมืองเก่า

## โครงสร้างโค้ด
```
index.html          หน้าเดียว (SPA)
css/app.css         ธีมสว่าง/มืด, คอมโพเนนต์
js/data/seed.js     ข้อมูลจำลอง จัดรูปตามพจนานุกรมข้อมูลในเอกสาร (35 ตาราง)
js/api.js           Mock API — กฎธุรกิจทั้งหมดอยู่ที่นี่ · สลับเป็น fetch() ไป backend จริงได้โดยไม่แก้ UI
js/charts.js        กราฟ SVG (bar / line / heatmap / schematic map) ไม่ใช้ไลบรารี
js/app.js           router + 12 หน้าจอ + RBAC ตามบทบาท
db/schema.sql       DDL PostgreSQL 17 + PostGIS ตามเอกสาร
db/seed_agencies.sql  INSERT หน่วยงาน 35 รายการ + แหล่งข้อมูล 24 รายการ
```
สถานะที่ผู้ใช้เปลี่ยนเก็บใน `localStorage` · นาฬิกาจำลองเริ่ม 14:00 แล้วเดินตามเวลาจริง · ปุ่ม "รีเซ็ตข้อมูลจำลอง" อยู่ในหน้า Audit Log
