/* =====================================================================
 * MOCK SEED — Tourism Crisis Intelligence · Phuket Sandbox
 * โครงสร้างเลียนแบบพจนานุกรมข้อมูลในเอกสาร "Tourism_Crisis_System_Design"
 * (schema core / ingest / ops / geo / analytics / audit) — ดู db/schema.sql
 * ทุกชื่อบุคคล ทีม เวลา และตัวเลข เป็นข้อมูลสมมติเพื่อการสาธิตเท่านั้น
 * ===================================================================== */
window.SEED = (() => {
  const DAY = '2026-10-13';
  const T = (hhmm, day = DAY) => `${day}T${hhmm}:00+07:00`;
  const NOW = T('14:00');

  /* ---------- core.tenant / core.agency ---------- */
  const tenant = { tenant_id: 'T-PHUKET', name: 'จังหวัดภูเก็ต (Phuket Sandbox)', status: 'active' };
  const other_tenant = { tenant_id: 'T-BKK', name: 'กรุงเทพมหานคร (ยังไม่เชื่อมต่อ)', status: 'planned' };
  /* หน่วยงานตาม "แผนการนัดหมายหน่วยงานเพื่อประสานข้อมูลในจังหวัดภูเก็ต" (16 ต.ค. 2569)
   * tier core = หน่วยงานหลัก 20 หน่วย (ข้อ 2) · support = หน่วยงานสนับสนุน 21–32 (ข้อ 3) · conditional = เพิ่มตามความเสี่ยง (ข้อ 4)
   * round = ช่วงนัด (ข้อ 5): 1 เปิดโครงการ/ท่องเที่ยว-ธุรกิจ · 2 ภัยพิบัติ อากาศ น้ำ สุขภาพ ความปลอดภัย ทะเล · 3 ท้องถิ่น โครงสร้างพื้นฐาน ภาคสนาม · 4 Workshop รวม
   * coord_status (ค่าจำลอง): planned → invited → met → sample → agreement
   */
  const agencies = [
    { agency_id: 'AG01', no: 1,  tier: 'core', short: 'สนจ.ภูเก็ต', name: 'สำนักงานจังหวัดภูเก็ต', agency_type: 'provincial', invited: 'หัวหน้าสำนักงานจังหวัดภูเก็ต', func: 'coordination', round: 1,
      topics: 'หน่วยประสานกลาง พื้นที่นำร่อง ระบบข้อมูลจังหวัด CCTV เจ้าของระบบ Smart City โครงสร้างบัญชาการ และผู้รับผิดชอบข้อมูล',
      link: 'บัญชีข้อมูลจังหวัด · ประสานจังหวัด', link_mode: 'Catalog: ไฟล์ตามชุดข้อมูล; CCTV/ระบบภายในต้องขอสิทธิ์', urls: ['https://phuket.gdcatalog.go.th/', 'https://poc.phuket.go.th/public_name/index.php'],
      requested: 'ทำเนียบหน่วยงาน ผู้ประสาน เบอร์ LINE พื้นที่รับผิดชอบ; รายชื่อผู้รับแจ้งเตือน; พิกัด CCTV หอเตือนภัย ศูนย์อพยพ; ปฏิทินเทศกาลและอีเวนต์; คำสั่งคณะทำงานข้อมูลจังหวัด', coord_status: 'agreement', system_roles: ['หน่วยประสานหลัก', 'เจ้าของ Tenant', 'ผู้รับประกาศ'] },
    { agency_id: 'AG02', no: 2,  tier: 'core', short: 'ปภ.จ.ภูเก็ต', name: 'สำนักงานป้องกันและบรรเทาสาธารณภัยจังหวัดภูเก็ต', agency_type: 'disaster', invited: 'หัวหน้าสำนักงานป้องกันและบรรเทาสาธารณภัยจังหวัดภูเก็ต', func: 'disaster', round: 2,
      topics: 'ภัยพิบัติย้อนหลัง พื้นที่เสี่ยง จุดอพยพ เกณฑ์เตือน และแผนเผชิญเหตุ',
      link: 'DDPM Data Catalog · ระบบข้อมูลสาธารณภัย', link_mode: 'CSV/Excel ตาม resource; เหตุสด/แผนปฏิบัติการต้องประสานสิทธิ์', urls: ['https://catalog.disaster.go.th/dataset/', 'https://ddc.disaster.go.th/'],
      requested: 'บันทึกเหตุ (รหัส ประเภท พิกัด เวลาเกิด–รับแจ้ง ความรุนแรง สถานะ หน่วยรับผิดชอบ ผู้บาดเจ็บ/เสียชีวิตแยกสัญชาติ); เหตุย้อนหลัง 3–5 ปีพร้อมผลกระทบ; จุดเสี่ยง ประเภทภัย ฤดู; SOP/แผนเผชิญเหตุ; ทรัพยากรรถ เรือ กำลังคน จุดจอด สถานะพร้อมใช้; คำสำคัญเฝ้าระวัง', coord_status: 'sample', system_roles: ['ศูนย์สั่งการ', 'เจ้าของข้อมูลเหตุ', 'ผู้บัญชาการเหตุการณ์'] },
    { agency_id: 'AG03', no: 3,  tier: 'core', short: 'ททท.ภูเก็ต', name: 'การท่องเที่ยวแห่งประเทศไทย สำนักงานภูเก็ต', agency_type: 'tourism', invited: 'ผู้อำนวยการ การท่องเที่ยวแห่งประเทศไทย สำนักงานภูเก็ต', func: 'tourism', round: 1,
      topics: 'ตลาดนักท่องเที่ยว ฤดูกาล ภาพลักษณ์ การสื่อสารวิกฤติ และเกณฑ์ความเสี่ยงด้านตลาด',
      link: 'TAT Data Catalog', link_mode: 'Catalog: รูปแบบตาม resource; ข้อมูลตลาด/Social Listening ต้องยืนยันสิทธิ์', urls: ['https://datacatalog.tat.or.th/'],
      requested: 'นักท่องเที่ยวรายวันแยกสัญชาติ (Top 5) ย้อนหลัง ≥ 5 ปี; แหล่งท่องเที่ยว พิกัด ความจุ ช่วงหนาแน่น ผู้ดูแล; ปฏิทินวันหยุดตลาดหลัก; ผลกระทบเหตุในอดีตและวันฟื้นตัว; ข่าวปลอม ชุดสอน Sentiment; ล่ามและอาสาสมัคร', coord_status: 'met', system_roles: ['เจ้าของข้อมูลแหล่งท่องเที่ยว', 'ผู้รับประกาศ', 'ร่วมสื่อสารวิกฤติ'] },
    { agency_id: 'AG04', no: 4,  tier: 'core', short: 'กกจ.ภูเก็ต', name: 'สำนักงานการท่องเที่ยวและกีฬาจังหวัดภูเก็ต', agency_type: 'tourism', invited: 'ท่องเที่ยวและกีฬาจังหวัดภูเก็ต', func: 'tourism', round: 1,
      topics: 'สถิตินักท่องเที่ยว รายได้ แหล่งท่องเที่ยว กิจกรรม และตัวชี้วัด Dashboard',
      link: 'Excel สถิติรายจังหวัด 2569 · Excel เดือนสิงหาคม', link_mode: 'Excel ส่วนกลาง เลือกภูเก็ต; กิจกรรมและข้อมูลเฉพาะพื้นที่ขอเพิ่ม', urls: ['https://www.mots.go.th/news/category/820'],
      requested: 'รายได้รายเดือนและ YTD ค่าใช้จ่ายต่อหัว เป้าหมายประจำปี; อัตราเข้าพัก %; ราคาห้องเฉลี่ย แยกโซน', coord_status: 'sample', system_roles: ['เจ้าของข้อมูลสถิติท่องเที่ยว', 'ผู้ใช้ Dashboard'] },
    { agency_id: 'AG05', no: 5,  tier: 'core', short: 'สสจ.ภูเก็ต', name: 'สำนักงานสาธารณสุขจังหวัดภูเก็ต', agency_type: 'health', invited: 'นายแพทย์สาธารณสุขจังหวัดภูเก็ต', func: 'health', round: 2,
      topics: 'โรคและเหตุสุขภาพ อาหารเป็นพิษ สถานบริการ การแพทย์ฉุกเฉิน และเกณฑ์แจ้งเตือน',
      link: 'MoPH Open Data', link_mode: 'ข้อมูลรวม/API ตามรายงานและสิทธิ์; ไม่ใช่ข้อมูลผู้ป่วยรายบุคคล; ขอชุดสุขภาพภูเก็ตเพิ่ม', urls: ['https://opendata.moph.go.th/'],
      requested: 'โรคระบาด อาหารเป็นพิษ คุณภาพน้ำทะเล (แมงกะพรุน สาหร่าย) รายวัน; พิกัดและความจุ รพ. ER/เตียง; ข้อมูล 1669 เวลาตอบสนอง Triage จุดจอดรถพยาบาล SOP อุบัติภัยหมู่', coord_status: 'invited', system_roles: ['เจ้าของข้อมูลสุขภาพ', 'ผู้รับประกาศ', 'รับส่งต่อผู้บาดเจ็บ'] },
    { agency_id: 'AG06', no: 6,  tier: 'core', short: 'โยธาฯ ภูเก็ต', name: 'สำนักงานโยธาธิการและผังเมืองจังหวัดภูเก็ต', agency_type: 'infrastructure', invited: 'โยธาธิการและผังเมืองจังหวัดภูเก็ต', func: 'infrastructure', round: 3,
      topics: 'ผังเมือง การใช้ที่ดิน อาคารและโครงสร้างพื้นฐานในพื้นที่เสี่ยงน้ำท่วม ดินถล่ม และแผนที่ GIS',
      link: 'ช่องทางประสาน', link_mode: 'ขอไฟล์ GIS/SHP/GeoJSON และ CSV/Excel ตามสิทธิ์ ยังไม่มี URL ที่ยืนยัน', urls: [],
      requested: 'ผังเมือง GIS และโครงสร้างพื้นฐานในพื้นที่เสี่ยง (ไฟล์ไม่ระบุโดยตรง)', coord_status: 'planned', system_roles: ['เจ้าของชั้นข้อมูล GIS'] },
    { agency_id: 'AG07', no: 7,  tier: 'core', short: 'สนง.สถิติ ภูเก็ต', name: 'สำนักงานสถิติจังหวัดภูเก็ต', agency_type: 'statistics', invited: 'สถิติจังหวัดภูเก็ต', func: 'statistics', round: 1,
      topics: 'ประชากร เศรษฐกิจ ที่พัก นิยามตัวแปร และข้อมูลอ้างอิง',
      link: 'บัญชีข้อมูลจังหวัดภูเก็ต · ชุดข้อมูลการท่องเที่ยว', link_mode: 'CSV/Excel ตาม resource; ตรวจปีข้อมูล นิยามตัวแปร และพื้นที่ครอบคลุม', urls: ['https://phuket.gdcatalog.go.th/', 'https://gdcatalog.go.th/dataset/gdpublish-11_013'],
      requested: 'ขอบเขตและรหัสพื้นที่ ประชากร นิยามตัวแปรอ้างอิง', coord_status: 'met', system_roles: ['เจ้าของข้อมูลอ้างอิง / รหัสพื้นที่'] },
    { agency_id: 'AG08', no: 8,  tier: 'core', short: 'ศูนย์ ปภ.เขต 18', name: 'ศูนย์ป้องกันและบรรเทาสาธารณภัย เขต 18 ภูเก็ต', agency_type: 'disaster', invited: 'ผู้อำนวยการศูนย์ป้องกันและบรรเทาสาธารณภัยเขต 18 ภูเก็ต', func: 'disaster', round: 2,
      topics: 'ทรัพยากร ระบบเตือนภัย การซ้อม และการขอสนับสนุนข้ามจังหวัด',
      link: 'DDPM Data Catalog · ทะเบียนหน่วยงาน', link_mode: 'ชุดข้อมูลส่วนกลาง; ขอ CSV/Excel ทรัพยากรและการซ้อมของเขต 18', urls: ['https://catalog.disaster.go.th/dataset/'],
      requested: 'ทรัพยากรสนับสนุน หอเตือนภัย และแผนอุบัติภัยหมู่', coord_status: 'invited', system_roles: ['กำลังสนับสนุน', 'ผู้รับประกาศ'] },
    { agency_id: 'AG09', no: 9,  tier: 'core', short: 'เจ้าท่าภูเก็ต', name: 'สำนักงานเจ้าท่าภูมิภาคสาขาภูเก็ต', agency_type: 'marine', invited: 'ผู้อำนวยการสำนักงานเจ้าท่าภูมิภาคสาขาภูเก็ต', func: 'marine', round: 2,
      topics: 'ท่าเรือ เส้นทางเดินเรือ ประกาศจำกัดเดินเรือ และเหตุทางน้ำ',
      link: 'ชุดข้อมูลท่าเทียบเรือ · บัญชีข้อมูลกรมเจ้าท่า', link_mode: 'ไฟล์ตาม resource; ประกาศจำกัดเดินเรือและเหตุสดขอจากสาขาภูเก็ต', urls: ['https://data.go.th/dataset/dataset_12_0313', 'https://md.gdcatalog.go.th/'],
      requested: 'ตารางเรือโดยสาร จำนวนผู้โดยสาร สภาพคลื่นลม ประกาศห้ามออกเรือรายวัน; พิกัดท่าเรือ', coord_status: 'met', system_roles: ['เจ้าของข้อมูลท่าเรือ', 'ผู้ออกประกาศห้ามเดินเรือ', 'ผู้รับประกาศ'] },
    { agency_id: 'AG10', no: 10, tier: 'core', short: 'ขนส่ง จ.ภูเก็ต', name: 'สำนักงานขนส่งจังหวัดภูเก็ต', agency_type: 'transport', invited: 'ขนส่งจังหวัดภูเก็ต', func: 'transport', round: 3,
      topics: 'เส้นทาง จุดบริการ ผู้ประกอบการ และการปรับบริการเมื่อเกิดเหตุ',
      link: 'DLT Data Catalog', link_mode: 'ไฟล์ตาม resource; เส้นทางและการปรับบริการภูเก็ตขอ CSV/Excel จากจังหวัด', urls: ['https://gdcatalog.dlt.go.th/'],
      requested: 'เส้นทางขนส่งสาธารณะและการปรับบริการเมื่อเกิดเหตุ (ไฟล์ไม่ระบุโดยตรง)', coord_status: 'planned', system_roles: ['ผู้รับประกาศ', 'ปรับบริการขนส่ง'] },
    { agency_id: 'AG11', no: 11, tier: 'core', short: 'ภ.จว.ภูเก็ต', name: 'ตำรวจภูธรจังหวัดภูเก็ต', agency_type: 'police', invited: 'ผู้บังคับการตำรวจภูธรจังหวัดภูเก็ต', func: 'safety', round: 2,
      topics: 'อุบัติเหตุ ความปลอดภัย จุดเสี่ยง การปิดถนน และการส่งต่อเหตุ',
      link: 'ติดต่อตำรวจภูธรภูเก็ต', link_mode: 'ช่องทางประสาน; ขอ CSV/Excel สถิติเหตุและจุดเสี่ยง API ต้องหารือ', urls: ['https://phuket.police.go.th/contact/'],
      requested: 'เหตุ 191 อุบัติเหตุ อาชญากรรม พร้อมพิกัด เวลา สถานะ; จราจร จุดติดขัด จุดตรวจ Real-time; เหตุย้อนหลัง 3–5 ปี; พิกัดสถานีตำรวจ', coord_status: 'invited', system_roles: ['รับส่งต่อเหตุ', 'ปิดถนน/จราจร', 'ผู้รับประกาศ'] },
    { agency_id: 'AG12', no: 12, tier: 'core', short: 'กก.8 บก.รน.', name: 'กองกำกับการ 8 กองบังคับการตำรวจน้ำ', agency_type: 'police', invited: 'ผู้กำกับการ 8 กองบังคับการตำรวจน้ำ', func: 'marine', round: 2,
      topics: 'เหตุทางน้ำ การลาดตระเวน การช่วยเหลือนักท่องเที่ยวทางทะเล และขั้นตอนส่งต่อเหตุ',
      link: 'ช่องทางประสาน', link_mode: 'ขอ CSV/Excel สถิติเหตุทางน้ำและ SOP ยังไม่มี URL ที่ยืนยัน', urls: [],
      requested: 'เหตุทางน้ำ จมน้ำ เรือล่ม และทรัพยากรเรือ (ไฟล์ไม่ระบุโดยตรง)', coord_status: 'invited', system_roles: ['หน่วยกู้ภัยทางทะเล', 'รับมอบหมายภารกิจ'] },
    { agency_id: 'AG13', no: 13, tier: 'core', short: 'ตร.ท่องเที่ยว ภูเก็ต', name: 'ตำรวจท่องเที่ยวพื้นที่ภูเก็ต', agency_type: 'police', invited: 'สารวัตรตำรวจท่องเที่ยว 2 กก. 5 บก.ทท.', func: 'safety', round: 2,
      topics: 'เหตุร้องเรียน หลอกลวง การช่วยเหลือ หมวดหมู่เหตุ AI และ SOP ส่งต่อ',
      link: 'ตำรวจท่องเที่ยวภูเก็ต', link_mode: 'ช่องทางประสาน; ขอ CSV/Excel เหตุแบบไม่ระบุตัวบุคคล ยังไม่ยืนยัน API สาธารณะ', urls: ['https://phuket.tourist.police.go.th/'],
      requested: 'เหตุร้องเรียนและการช่วยเหลือนักท่องเที่ยวต่างชาติ (ไฟล์ไม่ระบุโดยตรง)', coord_status: 'met', system_roles: ['รับมอบหมายภารกิจ', 'ล่าม/ช่วยเหลือนักท่องเที่ยว', 'ผู้รับประกาศ'],
      note: 'ควรตรวจชื่อหน่วยปฏิบัติปัจจุบัน เว็บไซต์ทางการระบุ กก.2 บก.ทท.3 สำหรับพื้นที่ภูเก็ต' },
    { agency_id: 'AG14', no: 14, tier: 'core', short: 'ทอท. ภูเก็ต', name: 'ท่าอากาศยานภูเก็ต (ทอท.)', agency_type: 'transport', invited: 'ผู้อำนวยการท่าอากาศยานภูเก็ต', func: 'transport', round: 1,
      topics: 'ผู้โดยสาร เที่ยวบิน ล่าช้า ยกเลิก ความหนาแน่น และแผนหยุดชะงัก',
      link: 'AOT สถิติการขนส่ง', link_mode: 'หน้าเผยแพร่/ไฟล์สถิติ เลือก HKT; เที่ยวบินล่าช้า/ยกเลิกสดต้องขอ feed แยก', urls: ['https://investor.airportthai.co.th/transport.html'],
      requested: 'ตารางบิน ผู้โดยสารขาเข้า–ออก ความล่าช้า เมืองต้นทาง รายวัน; ยอดจองล่วงหน้า', coord_status: 'met', system_roles: ['เจ้าของข้อมูลผู้โดยสาร', 'ผู้รับประกาศ'] },
    { agency_id: 'AG15', no: 15, tier: 'core', short: 'แขวงทางหลวงภูเก็ต', name: 'แขวงทางหลวงภูเก็ต', agency_type: 'infrastructure', invited: 'ผู้อำนวยการแขวงทางหลวงภูเก็ต', func: 'infrastructure', round: 3,
      topics: 'โครงข่ายถนน จุดเสี่ยง ปิดถนน งานก่อสร้าง และทางหลีกเลี่ยง',
      link: 'กรมทางหลวง Data Catalog', link_mode: 'Catalog ส่วนกลาง; ขอไฟล์ GIS/CSV/Excel ปิดถนนและจุดเสี่ยงภูเก็ต; ยังไม่ยืนยัน API สด', urls: ['https://data.doh.go.th'],
      requested: 'ปริมาณจราจร จุดติดขัด อุบัติเหตุ Real-time', coord_status: 'planned', system_roles: ['ปิดถนน/ทางเลี่ยง', 'ผู้รับประกาศ'] },
    { agency_id: 'AG16', no: 16, tier: 'core', short: 'ทสจ.ภูเก็ต', name: 'สำนักงานทรัพยากรธรรมชาติและสิ่งแวดล้อมจังหวัดภูเก็ต', agency_type: 'environment', invited: 'ผู้อำนวยการสำนักงานทรัพยากรธรรมชาติและสิ่งแวดล้อมจังหวัดภูเก็ต', func: 'environment', round: 2,
      topics: 'มลพิษ น้ำเสีย คุณภาพชายหาด ทรัพยากรชายฝั่ง จุดตรวจวัด และเหตุผิดปกติ',
      link: 'DMCR Data Catalog', link_mode: 'ช่องทางประสาน; ขอ CSV/Excel/GIS จุดตรวจวัดภูเก็ต; DMCR ใช้เสริมข้อมูลทางทะเล', urls: ['https://dmcr.gdcatalog.go.th/'],
      requested: 'คุณภาพน้ำทะเลและชายหาด (ไฟล์ไม่ระบุโดยตรง)', coord_status: 'invited', system_roles: ['เจ้าของข้อมูลคุณภาพน้ำ'] },
    { agency_id: 'AG17', no: 17, tier: 'core', short: 'ชป.ภูเก็ต', name: 'โครงการชลประทานภูเก็ต', agency_type: 'water', invited: 'ผู้อำนวยการโครงการชลประทานภูเก็ต', func: 'water', round: 2,
      topics: 'ระดับน้ำ อ่างเก็บน้ำ การระบายน้ำ น้ำท่วม ภัยแล้ง และจุดตรวจวัด',
      link: 'SWOC REST API (RID)', link_mode: 'API ต้องสมัคร/Bearer token; ยืนยันสถานีภูเก็ต; ขอ CSV/Excel หากไม่มีใน API', urls: ['https://bigdata-api.rid.go.th/api/v1/openapi', 'https://swoc-api-service.rid.go.th/api/docs/'],
      requested: 'ระดับน้ำ (ไฟล์ระบุแหล่ง สทนช. ใช้ชลประทานเสริม)', coord_status: 'sample', system_roles: ['เจ้าของข้อมูลระดับน้ำ', 'ผู้รับประกาศ'] },
    { agency_id: 'AG18', no: 18, tier: 'core', short: 'สถ.จ.ภูเก็ต', name: 'สำนักงานส่งเสริมการปกครองท้องถิ่นจังหวัดภูเก็ต', agency_type: 'local_gov', invited: 'ท้องถิ่นจังหวัดภูเก็ต', func: 'local', round: 3,
      topics: 'ประสาน อปท. เจ้าของพื้นที่นำร่อง บัญชีข้อมูลท้องถิ่น และผู้รับผิดชอบเหตุระดับพื้นที่',
      link: 'บัญชีข้อมูลท้องถิ่นภูเก็ต · ทะเบียนหน่วยงาน', link_mode: 'Catalog และช่องทางหาเจ้าของพื้นที่; ขอ CSV/Excel/GIS ผ่าน อปท.', urls: ['https://phuket-local.gdcatalog.go.th/'],
      requested: 'Shapefile ตำบล/เทศบาล พร้อมรหัสพื้นที่; ช่องทางประสาน อปท.', coord_status: 'planned', system_roles: ['ประสาน อปท.', 'เจ้าของขอบเขตพื้นที่'] },
    { agency_id: 'AG19', no: 19, tier: 'core', short: 'อบจ.ภูเก็ต', name: 'องค์การบริหารส่วนจังหวัดภูเก็ต', agency_type: 'local_gov', invited: 'นายกองค์การบริหารส่วนจังหวัดภูเก็ต', func: 'local', round: 3,
      topics: 'แผนที่ ระบบข้อมูล CCTV โครงสร้างพื้นฐาน และทรัพยากรสนับสนุน',
      link: 'อบจ ภูเก็ต', link_mode: 'ช่องทางประสาน; ขอ CSV/Excel/GIS และ API ระบบเดิมเมื่อได้รับอนุญาต', urls: ['https://www.phuketpao.go.th/news'],
      requested: 'พิกัด CCTV ศูนย์อพยพ รพ. ดับเพลิง พร้อมความจุและเบอร์ติดต่อ; Shapefile', coord_status: 'invited', system_roles: ['เจ้าของ CCTV/ศูนย์อพยพ', 'กำลังสนับสนุน', 'ผู้รับประกาศ'] },
    { agency_id: 'AG20', no: 20, tier: 'core', short: 'ทน.ภูเก็ต', name: 'เทศบาลนครภูเก็ต', agency_type: 'local_gov', invited: 'นายกเทศมนตรีเทศบาลนครภูเก็ต', func: 'local', round: 3,
      topics: 'จุดเสี่ยงในเขตเมือง ระบายน้ำ จุดอพยพ CCTV และผู้รับผิดชอบเหตุ',
      link: 'บัญชีข้อมูลท้องถิ่นภูเก็ต', link_mode: 'Catalog ท้องถิ่น; ขอ CSV/Excel/GIS; CCTV ต้องขอสิทธิ์', urls: ['https://phuket-local.gdcatalog.go.th/'],
      requested: 'พิกัด CCTV ศูนย์อพยพ ดับเพลิง หอเตือนภัย พร้อมความจุและเบอร์ติดต่อ', coord_status: 'met', system_roles: ['เจ้าของพื้นที่เมืองเก่า', 'เจ้าของ CCTV นับคน', 'ผู้รับประกาศ'] },
    /* ---- หน่วยงานสนับสนุน (ข้อ 3) ---- */
    { agency_id: 'SP21', no: 21, tier: 'support', short: 'หอการค้าภูเก็ต', name: 'หอการค้าจังหวัดภูเก็ต', agency_type: 'business', func: 'tourism', round: 1, topics: 'ผลกระทบเศรษฐกิจ ความเชื่อมั่น การหยุดชะงักธุรกิจ และเครือข่ายทดลอง', link: 'ประสานผ่านหอการค้า', link_mode: 'ขอ CSV/Excel สำรวจผลกระทบ ไม่มี API ที่ยืนยัน', urls: ['https://www.phuketchamber.com/home'], coord_status: 'met', system_roles: ['ผู้รับประกาศ (ผู้ประกอบการ)'] },
    { agency_id: 'SP22', no: 22, tier: 'support', short: 'สมาคมธุรกิจท่องเที่ยว', name: 'สมาคมธุรกิจการท่องเที่ยวจังหวัดภูเก็ต', agency_type: 'business', func: 'tourism', round: 1, topics: 'เส้นทางทัวร์ การยกเลิกบริการ ข้อร้องเรียน และกลุ่มผู้ทดสอบ', link: 'ประสานผ่านสมาคม', link_mode: 'ขอ CSV/Excel จากสมาชิกตามข้อตกลง', urls: ['https://www.phukettourist.com/'], coord_status: 'met', system_roles: ['ผู้รับประกาศ', 'กลุ่มผู้ทดสอบ'] },
    { agency_id: 'SP23', no: 23, tier: 'support', short: 'อุตุฯ ภาคใต้ฝั่งตะวันตก', name: 'ศูนย์อุตุนิยมวิทยาภาคใต้ฝั่งตะวันตก', agency_type: 'weather', func: 'weather', round: 2, topics: 'ฝน ลม พยากรณ์ คำเตือน อากาศทางทะเล และสถานีตรวจวัด', link: 'TMD Open Data · บริการข้อมูล TMD', link_mode: 'API JSON/XML และ CSV ตามบริการ; ตรวจสิทธิ์ สถานี และความถี่ก่อนเชื่อม', urls: ['https://data.tmd.go.th/dataset/index.php', 'https://www.tmd.go.th/service/serviceData', 'https://phuketmet.tmd.go.th/th'], coord_status: 'agreement', system_roles: ['เจ้าของข้อมูลอากาศ'] },
    { agency_id: 'SP24', no: 24, tier: 'support', short: 'กปภ. / ประปาท้องถิ่น', name: 'การประปาส่วนภูมิภาคสาขาในพื้นที่นำร่องและประปาท้องถิ่น', agency_type: 'utility', func: 'infrastructure', round: 3, topics: 'พื้นที่บริการ ผลิตและใช้น้ำ หยุดจ่ายน้ำ และข้อจำกัดช่วงท่องเที่ยว', link: 'PWA Open Data · บริการข้อมูล GIS', link_mode: 'Catalog ตาม resource; การใช้น้ำ/หยุดจ่ายน้ำระดับพื้นที่ต้องขอสิทธิ์', urls: ['https://opendata.pwa.co.th/', 'https://pwagis.pwa.co.th/dwt/'], coord_status: 'planned', system_roles: ['ผู้รับประกาศ'] },
    { agency_id: 'SP25', no: 25, tier: 'support', short: 'รพ.วชิระภูเก็ต / EMS', name: 'โรงพยาบาลวชิระภูเก็ตและหน่วยประสานการแพทย์ฉุกเฉิน', agency_type: 'health', func: 'health', round: 2, topics: 'เหตุฉุกเฉินแบบสรุป เวลาตอบสนอง จุดบริการ และขั้นตอนส่งต่อ', link: 'ติดต่อ รพ วชิระภูเก็ต', link_mode: 'ขอ CSV/Excel เหตุฉุกเฉินรวมและเวลาตอบสนอง ไม่ใช่ API เปิด', urls: ['https://www.vachiraphuket.go.th/contact/'], coord_status: 'invited', system_roles: ['รับมอบหมายภารกิจการแพทย์', 'รับส่งต่อผู้บาดเจ็บ'] },
    { agency_id: 'SP26', no: 26, tier: 'support', short: 'ตม.ภูเก็ต', name: 'ตรวจคนเข้าเมืองจังหวัดภูเก็ต', agency_type: 'immigration', func: 'tourism', round: 2, topics: 'สถิติต่างชาติแบบรวมตามเวลาและสัญชาติ ขอบเขตและสิทธิใช้ข้อมูล', link: 'ติดต่อ ตม ภูเก็ต', link_mode: 'ขอ CSV/Excel สถิติรวม; ไม่เชื่อมข้อมูลบุคคลโดยอัตโนมัติ', urls: ['https://www.phuketimmigration.go.th/contact-pkimm.php'], coord_status: 'planned', system_roles: ['เจ้าของสถิติรวม'] },
    { agency_id: 'SP27', no: 27, tier: 'support', short: 'ศรชล.จ.ภูเก็ต', name: 'ศรชล. จังหวัดภูเก็ตและหน่วยช่วยเหลือทางทะเล', agency_type: 'marine', func: 'marine', round: 2, topics: 'พื้นที่รับผิดชอบ ทรัพยากรช่วยเหลือ และขั้นตอนประสานเหตุ', link: 'ติดต่อ ศรชล', link_mode: 'ช่องทางประสานส่วนกลางเพื่อส่งต่อจังหวัด; ขอ CSV/Excel/SOP และสิทธิ์ข้อมูลเหตุ', urls: ['https://thai-mecc.go.th/thaimeccsite/th/contact/hq'], coord_status: 'invited', system_roles: ['กำลังสนับสนุนทางทะเล', 'ผู้รับประกาศ'] },
    { agency_id: 'SP28', no: 28, tier: 'support', short: 'ทางหลวงชนบทภูเก็ต', name: 'แขวงทางหลวงชนบทภูเก็ต', agency_type: 'infrastructure', func: 'infrastructure', round: 3, topics: 'โครงข่ายถนน จุดเสี่ยง ปิดถนน งานก่อสร้าง และทางหลีกเลี่ยง', link: 'ทางหลวงชนบท Data Portal', link_mode: 'Catalog ส่วนกลาง; ขอไฟล์ GIS/CSV/Excel ปิดถนนและจุดเสี่ยงภูเก็ต', urls: ['http://dataportal.drr.go.th'], coord_status: 'planned', system_roles: ['ปิดถนน/ทางเลี่ยง'] },
    { agency_id: 'SP29', no: 29, tier: 'support', short: 'ทม.ป่าตอง / อปท.นำร่อง', name: 'เทศบาลเมืองป่าตองและ อปท. นำร่องอื่น (ผ่านท้องถิ่นจังหวัด)', agency_type: 'local_gov', func: 'local', round: 3, topics: 'จุดเสี่ยง ระบายน้ำ จุดอพยพ CCTV ชายหาด และผู้รับผิดชอบเหตุ', link: 'บัญชีข้อมูลท้องถิ่นภูเก็ต', link_mode: 'ขอ CSV/Excel/GIS; CCTV ต้องขอสิทธิ์', urls: ['https://phuket-local.gdcatalog.go.th/'], coord_status: 'met', system_roles: ['เจ้าของพื้นที่ป่าตอง', 'เจ้าของเซนเซอร์ระดับน้ำ', 'ผู้รับประกาศ'] },
    { agency_id: 'SP30', no: 30, tier: 'support', short: 'ประชาสัมพันธ์จังหวัด', name: 'สำนักงานประชาสัมพันธ์จังหวัดภูเก็ต', agency_type: 'communication', func: 'coordination', round: 2, topics: 'ประกาศทางการ ยืนยันข่าว ช่องทางสื่อสาร และผู้อนุมัติข้อความ', link: 'ข่าวประกาศภูเก็ต', link_mode: 'ขอ feed/API/RSS หรือไฟล์ประกาศ ยังไม่ยืนยัน endpoint', urls: ['https://phuket.prd.go.th/th/content/category/index/id/57'], coord_status: 'invited', system_roles: ['ช่องทางเผยแพร่ประกาศ', 'ยืนยันข่าว'] },
    { agency_id: 'SP31', no: 31, tier: 'support', short: 'ผู้ประกอบการนำร่อง', name: 'โรงแรม บริษัทนำเที่ยว ผู้ประกอบการเรือ และแหล่งท่องเที่ยวนำร่อง', agency_type: 'business', func: 'tourism', round: 3, topics: 'ยกเลิกบริการ จำนวนผู้ใช้แบบรวม เหตุขัดข้อง และความต้องการแจ้งเตือน', link: 'ประสานผ่านสมาคม/หอการค้า', link_mode: 'CSV/Excel จากผู้ประกอบการตามข้อตกลง; ใช้ข้อมูลรวม', urls: [], coord_status: 'planned', system_roles: ['แจ้ง SOS แทนแขก', 'ผู้รับประกาศ'] },
    { agency_id: 'SP32', no: 32, tier: 'support', short: 'กู้ชีพ/มูลนิธิ/ไลฟ์การ์ด', name: 'กู้ชีพ มูลนิธิกู้ภัย และทีมไลฟ์การ์ดที่รับผิดชอบพื้นที่', agency_type: 'volunteer_org', func: 'rescue', round: 3, topics: 'เหตุช่วยเหลือ จุดเสี่ยง เวลาตอบสนอง พื้นที่ครอบคลุม และข้อจำกัด', link: 'ประสานหน่วยรับผิดชอบ', link_mode: 'ขอ CSV/Excel บันทึกช่วยเหลือแบบไม่ระบุตัวบุคคล', urls: [], coord_status: 'met', system_roles: ['อาสาสมัครภาคสนาม', 'รับมอบหมายภารกิจ'] },
    /* ---- เพิ่มตามความเสี่ยง (ข้อ 4) ---- */
    { agency_id: 'CD-DNP', no: null, tier: 'conditional', short: 'อุทยานฯ', name: 'อุทยานและหน่วยพื้นที่อนุรักษ์', agency_type: 'environment', func: 'environment', round: 4, topics: 'จำนวนผู้เข้าใช้ จุดเสี่ยง พื้นที่ปิด และแผนช่วยเหลือ (เมื่อพื้นที่นำร่องอยู่ในเขตรับผิดชอบ)', link: 'DNP Data Catalog', link_mode: 'ไฟล์ตาม resource', urls: ['https://catalog.dnp.go.th/'], coord_status: 'planned', system_roles: [] },
    { agency_id: 'CD-PEA', no: null, tier: 'conditional', short: 'กฟภ.', name: 'การไฟฟ้าส่วนภูมิภาค', agency_type: 'utility', func: 'infrastructure', round: 4, topics: 'พื้นที่ไฟดับและการคืนบริการ (เมื่อวิเคราะห์ความต่อเนื่องโครงสร้างพื้นฐาน)', link: 'การไฟฟ้าส่วนภูมิภาค', link_mode: 'ขอ CSV/Excel/API สถานะไฟดับตามสิทธิ์', urls: ['https://www.pea.co.th/'], coord_status: 'planned', system_roles: [] },
    { agency_id: 'CD-TEL', no: null, tier: 'conditional', short: 'ผู้ให้บริการโทรคมนาคม', name: 'โทรคมนาคมหรือผู้ให้บริการข้อมูลการเคลื่อนที่', agency_type: 'telecom', func: 'mobility', round: 4, topics: 'ข้อมูลรวม ความละเอียด ความถี่ ราคา และข้อจำกัด (เมื่อมีกรณีใช้งานและงบประมาณ)', link: 'ประสานผ่านสำนักงานจังหวัด', link_mode: 'CSV/Excel/API ข้อมูลรวมตามสัญญา', urls: [], coord_status: 'planned', system_roles: [] },
    /* ---- ทีมโครงการ ---- */
    { agency_id: 'AG-UNI', no: null, tier: 'project', short: 'ทีมวิจัย', name: 'ทีมวิจัย ม.วลัยลักษณ์', agency_type: 'research', func: 'research', round: null, topics: 'พัฒนาระบบ AI Application และ Dashboard', link: '—', link_mode: '—', urls: [], coord_status: 'agreement', system_roles: ['ผู้พัฒนาระบบ', 'Data Steward'] },
  ];
  const agency_functions = { coordination: 'ประสานกลาง/สื่อสาร', disaster: 'ภัยพิบัติ', tourism: 'ท่องเที่ยว/ธุรกิจ', health: 'สุขภาพ', infrastructure: 'โครงสร้างพื้นฐาน', statistics: 'สถิติ', marine: 'ทะเล', transport: 'ขนส่ง', safety: 'ความปลอดภัย', environment: 'สิ่งแวดล้อม', water: 'น้ำ', local: 'ท้องถิ่น', weather: 'อากาศ', rescue: 'กู้ภัย', mobility: 'การเคลื่อนที่', research: 'วิจัย' };
  const meeting_rounds = [
    { round: 1, title: 'เปิดโครงการ 2 ชม. และวงย่อยท่องเที่ยวและธุรกิจ 90 นาที', output: 'พื้นที่นำร่อง ความเสี่ยงสำคัญ ผู้ประสาน และบัญชีข้อมูลเบื้องต้น', week: 'สัปดาห์ 1' },
    { round: 2, title: 'กลุ่มภัยพิบัติ อากาศ น้ำ สุขภาพ ความปลอดภัย และทะเล กลุ่มละ 90–120 นาที', output: 'เกณฑ์เตือนภัย ประวัติเหตุ SOP และแผนขอข้อมูลตัวอย่าง', week: 'สัปดาห์ 2' },
    { round: 3, title: 'ท้องถิ่น โครงสร้างพื้นฐาน ผู้ประกอบการ และทีมภาคสนาม ลงพื้นที่ตามโซน', output: 'พิกัดตรวจสอบแล้ว ความต้องการมือถือ และกรณีทดสอบจริง', week: 'สัปดาห์ 3' },
    { round: 4, title: 'Workshop รวมเจ้าของข้อมูลและผู้ใช้ระบบ 3 ชั่วโมง', output: 'ทะเบียนข้อมูล ช่องทางเชื่อมต่อ ตัวชี้วัด และแผนทดสอบต้นแบบ', week: 'สัปดาห์ 4' },
  ];


  /* ---------- core.role ---------- */
  const roles = [
    { role_code: 'commander',  name: 'ผู้บริหาร / ผู้บัญชาการเหตุการณ์', duty: 'ภาพรวม KPI ความเสี่ยง และอนุมัติประกาศ', scope: 'พื้นที่และหน่วยงานที่ได้รับสิทธิ์',
      can: ['view_ops', 'view_analytics', 'approve_alert', 'protocol'], screens: ['exec', 'command', 'alerts', 'agencies', 'analytics', 'risk', 'heatmap', 'audit'] },
    { role_code: 'dispatcher', name: 'เจ้าหน้าที่ศูนย์สั่งการ', duty: 'ตรวจสอบเหตุ คัดกรอง SOS มอบหมายและปิดงาน', scope: 'เหตุและข้อมูลติดต่อเฉพาะที่รับผิดชอบ',
      can: ['view_ops', 'view_analytics', 'screen_sos', 'assign', 'task_update', 'draft_alert', 'publish_alert', 'protocol', 'view_contact'], screens: ['command', 'alerts', 'exec', 'agencies', 'analytics', 'risk', 'heatmap', 'data', 'audit'] },
    { role_code: 'agency',     name: 'เจ้าหน้าที่หน่วยงาน', duty: 'ปรับข้อมูล ติดตามภารกิจและตอบรับประกาศ', scope: 'หน่วยงานและพื้นที่ที่ได้รับมอบหมาย',
      can: ['view_ops', 'view_analytics', 'ack_alert'], screens: ['alerts', 'agencies', 'exec', 'risk', 'heatmap', 'audit'] },
    { role_code: 'steward',    name: 'ผู้ดูแลข้อมูลและนักวิเคราะห์', duty: 'ตรวจคุณภาพ กำหนด KPI วิเคราะห์แนวโน้ม', scope: 'ข้อมูลตามระดับชั้นและสิทธิ์ส่งออก',
      can: ['view_analytics', 'quality', 'kpi', 'export', 'test'], screens: ['data', 'agencies', 'analytics', 'risk', 'heatmap', 'qa', 'audit'] },
    { role_code: 'volunteer',  name: 'อาสาสมัครที่ผ่านการตรวจสอบ', duty: 'รับงาน รายงานตำแหน่งและความคืบหน้า', scope: 'ภารกิจของตนและข้อมูลช่วยเหลือที่จำเป็น',
      can: ['my_tasks'], screens: ['mytasks'] },
    { role_code: 'tourist',    name: 'นักท่องเที่ยวและประชาชน', duty: 'ดูประกาศ แจ้ง SOS และติดตามคำขอ', scope: 'ข้อมูลสาธารณะและคำขอของตน',
      can: ['sos_submit'], screens: ['sos'] },
    { role_code: 'admin',      name: 'ผู้ดูแลระบบ', duty: 'ตั้งค่า บริหารบัญชีและตรวจสถานะบริการ', scope: 'ไม่ได้รับสิทธิ์ดูข้อมูลอ่อนไหวโดยอัตโนมัติ',
      can: ['admin', 'test'], screens: ['admin', 'agencies', 'data', 'qa', 'audit'] },
  ];

  /* ---------- geo.area / core.tourism_asset ---------- */
  const areas = [
    { area_id: 'A0', official_code: 'TH-83',      name: 'ภูเก็ต',     level: 'province', parent_area_id: null, x: 50, y: 50 },
    { area_id: 'A1', official_code: 'TH-83-PTG',  name: 'ป่าตอง',     level: 'subdistrict', parent_area_id: 'A0', capacity: 600, x: 28, y: 44 },
    { area_id: 'A2', official_code: 'TH-83-KRN',  name: 'กะรน',       level: 'subdistrict', parent_area_id: 'A0', capacity: 350, x: 30, y: 62 },
    { area_id: 'A3', official_code: 'TH-83-OLD',  name: 'เมืองเก่า',   level: 'subdistrict', parent_area_id: 'A0', capacity: 500, x: 62, y: 60 },
    { area_id: 'A4', official_code: 'TH-83-CHL',  name: 'อ่าวฉลอง',   level: 'subdistrict', parent_area_id: 'A0', capacity: 450, x: 56, y: 76 },
  ];
  const tourism_assets = [
    { asset_id: 'AS01', area_id: 'A1', name: 'หาดป่าตอง', asset_type: 'beach', capacity: 3000 },
    { asset_id: 'AS02', area_id: 'A1', name: 'จุดรวมพล โรงเรียนเทศบาลป่าตอง', asset_type: 'safe_point', capacity: 800 },
    { asset_id: 'AS03', area_id: 'A3', name: 'ถนนถลาง (ย่านเมืองเก่า)', asset_type: 'walking_street', capacity: 2500 },
    { asset_id: 'AS04', area_id: 'A4', name: 'ท่าเทียบเรืออ่าวฉลอง', asset_type: 'pier', capacity: 1200 },
    { asset_id: 'AS05', area_id: 'A2', name: 'หาดกะรน', asset_type: 'beach', capacity: 2000 },
  ];

  /* ---------- ops.hazard_type ---------- */
  const hazard_types = [
    { hazard_code: 'flood',   name: 'น้ำท่วม / ฝนตกหนัก' },
    { hazard_code: 'marine',  name: 'เหตุทางทะเล / คลื่นลม' },
    { hazard_code: 'crowd',   name: 'ความหนาแน่น / เบียดเสียด' },
    { hazard_code: 'traffic', name: 'อุบัติเหตุจราจร' },
    { hazard_code: 'health',  name: 'สุขภาพ / โรคระบาด' },
  ];

  /* ---------- core.app_user (ตัวอย่าง) ---------- */
  const users = [
    { user_id: 'U01', display_name: 'ผู้บัญชาการเหตุการณ์ (จำลอง)', role_code: 'commander',  agency_id: 'AG02',   area_scope: ['A0'], preferred_language: 'th', active: true, auth_subject: 'oidc|u01' },
    { user_id: 'U02', display_name: 'เจ้าหน้าที่ศูนย์สั่งการ 1',     role_code: 'dispatcher', agency_id: 'AG02',   area_scope: ['A1', 'A2'], preferred_language: 'th', active: true, auth_subject: 'oidc|u02' },
    { user_id: 'U03', display_name: 'เจ้าหน้าที่ศูนย์สั่งการ 2',     role_code: 'dispatcher', agency_id: 'AG02',   area_scope: ['A3', 'A4'], preferred_language: 'th', active: true, auth_subject: 'oidc|u03' },
    { user_id: 'U04', display_name: 'เจ้าหน้าที่เจ้าท่า',           role_code: 'agency',     agency_id: 'AG09', area_scope: ['A4'], preferred_language: 'th', active: true, auth_subject: 'oidc|u04' },
    { user_id: 'U05', display_name: 'ผู้ดูแลข้อมูล (Data Steward)',  role_code: 'steward',    agency_id: 'AG-UNI',    area_scope: ['A0'], preferred_language: 'th', active: true, auth_subject: 'oidc|u05' },
    { user_id: 'U06', display_name: 'ผู้ดูแลระบบ',                   role_code: 'admin',      agency_id: 'AG-UNI',    area_scope: [], preferred_language: 'th', active: true, auth_subject: 'oidc|u06' },
    { user_id: 'U07', display_name: 'เจ้าหน้าที่เทศบาลป่าตอง',       role_code: 'agency',     agency_id: 'SP29', area_scope: ['A1'], preferred_language: 'th', active: false, auth_subject: 'oidc|u07' },
    { user_id: 'U09', display_name: 'เจ้าหน้าที่ ภ.จว.ภูเก็ต',        role_code: 'agency',     agency_id: 'AG11',      area_scope: ['A0'], preferred_language: 'th', active: true, auth_subject: 'oidc|u09' },
    { user_id: 'U10', display_name: 'เจ้าหน้าที่ตำรวจท่องเที่ยว',     role_code: 'agency',     agency_id: 'AG13',      area_scope: ['A1', 'A3'], preferred_language: 'th', active: true, auth_subject: 'oidc|u10' },
    { user_id: 'U11', display_name: 'เจ้าหน้าที่ ทน.ภูเก็ต',         role_code: 'agency',     agency_id: 'AG20',      area_scope: ['A3'], preferred_language: 'th', active: true, auth_subject: 'oidc|u11' },
    { user_id: 'U12', display_name: 'เจ้าหน้าที่ ททท.ภูเก็ต',         role_code: 'agency',     agency_id: 'AG03',      area_scope: ['A0'], preferred_language: 'en', active: true, auth_subject: 'oidc|u12' },
    { user_id: 'U13', display_name: 'เจ้าหน้าที่ สนจ.ภูเก็ต (ประสานหลัก)', role_code: 'commander', agency_id: 'AG01', area_scope: ['A0'], preferred_language: 'th', active: true, auth_subject: 'oidc|u13' },
    { user_id: 'U08', display_name: 'ผู้ใช้จาก Tenant กรุงเทพฯ',     role_code: 'commander',  agency_id: null,        area_scope: ['BKK'], preferred_language: 'th', active: true, auth_subject: 'oidc|u08', tenant_id: 'T-BKK' },
  ];

  /* ---------- ops.incident (เหตุการณ์หลัก 3 สถานการณ์ + เหตุย่อย) ----------
   * status: reported → verified → escalated → notified → tracking → closed  (Crisis Response Protocol)
   */
  const major = [
    { incident_id: 'INC-FL-000', scenario: 'flood', code: 'SIM-FL-001', hazard_code: 'flood', area_id: 'A1', title: 'น้ำท่วมฉับพลันในพื้นที่ป่าตอง', severity: 5, status: 'notified', occurred_at: T('10:20'), verified_by: 'U02', version: 4,
      signal: 'ฝนสะสม 3 ชม. เกิน 90 มม. / ถนนเข้าพื้นที่มีน้ำท่วมสูง 40–60 ซม.', decision: 'เปิดศูนย์ประสานงานและส่งทีมช่วยเคลื่อนย้ายผู้ติดค้าง', source: 'อุตุฯ (DS01) / ปภ. (DS02) / ระดับน้ำ (DS07, DS22)', trend: [2, 4, 7, 12, 18],
      agencies: { lead: 'AG02', support: ['AG01', 'AG08', 'AG11', 'AG15', 'AG17', 'AG19', 'SP29', 'SP32', 'SP25'], inform: ['AG03', 'AG04', 'AG05', 'AG10', 'AG14', 'SP21', 'SP22', 'SP30', 'SP31'] } },
    { incident_id: 'INC-SEA-000', scenario: 'boat', code: 'SIM-SEA-002', hazard_code: 'marine', area_id: 'A4', title: 'เรือท่องเที่ยวประสบเหตุบริเวณอ่าวฉลอง', severity: 5, status: 'escalated', occurred_at: T('12:40'), verified_by: 'U03', version: 3,
      signal: 'เรือแจ้งขอความช่วยเหลือ / คลื่นสูง 2–3 ม. ธงแดงทุกหาดฝั่งตะวันตก', decision: 'ประสานทีมกู้ภัยทางทะเลและเตรียมจุดรับผู้บาดเจ็บที่ท่าเทียบเรือฉลอง', source: 'รายงานเรือ / ปภ. (DS02) / เจ้าท่า (DS14) / อุตุฯ (DS01)', trend: [1, 1, 2, 4, 7],
      agencies: { lead: 'AG12', support: ['AG09', 'AG02', 'SP27', 'SP25', 'AG05', 'AG13', 'SP32'], inform: ['AG01', 'AG03', 'AG14', 'SP22', 'SP26', 'SP30', 'SP31'] } },
    { incident_id: 'INC-CR-000', scenario: 'crowd', code: 'SIM-CR-003', hazard_code: 'crowd', area_id: 'A3', title: 'นักท่องเที่ยวหนาแน่นช่วงกิจกรรมเมืองเก่า', severity: 4, status: 'verified', occurred_at: T('11:30'), verified_by: 'U03', version: 2,
      signal: 'ความหนาแน่นเพิ่มขึ้นต่อเนื่อง / ทางออกถนนถลางเริ่มติดขัด', decision: 'เพิ่มเจ้าหน้าที่จัดทางเดินและกระจายคนไปพื้นที่รองรับ', source: 'จุดตรวจนับคน (DS03) / ตร.ท่องเที่ยว (DS18) / รายงานเจ้าหน้าที่', trend: [2, 3, 5, 8, 11],
      agencies: { lead: 'AG20', support: ['AG13', 'AG11', 'AG05', 'SP25', 'AG19', 'SP32'], inform: ['AG01', 'AG03', 'AG04', 'AG10', 'SP21', 'SP30'] } },
  ];
  const incidentTypes = {
    flood: ['น้ำท่วมถนน', 'ผู้ติดค้าง', 'ไฟฟ้าดับ', 'รถเสียในน้ำ', 'ดินสไลด์'],
    boat: ['เรือขอความช่วยเหลือ', 'ผู้บาดเจ็บ', 'ผู้สูญหาย', 'เรือเกยตื้น'],
    crowd: ['ผู้เป็นลม', 'ทางออกติดขัด', 'ของหาย', 'ทะเลาะวิวาท'],
  };
  const incidents = [];
  major.forEach(m => {
    let n = 1;
    m.trend.forEach((cum, h) => {
      const prev = h ? m.trend[h - 1] : 0;
      for (let k = 0; k < cum - prev; k++) {
        const mm = String((k * 11 + 7) % 60).padStart(2, '0');
        const verified = n % 6 !== 0; // บางเหตุยังเป็น "รายงาน" ยังไม่ตรวจสอบ
        incidents.push({ incident_id: `${m.incident_id.replace('-000', '')}-${String(n).padStart(3, '0')}`, parent_incident_id: m.incident_id, scenario: m.scenario,
          hazard_code: m.hazard_code, area_id: m.area_id, title: incidentTypes[m.scenario][(n + h) % incidentTypes[m.scenario].length],
          severity: (n % 5 === 0) ? 5 : (n % 3 === 0 ? 4 : 3), status: !verified ? 'reported' : (n % 4 === 0 ? 'closed' : 'verified'),
          occurred_at: T(`${10 + h}:${mm}`), verified_by: verified ? 'U02' : null, version: 1, source_id: n % 2 ? 'DS02' : 'DS06' });
        n++;
      }
    });
  });

  /* ---------- ops.volunteer + volunteer_skill ----------
   * verification_status: verified | pending | suspended ; availability: available | busy | off
   */
  const volunteers = [
    { volunteer_id: 'V01', display_name: 'อาสาสมัคร 01', agency_id: 'SP32', area_id: 'A1', verification_status: 'verified', availability: 'available', max_active_tasks: 1, skills: [{ code: 'water_rescue', valid_until: '2027-03-31' }, { code: 'first_aid', valid_until: '2027-01-15' }], location_updated_at: T('13:55'), distance_km: { A1: 1.2, A2: 6.5, A3: 12, A4: 14 } },
    { volunteer_id: 'V02', display_name: 'อาสาสมัคร 02', agency_id: 'SP32', area_id: 'A1', verification_status: 'verified', availability: 'available', max_active_tasks: 2, skills: [{ code: 'first_aid', valid_until: '2027-06-30' }], location_updated_at: T('13:50'), distance_km: { A1: 0.8, A2: 7, A3: 13, A4: 15 } },
    { volunteer_id: 'V03', display_name: 'อาสาสมัคร 03', agency_id: 'AG12', area_id: 'A4', verification_status: 'verified', availability: 'available', max_active_tasks: 1, skills: [{ code: 'sea_rescue', valid_until: '2027-02-28' }, { code: 'diving', valid_until: '2026-12-31' }], location_updated_at: T('13:58'), distance_km: { A1: 14, A2: 9, A3: 7, A4: 0.5 } },
    { volunteer_id: 'V04', display_name: 'อาสาสมัคร 04', agency_id: 'SP25', area_id: 'A3', verification_status: 'verified', availability: 'available', max_active_tasks: 2, skills: [{ code: 'first_aid', valid_until: '2027-05-31' }, { code: 'lang_en', valid_until: null }], location_updated_at: T('13:57'), distance_km: { A1: 13, A2: 11, A3: 0.4, A4: 8 } },
    { volunteer_id: 'V05', display_name: 'อาสาสมัคร 05', agency_id: 'AG13', area_id: 'A3', verification_status: 'verified', availability: 'busy', max_active_tasks: 1, skills: [{ code: 'crowd_control', valid_until: '2027-09-30' }, { code: 'traffic', valid_until: '2027-09-30' }], location_updated_at: T('13:59'), distance_km: { A1: 12, A2: 10, A3: 0.3, A4: 8 } },
    { volunteer_id: 'V06', display_name: 'อาสาสมัคร 06', agency_id: 'AG13', area_id: 'A1', verification_status: 'verified', availability: 'available', max_active_tasks: 2, skills: [{ code: 'lang_zh', valid_until: null }, { code: 'lang_en', valid_until: null }], location_updated_at: T('13:40'), distance_km: { A1: 2.1, A2: 5, A3: 12, A4: 13 } },
    { volunteer_id: 'V07', display_name: 'อาสาสมัคร 07', agency_id: 'SP32', area_id: 'A2', verification_status: 'verified', availability: 'busy', max_active_tasks: 1, skills: [{ code: 'transport_4x4', valid_until: null }, { code: 'water_rescue', valid_until: '2027-01-31' }], location_updated_at: T('13:52'), distance_km: { A1: 4, A2: 1, A3: 10, A4: 9 } },
    { volunteer_id: 'V08', display_name: 'อาสาสมัคร 08', agency_id: 'SP32', area_id: 'A2', verification_status: 'verified', availability: 'available', max_active_tasks: 1, skills: [{ code: 'water_rescue', valid_until: '2026-09-30' }], location_updated_at: T('13:10'), distance_km: { A1: 5, A2: 0.6, A3: 9, A4: 8 } }, // ใบรับรองหมดอายุ
    { volunteer_id: 'V09', display_name: 'อาสาสมัคร 09', agency_id: 'AG09', area_id: 'A4', verification_status: 'verified', availability: 'available', max_active_tasks: 1, skills: [{ code: 'first_aid', valid_until: '2027-04-30' }, { code: 'sea_rescue', valid_until: '2027-04-30' }], location_updated_at: T('13:56'), distance_km: { A1: 15, A2: 10, A3: 6, A4: 1.1 } },
    { volunteer_id: 'V10', display_name: 'อาสาสมัคร 10', agency_id: 'AG20', area_id: 'A3', verification_status: 'verified', availability: 'available', max_active_tasks: 2, skills: [{ code: 'radio', valid_until: null }, { code: 'crowd_control', valid_until: '2027-09-30' }], location_updated_at: T('13:45'), distance_km: { A1: 12, A2: 10, A3: 0.9, A4: 7 } },
    { volunteer_id: 'V11', display_name: 'อาสาสมัคร 11', agency_id: 'SP27', area_id: 'A4', verification_status: 'suspended', availability: 'available', max_active_tasks: 1, skills: [{ code: 'sea_rescue', valid_until: '2027-08-31' }, { code: 'first_aid', valid_until: '2027-08-31' }], location_updated_at: T('12:00'), distance_km: { A1: 14, A2: 9, A3: 7, A4: 0.7 } }, // ถูกระงับ
    { volunteer_id: 'V12', display_name: 'อาสาสมัคร 12', agency_id: 'SP25', area_id: 'A3', verification_status: 'pending', availability: 'available', max_active_tasks: 1, skills: [{ code: 'first_aid', valid_until: '2027-05-31' }, { code: 'lang_zh', valid_until: null }], location_updated_at: T('13:30'), distance_km: { A1: 13, A2: 11, A3: 0.5, A4: 8 } }, // ยังไม่ผ่านตรวจสอบ
  ];
  const skill_names = { water_rescue: 'กู้ภัยทางน้ำ', sea_rescue: 'กู้ภัยทางทะเล', diving: 'ดำน้ำ', first_aid: 'ปฐมพยาบาล', lang_en: 'ภาษาอังกฤษ', lang_zh: 'ล่ามภาษาจีน', crowd_control: 'จัดระเบียบพื้นที่', traffic: 'จราจร', transport_4x4: 'ขนส่ง 4x4', radio: 'ประสานงานวิทยุ' };

  /* ---------- ops.sos_request ----------
   * status: received | screened | closed | cancelled   (ภารกิจแยกอยู่ใน rescue_task)
   */
  const sos_requests = [
    { sos_id: 'SOS-FL-001', tracking_no: 'TRK-2569-1001', scenario: 'flood', incident_id: 'INC-FL-000', area_id: 'A1', idempotency_key: 'k-fl-001', request_type: 'trapped', request_detail: 'น้ำท่วมชั้นล่างโรงแรม ซอยบางลา มีผู้ติดค้าง 4 คน', people_count: 4, languages: ['TH', 'EN'], contact_masked: '08x-xxx-1234', location_accuracy_m: 12, urgency: 5, vulnerability_flags: ['injured'], status: 'screened', channel: 'app', created_at: T('13:54'), screened_at: T('13:56'), requester: 'นักท่องเที่ยว (บัญชี)' },
    { sos_id: 'SOS-FL-002', tracking_no: 'TRK-2569-1002', scenario: 'flood', incident_id: 'INC-FL-000', area_id: 'A1', idempotency_key: 'k-fl-002', request_type: 'trapped', request_detail: 'ผู้สูงอายุ 2 คน ติดในบ้านชั้นเดียว ถนนนาใน', people_count: 2, languages: ['TH'], contact_masked: '08x-xxx-2211', location_accuracy_m: 35, urgency: 5, vulnerability_flags: ['elderly'], status: 'screened', channel: 'phone_by_officer', created_at: T('13:41'), screened_at: T('13:45'), requester: 'แจ้งแทนโดยเจ้าหน้าที่' },
    { sos_id: 'SOS-FL-003', tracking_no: 'TRK-2569-1003', scenario: 'flood', incident_id: 'INC-FL-000', area_id: 'A1', idempotency_key: 'k-fl-003', request_type: 'stranded', request_detail: 'นักท่องเที่ยวจีน 3 คน รถติดน้ำท่วม ถนนพระบารมี', people_count: 3, languages: ['ZH', 'EN'], contact_masked: '+86-xxx-5521', location_accuracy_m: 8, urgency: 3, vulnerability_flags: ['language'], status: 'screened', channel: 'app', created_at: T('13:30'), screened_at: T('13:36'), requester: 'นักท่องเที่ยว (บัญชี)' },
    { sos_id: 'SOS-FL-004', tracking_no: 'TRK-2569-1004', scenario: 'flood', incident_id: 'INC-FL-000', area_id: 'A1', idempotency_key: 'k-fl-004', request_type: 'shelter', request_detail: 'ขอจุดพักพิงชั่วคราวสำหรับนักท่องเที่ยว 15 คน หลังโรงแรมชั้นล่างท่วม', people_count: 15, languages: ['EN', 'RU'], contact_masked: '07x-xxx-0909', location_accuracy_m: 20, urgency: 3, vulnerability_flags: [], status: 'screened', channel: 'hotel', created_at: T('13:20'), screened_at: T('13:27'), requester: 'ผู้ประกอบการ' },
    { sos_id: 'SOS-FL-005', tracking_no: 'TRK-2569-1005', scenario: 'flood', incident_id: 'INC-FL-000', area_id: 'A1', idempotency_key: 'k-fl-005', request_type: 'medical', request_detail: 'บาดเจ็บเล็กน้อยจากของมีคมในน้ำ', people_count: 1, languages: ['TH'], contact_masked: '09x-xxx-7788', location_accuracy_m: 15, urgency: 3, vulnerability_flags: ['injured'], status: 'screened', channel: 'app', created_at: T('13:10'), screened_at: T('13:14'), requester: 'ประชาชน' },
    { sos_id: 'SOS-FL-006', tracking_no: 'TRK-2569-1006', scenario: 'flood', incident_id: null, area_id: 'A1', idempotency_key: 'k-fl-006', request_type: 'other', request_detail: 'ขอกระสอบทรายกั้นน้ำหน้าร้านค้า 5 ร้าน', people_count: 0, languages: ['TH'], contact_masked: '08x-xxx-4455', location_accuracy_m: 50, urgency: 1, vulnerability_flags: [], status: 'received', channel: 'phone_by_officer', created_at: T('13:49'), screened_at: null, requester: 'ร้านค้า' },
    { sos_id: 'SOS-FL-007', tracking_no: 'TRK-2569-1007', scenario: 'flood', incident_id: 'INC-FL-000', area_id: 'A1', idempotency_key: 'k-fl-007', request_type: 'medical', request_detail: 'นำส่งผู้ป่วยเบาหวานไปโรงพยาบาลป่าตอง', people_count: 1, languages: ['TH'], contact_masked: '08x-xxx-3300', location_accuracy_m: 10, urgency: 4, vulnerability_flags: ['chronic'], status: 'screened', channel: 'app', created_at: T('12:35'), screened_at: T('12:38'), requester: 'ญาติผู้ป่วย' },
    { sos_id: 'SOS-FL-008', tracking_no: 'TRK-2569-1008', scenario: 'flood', incident_id: 'INC-FL-000', area_id: 'A1', idempotency_key: 'k-fl-008', request_type: 'evacuate', request_detail: 'อพยพครอบครัว 5 คน จากบ้านริมคลองปากบาง', people_count: 5, languages: ['TH'], contact_masked: '06x-xxx-1100', location_accuracy_m: 25, urgency: 4, vulnerability_flags: ['child'], status: 'closed', channel: 'app', created_at: T('11:20'), screened_at: T('11:23'), requester: 'ประชาชน' },
    { sos_id: 'SOS-FL-009', tracking_no: 'TRK-2569-1009', scenario: 'flood', incident_id: null, area_id: 'A1', idempotency_key: 'k-fl-009', request_type: 'trapped', request_detail: 'ลิฟต์ค้างในคอนโด น้ำท่วมห้องเครื่อง มีคนอยู่ข้างใน 2 คน', people_count: 2, languages: ['EN'], contact_masked: '+44-xxx-8812', location_accuracy_m: 6, urgency: 5, vulnerability_flags: [], status: 'received', channel: 'app', created_at: T('13:58'), screened_at: null, requester: 'นักท่องเที่ยว (บัญชี)' },
    { sos_id: 'SOS-SEA-001', tracking_no: 'TRK-2569-2001', scenario: 'boat', incident_id: 'INC-SEA-000', area_id: 'A4', idempotency_key: 'k-sea-001', request_type: 'marine', request_detail: 'เรือสปีดโบ๊ตเครื่องดับ ผู้โดยสาร 12 คน ห่างฝั่ง 2 กม.', people_count: 12, languages: ['EN', 'ZH', 'TH'], contact_masked: 'VHF ch.16', location_accuracy_m: 150, urgency: 5, vulnerability_flags: ['child'], status: 'screened', channel: 'radio_by_officer', created_at: T('13:54'), screened_at: T('13:56'), requester: 'แจ้งแทนโดยเจ้าหน้าที่' },
    { sos_id: 'SOS-SEA-002', tracking_no: 'TRK-2569-2002', scenario: 'boat', incident_id: 'INC-SEA-000', area_id: 'A4', idempotency_key: 'k-sea-002', request_type: 'marine', request_detail: 'ผู้โดยสาร 2 คนตกน้ำ บริเวณแหลมพันวา', people_count: 2, languages: ['EN'], contact_masked: '08x-xxx-6677', location_accuracy_m: 300, urgency: 5, vulnerability_flags: [], status: 'screened', channel: 'app', created_at: T('13:48'), screened_at: T('13:50'), requester: 'เรือลำใกล้เคียง' },
    { sos_id: 'SOS-SEA-003', tracking_no: 'TRK-2569-2003', scenario: 'boat', incident_id: 'INC-SEA-000', area_id: 'A4', idempotency_key: 'k-sea-003', request_type: 'support', request_detail: 'เตรียมจุดรับผู้บาดเจ็บที่ท่าเทียบเรือฉลอง', people_count: 0, languages: ['TH'], contact_masked: '—', location_accuracy_m: 5, urgency: 3, vulnerability_flags: [], status: 'screened', channel: 'internal', created_at: T('13:50'), screened_at: T('13:51'), requester: 'ศูนย์สั่งการ' },
    { sos_id: 'SOS-SEA-004', tracking_no: 'TRK-2569-2004', scenario: 'boat', incident_id: null, area_id: 'A4', idempotency_key: 'k-sea-004', request_type: 'marine', request_detail: 'เรือหางยาวเกยตื้น ไม่มีผู้บาดเจ็บ', people_count: 4, languages: ['TH'], contact_masked: '08x-xxx-2323', location_accuracy_m: 40, urgency: 2, vulnerability_flags: [], status: 'screened', channel: 'phone_by_officer', created_at: T('12:30'), screened_at: T('12:36'), requester: 'เจ้าของเรือ' },
    { sos_id: 'SOS-SEA-005', tracking_no: 'TRK-2569-2005', scenario: 'boat', incident_id: null, area_id: 'A4', idempotency_key: 'k-sea-005', request_type: 'medical', request_detail: 'นักดำน้ำมีอาการอ่อนเพลีย ต้องการปฐมพยาบาล', people_count: 1, languages: ['EN'], contact_masked: '+61-xxx-4040', location_accuracy_m: 10, urgency: 3, vulnerability_flags: [], status: 'closed', channel: 'app', created_at: T('11:05'), screened_at: T('11:08'), requester: 'นักท่องเที่ยว (บัญชี)' },
    { sos_id: 'SOS-CR-001', tracking_no: 'TRK-2569-3001', scenario: 'crowd', incident_id: 'INC-CR-000', area_id: 'A3', idempotency_key: 'k-cr-001', request_type: 'medical', request_detail: 'ผู้เป็นลม 2 คน หน้าเวทีถนนถลาง', people_count: 2, languages: ['TH', 'EN'], contact_masked: '09x-xxx-1212', location_accuracy_m: 8, urgency: 4, vulnerability_flags: ['injured'], status: 'screened', channel: 'officer_onsite', created_at: T('13:54'), screened_at: T('13:56'), requester: 'เจ้าหน้าที่หน้างาน' },
    { sos_id: 'SOS-CR-002', tracking_no: 'TRK-2569-3002', scenario: 'crowd', incident_id: 'INC-CR-000', area_id: 'A3', idempotency_key: 'k-cr-002', request_type: 'crowd', request_detail: 'ทางออกซอยรมณีย์ติดขัด ต้องการจัดทางเดิน', people_count: 0, languages: ['TH'], contact_masked: '—', location_accuracy_m: 20, urgency: 4, vulnerability_flags: [], status: 'screened', channel: 'sensor', created_at: T('13:50'), screened_at: T('13:52'), requester: 'จุดตรวจนับคน' },
    { sos_id: 'SOS-CR-003', tracking_no: 'TRK-2569-3003', scenario: 'crowd', incident_id: 'INC-CR-000', area_id: 'A3', idempotency_key: 'k-cr-003', request_type: 'missing', request_detail: 'เด็กพลัดหลง อายุ ~6 ปี นักท่องเที่ยวจีน', people_count: 1, languages: ['ZH'], contact_masked: '+86-xxx-9900', location_accuracy_m: 15, urgency: 4, vulnerability_flags: ['child', 'language'], status: 'screened', channel: 'app', created_at: T('13:45'), screened_at: T('13:47'), requester: 'ร้านค้า' },
    { sos_id: 'SOS-CR-004', tracking_no: 'TRK-2569-3004', scenario: 'crowd', incident_id: null, area_id: 'A3', idempotency_key: 'k-cr-004', request_type: 'other', request_detail: 'นักท่องเที่ยวกระเป๋าหาย ขอความช่วยเหลือประสานตำรวจ', people_count: 1, languages: ['EN'], contact_masked: '+1-xxx-7171', location_accuracy_m: 30, urgency: 1, vulnerability_flags: [], status: 'received', channel: 'app', created_at: T('13:20'), screened_at: null, requester: 'นักท่องเที่ยว (บัญชี)' },
    { sos_id: 'SOS-CR-005', tracking_no: 'TRK-2569-3005', scenario: 'crowd', incident_id: 'INC-CR-000', area_id: 'A3', idempotency_key: 'k-cr-005', request_type: 'support', request_detail: 'ตั้งจุดน้ำดื่มและร่มเงาหน้าศาลเจ้า', people_count: 0, languages: ['TH'], contact_masked: '—', location_accuracy_m: 5, urgency: 2, vulnerability_flags: [], status: 'screened', channel: 'internal', created_at: T('12:00'), screened_at: T('12:02'), requester: 'ศูนย์สั่งการ' },
    { sos_id: 'SOS-CR-006', tracking_no: 'TRK-2569-3006', scenario: 'crowd', incident_id: 'INC-CR-000', area_id: 'A3', idempotency_key: 'k-cr-006', request_type: 'medical', request_detail: 'ผู้สูงอายุหกล้ม บาดเจ็บเล็กน้อย', people_count: 1, languages: ['TH'], contact_masked: '08x-xxx-5050', location_accuracy_m: 10, urgency: 3, vulnerability_flags: ['elderly', 'injured'], status: 'closed', channel: 'app', created_at: T('11:30'), screened_at: T('11:33'), requester: 'ประชาชน' },
  ];

  /* ---------- ops.rescue_task + task_assignment + task_event ----------
   * status: pending | offered | accepted | en_route | on_scene | completed | cancelled
   * priority_score คำนวณโดย API.computePriority (กฎ PR-2569.1) ตอนโหลด
   */
  const ev = (ts, type, prev, next, actor = 'U02', note = '') => ({ occurred_at: ts, event_type: type, previous_status: prev, new_status: next, actor_id: actor, note });
  const rescue_tasks = [
    { task_id: 'TSK-FL-001', sos_id: 'SOS-FL-001', scenario: 'flood', area_id: 'A1', task_type: 'rescue_water', title: 'เคลื่อนย้ายผู้ติดค้างชั้นล่างโรงแรม ซอยบางลา', required_skills: ['water_rescue', 'first_aid'], hard_priority: true, status: 'pending', version: 1, created_at: T('13:56'), due_at: T('14:11'), assigned_agency_id: 'SP32', assignments: [], events: [ev(T('13:56'), 'created', null, 'pending', 'U02', 'คัดกรอง: เสี่ยงต่อชีวิต')] },
    { task_id: 'TSK-FL-002', sos_id: 'SOS-FL-002', scenario: 'flood', area_id: 'A1', task_type: 'rescue_water', title: 'ช่วยผู้สูงอายุ 2 คน ออกจากบ้านชั้นเดียว ถนนนาใน', required_skills: ['water_rescue'], hard_priority: true, status: 'offered', version: 2, created_at: T('13:45'), due_at: T('14:00'), assigned_agency_id: 'SP32',
      assignments: [{ assignment_id: 'ASG-001', volunteer_id: 'V01', assigned_by: 'U02', status: 'offered', offered_at: T('13:52'), responded_at: null, expires_at: T('14:02') }],
      events: [ev(T('13:45'), 'created', null, 'pending'), ev(T('13:52'), 'offered', 'pending', 'offered', 'U02', 'เสนอให้ V01 · รอตอบรับภายใน 10 นาที')] },
    { task_id: 'TSK-FL-003', sos_id: 'SOS-FL-003', scenario: 'flood', area_id: 'A1', task_type: 'transport', title: 'รับนักท่องเที่ยวจีน 3 คน จากรถที่ติดน้ำ ถนนพระบารมี', required_skills: ['transport_4x4', 'lang_zh'], hard_priority: false, status: 'pending', version: 1, created_at: T('13:36'), due_at: T('14:36'), assigned_agency_id: 'AG13', assignments: [], events: [ev(T('13:36'), 'created', null, 'pending')] },
    { task_id: 'TSK-FL-004', sos_id: 'SOS-FL-004', scenario: 'flood', area_id: 'A1', task_type: 'shelter', title: 'จัดจุดพักพิงชั่วคราว 15 คน ที่จุดรวมพลโรงเรียนเทศบาล', required_skills: ['crowd_control', 'lang_en'], hard_priority: false, status: 'pending', version: 1, created_at: T('13:27'), due_at: T('15:27'), assigned_agency_id: 'SP29', assignments: [], events: [ev(T('13:27'), 'created', null, 'pending')] },
    { task_id: 'TSK-FL-005', sos_id: 'SOS-FL-005', scenario: 'flood', area_id: 'A1', task_type: 'medical', title: 'ปฐมพยาบาลบาดแผลจากของมีคม', required_skills: ['first_aid'], hard_priority: false, status: 'pending', version: 1, created_at: T('13:14'), due_at: T('14:14'), assigned_agency_id: 'SP25', assignments: [], events: [ev(T('13:14'), 'created', null, 'pending')] },
    { task_id: 'TSK-FL-007', sos_id: 'SOS-FL-007', scenario: 'flood', area_id: 'A1', task_type: 'transport', title: 'นำส่งผู้ป่วยเบาหวานไปโรงพยาบาลป่าตอง', required_skills: ['transport_4x4', 'first_aid'], hard_priority: false, status: 'en_route', version: 4, created_at: T('12:38'), due_at: T('13:38'), assigned_agency_id: 'SP32',
      assignments: [{ assignment_id: 'ASG-002', volunteer_id: 'V07', assigned_by: 'U02', status: 'accepted', offered_at: T('12:40'), responded_at: T('12:42'), expires_at: T('12:50') }],
      events: [ev(T('12:38'), 'created', null, 'pending'), ev(T('12:40'), 'offered', 'pending', 'offered'), ev(T('12:42'), 'accepted', 'offered', 'accepted', 'V07'), ev(T('12:50'), 'status', 'accepted', 'en_route', 'V07', 'ออกจากฐาน ใช้เส้นทางเลี่ยงน้ำท่วม')] },
    { task_id: 'TSK-FL-008', sos_id: 'SOS-FL-008', scenario: 'flood', area_id: 'A1', task_type: 'evacuate', title: 'อพยพครอบครัว 5 คน จากบ้านริมคลองปากบาง', required_skills: ['water_rescue'], hard_priority: false, status: 'completed', version: 6, created_at: T('11:23'), due_at: T('12:23'), completed_at: T('12:10'), assigned_agency_id: 'SP32',
      assignments: [{ assignment_id: 'ASG-003', volunteer_id: 'V08', assigned_by: 'U02', status: 'accepted', offered_at: T('11:24'), responded_at: T('11:25'), expires_at: T('11:34') }],
      events: [ev(T('11:23'), 'created', null, 'pending'), ev(T('11:24'), 'offered', 'pending', 'offered'), ev(T('11:25'), 'accepted', 'offered', 'accepted', 'V08'), ev(T('11:30'), 'status', 'accepted', 'en_route', 'V08'), ev(T('11:40'), 'status', 'en_route', 'on_scene', 'V08'), ev(T('12:10'), 'status', 'on_scene', 'completed', 'V08', 'ส่งผู้ประสบภัยถึงจุดพักพิง 5 คน ปลอดภัย')] },
    { task_id: 'TSK-SEA-001', sos_id: 'SOS-SEA-001', scenario: 'boat', area_id: 'A4', task_type: 'rescue_sea', title: 'กู้ภัยเรือสปีดโบ๊ตเครื่องดับ ผู้โดยสาร 12 คน', required_skills: ['sea_rescue', 'first_aid'], hard_priority: true, status: 'pending', version: 1, created_at: T('13:56'), due_at: T('14:11'), assigned_agency_id: 'AG12', assignments: [], events: [ev(T('13:56'), 'created', null, 'pending', 'U03', 'คัดกรอง: คลื่นลมแรง เสี่ยงเรือพลิก')] },
    { task_id: 'TSK-SEA-002', sos_id: 'SOS-SEA-002', scenario: 'boat', area_id: 'A4', task_type: 'rescue_sea', title: 'ค้นหาผู้ตกน้ำ 2 คน บริเวณแหลมพันวา', required_skills: ['sea_rescue', 'diving'], hard_priority: true, status: 'pending', version: 1, created_at: T('13:50'), due_at: T('14:05'), assigned_agency_id: 'AG12', assignments: [], events: [ev(T('13:50'), 'created', null, 'pending', 'U03')] },
    { task_id: 'TSK-SEA-003', sos_id: 'SOS-SEA-003', scenario: 'boat', area_id: 'A4', task_type: 'support', title: 'เตรียมจุดรับผู้บาดเจ็บที่ท่าเทียบเรือฉลอง', required_skills: ['first_aid', 'crowd_control'], hard_priority: false, status: 'pending', version: 1, created_at: T('13:51'), due_at: T('14:51'), assigned_agency_id: 'SP25', assignments: [], events: [ev(T('13:51'), 'created', null, 'pending', 'U03')] },
    { task_id: 'TSK-SEA-004', sos_id: 'SOS-SEA-004', scenario: 'boat', area_id: 'A4', task_type: 'rescue_sea', title: 'ลากเรือหางยาวที่เกยตื้น', required_skills: ['sea_rescue'], hard_priority: false, status: 'accepted', version: 3, created_at: T('12:36'), due_at: T('14:36'), assigned_agency_id: 'AG12',
      assignments: [{ assignment_id: 'ASG-004', volunteer_id: 'V03', assigned_by: 'U03', status: 'accepted', offered_at: T('12:38'), responded_at: T('12:40'), expires_at: T('12:48') }],
      events: [ev(T('12:36'), 'created', null, 'pending', 'U03'), ev(T('12:38'), 'offered', 'pending', 'offered', 'U03'), ev(T('12:40'), 'accepted', 'offered', 'accepted', 'V03')] },
    { task_id: 'TSK-SEA-005', sos_id: 'SOS-SEA-005', scenario: 'boat', area_id: 'A4', task_type: 'medical', title: 'ปฐมพยาบาลนักดำน้ำอ่อนเพลีย', required_skills: ['first_aid'], hard_priority: false, status: 'completed', version: 6, created_at: T('11:08'), due_at: T('12:08'), completed_at: T('11:40'), assigned_agency_id: 'SP25',
      assignments: [{ assignment_id: 'ASG-005', volunteer_id: 'V09', assigned_by: 'U03', status: 'accepted', offered_at: T('11:08'), responded_at: T('11:09'), expires_at: T('11:18') }],
      events: [ev(T('11:08'), 'created', null, 'pending', 'U03'), ev(T('11:08'), 'offered', 'pending', 'offered', 'U03'), ev(T('11:09'), 'accepted', 'offered', 'accepted', 'V09'), ev(T('11:15'), 'status', 'accepted', 'en_route', 'V09'), ev(T('11:22'), 'status', 'en_route', 'on_scene', 'V09'), ev(T('11:40'), 'status', 'on_scene', 'completed', 'V09', 'ส่งต่อคลินิก')] },
    { task_id: 'TSK-CR-001', sos_id: 'SOS-CR-001', scenario: 'crowd', area_id: 'A3', task_type: 'medical', title: 'ปฐมพยาบาลผู้เป็นลม 2 คน หน้าเวทีถนนถลาง', required_skills: ['first_aid', 'lang_en'], hard_priority: false, status: 'pending', version: 1, created_at: T('13:56'), due_at: T('14:26'), assigned_agency_id: 'SP25', assignments: [], events: [ev(T('13:56'), 'created', null, 'pending', 'U03')] },
    { task_id: 'TSK-CR-002', sos_id: 'SOS-CR-002', scenario: 'crowd', area_id: 'A3', task_type: 'crowd', title: 'จัดทางเดินทางออกซอยรมณีย์', required_skills: ['crowd_control', 'traffic'], hard_priority: false, status: 'pending', version: 1, created_at: T('13:52'), due_at: T('14:22'), assigned_agency_id: 'AG13', assignments: [], events: [ev(T('13:52'), 'created', null, 'pending', 'U03')] },
    { task_id: 'TSK-CR-003', sos_id: 'SOS-CR-003', scenario: 'crowd', area_id: 'A3', task_type: 'missing', title: 'ตามหาผู้ปกครองเด็กพลัดหลง (นักท่องเที่ยวจีน)', required_skills: ['lang_zh', 'radio'], hard_priority: false, status: 'offered', version: 2, created_at: T('13:47'), due_at: T('14:17'), assigned_agency_id: 'AG13',
      assignments: [{ assignment_id: 'ASG-006', volunteer_id: 'V06', assigned_by: 'U03', status: 'offered', offered_at: T('13:49'), responded_at: null, expires_at: T('13:59') }],
      events: [ev(T('13:47'), 'created', null, 'pending', 'U03'), ev(T('13:49'), 'offered', 'pending', 'offered', 'U03', 'เสนอให้ V06')] },
    { task_id: 'TSK-CR-005', sos_id: 'SOS-CR-005', scenario: 'crowd', area_id: 'A3', task_type: 'support', title: 'ตั้งจุดน้ำดื่มและร่มเงาหน้าศาลเจ้า', required_skills: ['crowd_control'], hard_priority: false, status: 'on_scene', version: 5, created_at: T('12:02'), due_at: T('14:02'), assigned_agency_id: 'SP29',
      assignments: [{ assignment_id: 'ASG-007', volunteer_id: 'V05', assigned_by: 'U03', status: 'accepted', offered_at: T('12:03'), responded_at: T('12:05'), expires_at: T('12:13') }],
      events: [ev(T('12:02'), 'created', null, 'pending', 'U03'), ev(T('12:03'), 'offered', 'pending', 'offered', 'U03'), ev(T('12:05'), 'accepted', 'offered', 'accepted', 'V05'), ev(T('12:15'), 'status', 'accepted', 'en_route', 'V05'), ev(T('12:30'), 'status', 'en_route', 'on_scene', 'V05')] },
    { task_id: 'TSK-CR-006', sos_id: 'SOS-CR-006', scenario: 'crowd', area_id: 'A3', task_type: 'medical', title: 'ปฐมพยาบาลผู้สูงอายุหกล้ม', required_skills: ['first_aid'], hard_priority: false, status: 'completed', version: 6, created_at: T('11:33'), due_at: T('12:33'), completed_at: T('11:55'), assigned_agency_id: 'SP25',
      assignments: [{ assignment_id: 'ASG-008', volunteer_id: 'V04', assigned_by: 'U03', status: 'accepted', offered_at: T('11:33'), responded_at: T('11:34'), expires_at: T('11:43') }],
      events: [ev(T('11:33'), 'created', null, 'pending', 'U03'), ev(T('11:33'), 'offered', 'pending', 'offered', 'U03'), ev(T('11:34'), 'accepted', 'offered', 'accepted', 'V04'), ev(T('11:38'), 'status', 'accepted', 'en_route', 'V04'), ev(T('11:42'), 'status', 'en_route', 'on_scene', 'V04'), ev(T('11:55'), 'status', 'on_scene', 'completed', 'V04')] },
  ];

  /* ---------- ops.alert + alert_translation + notification_delivery ----------
   * status: draft | review | approved | rejected | published | expired
   */
  const alerts = [
    { alert_id: 'ALT-FL-01', scenario: 'flood', incident_id: 'INC-FL-000', area_id: 'A1', level: 4, status: 'review', target_agencies: ['AG01', 'AG11', 'AG15', 'AG19', 'SP29', 'AG03', 'SP30'], audience: 'นักท่องเที่ยวในพื้นที่ป่าตอง', channels: ['LINE OA', 'SMS Cell Broadcast', 'ป้ายดิจิทัล'],
      translations: { th: { title: 'ประกาศเตือนน้ำท่วมป่าตอง', message: 'ขณะนี้มีน้ำท่วมถนนในพื้นที่ป่าตอง โปรดหลีกเลี่ยงถนนราษฎร์อุทิศ 200 ปี และถนนพระบารมี อยู่ในที่สูงและติดตามคำแนะนำจากเจ้าหน้าที่ สายด่วน 1155', reviewed_by: 'U02' },
        en: { title: 'Patong flood alert', message: 'Flash flooding on roads in Patong. Avoid Rat-U-Thit 200 Pee Rd and Phra Barami Rd. Stay on higher ground and follow official instructions. Tourist Police 1155.', reviewed_by: 'U02' },
        zh: { title: '巴东洪水警报', message: '巴东地区道路发生山洪。请避开 Rat-U-Thit 200 Pee 路和 Phra Barami 路。请前往高处并听从官方指示。旅游警察 1155。', reviewed_by: null } },
      history: [{ ts: T('13:40'), actor: 'U02', action: 'สร้างร่าง' }, { ts: T('13:47'), actor: 'U02', action: 'ส่งทบทวน' }], deliveries: [] },
    { alert_id: 'ALT-FL-02', scenario: 'flood', incident_id: 'INC-FL-000', area_id: 'A1', level: 3, status: 'draft', target_agencies: ['SP21', 'SP22', 'SP31', 'AG04'], audience: 'โรงแรมและผู้ประกอบการ', channels: ['LINE กลุ่มผู้ประกอบการ', 'อีเมล'],
      translations: { th: { title: 'ขอความร่วมมือโรงแรมป่าตอง', message: 'ขอความร่วมมือโรงแรมในพื้นที่ป่าตอง แจ้งแขกให้งดออกจากที่พักจนกว่าจะมีประกาศเพิ่มเติม และรายงานจำนวนแขกที่ต้องการความช่วยเหลือมายังศูนย์สั่งการ', reviewed_by: 'U02' },
        en: { title: 'Patong hotels: guest safety', message: 'Hotels in Patong: please advise guests to remain indoors until further notice and report guests needing assistance to the command centre.', reviewed_by: null },
        zh: { title: '', message: '', reviewed_by: null } },
      history: [{ ts: T('13:50'), actor: 'U02', action: 'สร้างร่าง' }], deliveries: [] },
    { alert_id: 'ALT-SEA-01', scenario: 'boat', incident_id: 'INC-SEA-000', area_id: 'A4', level: 4, status: 'review', target_agencies: ['AG09', 'AG12', 'SP27', 'AG03', 'SP22', 'SP30'], audience: 'ผู้ประกอบการเรือและนักท่องเที่ยว', channels: ['LINE OA', 'วิทยุชายฝั่ง', 'ป้ายดิจิทัลท่าเรือ'],
      translations: { th: { title: 'งดออกเรือท่องเที่ยว', message: 'คลื่นลมแรงบริเวณอ่าวฉลองและฝั่งตะวันตก ขอให้งดออกเรือท่องเที่ยวทุกประเภทจนกว่าจะมีประกาศเปลี่ยนแปลง และติดตามประกาศจากกรมเจ้าท่า', reviewed_by: 'U03' },
        en: { title: 'Tourist boat departures suspended', message: 'Strong winds and high waves around Chalong Bay and the west coast. All tourist boat departures are suspended until further notice. Follow Marine Department announcements.', reviewed_by: 'U04' },
        zh: { title: '观光船暂停出发', message: '查龙湾及西海岸风浪强劲。所有观光船暂停出发，直至另行通知。请关注海事局公告。', reviewed_by: 'U04' } },
      history: [{ ts: T('13:35'), actor: 'U03', action: 'สร้างร่าง' }, { ts: T('13:44'), actor: 'U03', action: 'ส่งทบทวน' }], deliveries: [] },
    { alert_id: 'ALT-CR-01', scenario: 'crowd', incident_id: 'INC-CR-000', area_id: 'A3', level: 3, status: 'published', target_agencies: ['AG13', 'AG11', 'AG10', 'AG03', 'SP30'], acks: [{ agency_id: 'AG13', actor: 'U10', at: T('13:36') }, { agency_id: 'AG03', actor: 'U12', at: T('13:41') }], audience: 'ผู้ร่วมงานในเมืองเก่า', channels: ['ป้ายดิจิทัล', 'เสียงตามสาย', 'LINE OA'],
      translations: { th: { title: 'ถนนถลางหนาแน่น', message: 'พื้นที่ถนนถลางมีผู้ร่วมงานหนาแน่น โปรดใช้ทางออกถนนดีบุกและถนนพังงาตามคำแนะนำของเจ้าหน้าที่ และหลีกเลี่ยงการหยุดยืนบริเวณทางแยก', reviewed_by: 'U03' },
        en: { title: 'Thalang Road crowded', message: 'Thalang Road is very crowded. Please use the Dibuk Road and Phang Nga Road exits as directed by staff and avoid stopping at junctions.', reviewed_by: 'U03' },
        zh: { title: '塔朗路人流密集', message: '塔朗路人流密集。请按工作人员指引使用 Dibuk 路和 Phang Nga 路出口，避免在路口停留。', reviewed_by: 'U03' } },
      approved_by: 'U01', approved_at: T('13:30'), published_at: T('13:32'), expires_at: T('18:00'),
      history: [{ ts: T('13:05'), actor: 'U03', action: 'สร้างร่าง' }, { ts: T('13:12'), actor: 'U03', action: 'ส่งทบทวน' }, { ts: T('13:30'), actor: 'U01', action: 'อนุมัติ' }, { ts: T('13:32'), actor: 'U03', action: 'เผยแพร่' }],
      deliveries: [{ channel: 'ป้ายดิจิทัล', sent: 6, delivered: 6, acknowledged: 0, failed: 0, attempt_count: 1 }, { channel: 'เสียงตามสาย', sent: 1, delivered: 1, acknowledged: 0, failed: 0, attempt_count: 1 }, { channel: 'LINE OA', sent: 1840, delivered: 1795, acknowledged: 412, failed: 45, attempt_count: 2 }] },
  ];

  /* ---------- ingest.data_source / import_batch / quality_issue / social_signal ---------- */
  const data_sources = [
    { source_id: 'DS01', name: 'รายงานสภาพอากาศ (อุตุฯ ภาคใต้ฝั่งตะวันตก)', source_type: 'API', dataset: 'ฝนสะสม / คลื่นลม / คำเตือน', agency_id: 'SP23', owner: 'ศูนย์อุตุนิยมวิทยาภาคใต้ฝั่งตะวันตก', data_classification: 'Public', refresh_seconds: 600, last_received_at: T('13:58'), agreement_reference: 'TMD Open Data API', enabled: true, request: 'R04' },
    { source_id: 'DS02', name: 'บันทึกเหตุสาธารณภัย (ปภ.จังหวัด)', source_type: 'Manual', dataset: 'เหตุ / SOS / ทรัพยากร', agency_id: 'AG02', owner: 'ปภ.จังหวัดภูเก็ต', data_classification: 'Restricted', refresh_seconds: 60, last_received_at: T('13:59'), agreement_reference: 'ภายใน Tenant · ตัวอย่างข้อมูลได้รับแล้ว', enabled: true, request: 'R05, R08' },
    { source_id: 'DS03', name: 'จุดตรวจนับคน (Smart City CCTV)', source_type: 'CCTV', dataset: 'จำนวนรวมรายพื้นที่ (Occupancy)', agency_id: 'AG20', owner: 'เทศบาลนครภูเก็ต (เจ้าของระบบตาม สนจ.ระบุ)', data_classification: 'Internal', refresh_seconds: 900, last_received_at: T('13:45'), agreement_reference: 'MOU-SMART-2569 (ร่าง)', enabled: true, request: 'R12' },
    { source_id: 'DS04', name: 'แหล่งท่องเที่ยว พิกัด ความจุ', source_type: 'File', dataset: 'พิกัด / ความจุ / ช่วงหนาแน่น', agency_id: 'AG03', owner: 'ททท. สำนักงานภูเก็ต', data_classification: 'Public', refresh_seconds: 2592000, last_received_at: T('09:00', '2026-10-12'), agreement_reference: 'TAT Data Catalog', enabled: true, request: 'R10' },
    { source_id: 'DS05', name: 'ความหนาแน่นจากโทรศัพท์มือถือ', source_type: 'API', dataset: 'จำนวนอุปกรณ์รายกริด', agency_id: 'CD-TEL', owner: 'ผู้ให้บริการโทรคมนาคม', data_classification: 'Restricted', refresh_seconds: 3600, last_received_at: null, agreement_reference: 'รอกรณีใช้งานและงบประมาณ', enabled: false, request: 'R11' },
    { source_id: 'DS06', name: 'Social Listening ไทย/อังกฤษ/จีน', source_type: 'Social', dataset: 'โพสต์ / ความรู้สึก', agency_id: 'AG-UNI', owner: 'ทีมวิจัย (ผู้ให้บริการภายนอก)', data_classification: 'Internal', refresh_seconds: 3600, last_received_at: T('13:00'), agreement_reference: 'สัญญาผู้ให้บริการ', enabled: true, request: 'R13, R14' },
    { source_id: 'DS07', name: 'เซนเซอร์ระดับน้ำ (ทม.ป่าตอง)', source_type: 'Sensor', dataset: 'ระดับน้ำ 4 จุด', agency_id: 'SP29', owner: 'เทศบาลเมืองป่าตอง', data_classification: 'Internal', refresh_seconds: 300, last_received_at: T('13:20'), agreement_reference: 'MOU-PATONG-2569', enabled: true, request: 'R05' },
    { source_id: 'DS08', name: 'ทำเนียบผู้ประสาน / ผู้รับแจ้งเตือน', source_type: 'File', dataset: 'ผู้ประสาน เบอร์ LINE พื้นที่รับผิดชอบ', agency_id: 'AG01', owner: 'สำนักงานจังหวัดภูเก็ต', data_classification: 'Restricted', refresh_seconds: 604800, last_received_at: T('10:00', '2026-10-10'), agreement_reference: 'คำสั่งคณะทำงานข้อมูลจังหวัด', enabled: true, request: 'R01' },
    { source_id: 'DS09', name: 'สถิตินักท่องเที่ยวและรายได้รายเดือน', source_type: 'File', dataset: 'ผู้เยี่ยมเยือน รายได้ อัตราเข้าพัก', agency_id: 'AG04', owner: 'สำนักงานการท่องเที่ยวและกีฬาจังหวัดภูเก็ต', data_classification: 'Public', refresh_seconds: 2592000, last_received_at: T('09:00', '2026-10-01'), agreement_reference: 'Excel สถิติรายจังหวัด 2569', enabled: true, request: 'R02' },
    { source_id: 'DS10', name: 'โรค/อาหารเป็นพิษ/ความจุ ER', source_type: 'API', dataset: 'เหตุสุขภาพรวม · เตียง ER', agency_id: 'AG05', owner: 'สำนักงานสาธารณสุขจังหวัดภูเก็ต', data_classification: 'Restricted', refresh_seconds: 86400, last_received_at: null, agreement_reference: 'รอนัดกลุ่ม 2', enabled: false, request: 'R06' },
    { source_id: 'DS11', name: 'ผังเมืองและโครงสร้างพื้นฐาน (GIS)', source_type: 'File', dataset: 'SHP/GeoJSON พื้นที่เสี่ยง', agency_id: 'AG06', owner: 'สำนักงานโยธาธิการและผังเมืองจังหวัดภูเก็ต', data_classification: 'Internal', refresh_seconds: 7776000, last_received_at: null, agreement_reference: 'รอนัดกลุ่ม 3', enabled: false, request: 'R10' },
    { source_id: 'DS12', name: 'ประชากร รหัสพื้นที่ นิยามตัวแปร', source_type: 'File', dataset: 'ข้อมูลอ้างอิง', agency_id: 'AG07', owner: 'สำนักงานสถิติจังหวัดภูเก็ต', data_classification: 'Public', refresh_seconds: 31536000, last_received_at: T('09:00', '2026-09-30'), agreement_reference: 'บัญชีข้อมูลจังหวัด', enabled: true, request: 'R02' },
    { source_id: 'DS13', name: 'ทรัพยากรสนับสนุนและหอเตือนภัย เขต 18', source_type: 'File', dataset: 'รถ เรือ กำลังคน หอเตือนภัย', agency_id: 'AG08', owner: 'ศูนย์ ปภ. เขต 18 ภูเก็ต', data_classification: 'Internal', refresh_seconds: 604800, last_received_at: null, agreement_reference: 'รอนัดกลุ่ม 2', enabled: false, request: 'R08' },
    { source_id: 'DS14', name: 'ท่าเรือ ตารางเรือ ประกาศห้ามออกเรือ', source_type: 'File', dataset: 'ท่าเทียบเรือ · ผู้โดยสาร · ประกาศ', agency_id: 'AG09', owner: 'สำนักงานเจ้าท่าภูมิภาคสาขาภูเก็ต', data_classification: 'Public', refresh_seconds: 86400, last_received_at: T('08:00'), agreement_reference: 'ชุดข้อมูลท่าเทียบเรือ (data.go.th)', enabled: true, request: 'R09' },
    { source_id: 'DS15', name: 'เส้นทางขนส่งสาธารณะ', source_type: 'File', dataset: 'เส้นทาง จุดบริการ ผู้ประกอบการ', agency_id: 'AG10', owner: 'สำนักงานขนส่งจังหวัดภูเก็ต', data_classification: 'Public', refresh_seconds: 2592000, last_received_at: null, agreement_reference: 'รอนัดกลุ่ม 3', enabled: false, request: 'R10' },
    { source_id: 'DS16', name: 'เหตุ 191 อุบัติเหตุ จุดเสี่ยง', source_type: 'File', dataset: 'เหตุ/อุบัติเหตุ/อาชญากรรม', agency_id: 'AG11', owner: 'ตำรวจภูธรจังหวัดภูเก็ต', data_classification: 'Restricted', refresh_seconds: 86400, last_received_at: null, agreement_reference: 'รอนัดกลุ่ม 2 · API ต้องหารือ', enabled: false, request: 'R07' },
    { source_id: 'DS17', name: 'เหตุทางน้ำและทรัพยากรเรือ', source_type: 'File', dataset: 'จมน้ำ เรือล่ม เรือลาดตระเวน', agency_id: 'AG12', owner: 'กก.8 บก.รน.', data_classification: 'Restricted', refresh_seconds: 86400, last_received_at: null, agreement_reference: 'รอนัดกลุ่ม 2', enabled: false, request: 'R09' },
    { source_id: 'DS18', name: 'เหตุร้องเรียนนักท่องเที่ยว', source_type: 'File', dataset: 'ร้องเรียน/หลอกลวง (ไม่ระบุตัวบุคคล)', agency_id: 'AG13', owner: 'ตำรวจท่องเที่ยวภูเก็ต', data_classification: 'Restricted', refresh_seconds: 86400, last_received_at: T('09:00', '2026-10-12'), agreement_reference: 'ตัวอย่าง CSV ไม่ระบุตัวบุคคล', enabled: true, request: 'R07' },
    { source_id: 'DS19', name: 'ผู้โดยสารและเที่ยวบิน HKT', source_type: 'File', dataset: 'ผู้โดยสารเข้า–ออก ล่าช้า/ยกเลิก', agency_id: 'AG14', owner: 'ท่าอากาศยานภูเก็ต (ทอท.)', data_classification: 'Public', refresh_seconds: 86400, last_received_at: T('06:00'), agreement_reference: 'AOT สถิติการขนส่ง · feed สดต้องขอแยก', enabled: true, request: 'R02' },
    { source_id: 'DS20', name: 'ปิดถนน งานก่อสร้าง จุดเสี่ยงทางหลวง', source_type: 'File', dataset: 'GIS/CSV ปิดถนน', agency_id: 'AG15', owner: 'แขวงทางหลวงภูเก็ต', data_classification: 'Public', refresh_seconds: 86400, last_received_at: null, agreement_reference: 'รอนัดกลุ่ม 3', enabled: false, request: 'R10' },
    { source_id: 'DS21', name: 'คุณภาพน้ำทะเลและชายหาด', source_type: 'File', dataset: 'จุดตรวจวัด/เหตุผิดปกติ', agency_id: 'AG16', owner: 'ทสจ.ภูเก็ต', data_classification: 'Public', refresh_seconds: 604800, last_received_at: null, agreement_reference: 'รอนัดกลุ่ม 2', enabled: false, request: 'R06' },
    { source_id: 'DS22', name: 'ระดับน้ำ/อ่างเก็บน้ำ (SWOC)', source_type: 'API', dataset: 'สถานีวัดระดับน้ำภูเก็ต', agency_id: 'AG17', owner: 'โครงการชลประทานภูเก็ต', data_classification: 'Public', refresh_seconds: 3600, last_received_at: T('13:30'), agreement_reference: 'SWOC Bearer token (ทดลอง)', enabled: true, request: 'R04' },
    { source_id: 'DS23', name: 'ขอบเขตตำบล/เทศบาล (Shapefile)', source_type: 'File', dataset: 'ขอบเขต อปท. + รหัสพื้นที่', agency_id: 'AG18', owner: 'สำนักงานส่งเสริมการปกครองท้องถิ่นจังหวัดภูเก็ต', data_classification: 'Public', refresh_seconds: 31536000, last_received_at: null, agreement_reference: 'รอนัดกลุ่ม 3', enabled: false, request: 'R10' },
    { source_id: 'DS24', name: 'CCTV ศูนย์อพยพ ดับเพลิง (อบจ.)', source_type: 'File', dataset: 'พิกัด ความจุ เบอร์ติดต่อ', agency_id: 'AG19', owner: 'อบจ.ภูเก็ต', data_classification: 'Internal', refresh_seconds: 2592000, last_received_at: null, agreement_reference: 'รอนัดกลุ่ม 3', enabled: false, request: 'R10, R12' },
  ];

  const import_batches = [
    { batch_id: 'B-1400-DS03', external_batch_key: 'smartcity-20261013-1345', source_id: 'DS03', observed_at: T('13:45'), started_at: T('13:58'), finished_at: T('13:59'), status: 'loaded', accepted_rows: 1222, rejected_rows: 18, raw_object_key: 's3://raw/ds03/20261013/1345.csv', checksum: 'sha256:9f1c…' },
    { batch_id: 'B-1300-DS03', external_batch_key: 'smartcity-20261013-1245', source_id: 'DS03', observed_at: T('12:45'), started_at: T('12:57'), finished_at: T('12:58'), status: 'loaded', accepted_rows: 1180, rejected_rows: 8, raw_object_key: 's3://raw/ds03/20261013/1245.csv', checksum: 'sha256:51aa…' },
    { batch_id: 'B-1358-DS01', external_batch_key: 'tmd-20261013-1358', source_id: 'DS01', observed_at: T('13:50'), started_at: T('13:58'), finished_at: T('13:58'), status: 'loaded', accepted_rows: 96, rejected_rows: 5, raw_object_key: 's3://raw/ds01/20261013/1358.json', checksum: 'sha256:c0de…' },
    { batch_id: 'B-1300-DS06', external_batch_key: 'social-20261013-1300', source_id: 'DS06', observed_at: T('12:00'), started_at: T('13:00'), finished_at: T('13:04'), status: 'loaded', accepted_rows: 412, rejected_rows: 0, raw_object_key: 's3://raw/ds06/20261013/1300.jsonl', checksum: 'sha256:77ab…' },
    { batch_id: 'B-1320-DS07', external_batch_key: 'sensor-20261013-1320', source_id: 'DS07', observed_at: T('13:20'), started_at: T('13:21'), finished_at: T('13:21'), status: 'loaded', accepted_rows: 4, rejected_rows: 0, raw_object_key: 's3://raw/ds07/20261013/1320.json', checksum: 'sha256:e1f0…' },
  ];
  const quality_issues = [
    { issue_id: 'QI-01', batch_id: 'B-1400-DS03', source_id: 'DS03', rule_code: 'GEO_OUT_OF_AREA', message: 'พิกัดอยู่นอกขอบเขตจังหวัด', rows: 5, severity: 'warning', resolved_at: null, fix: 'ปรับพิกัดจากรหัสจุดตรวจนับ (lookup)' },
    { issue_id: 'QI-02', batch_id: 'B-1400-DS03', source_id: 'DS03', rule_code: 'DUPLICATE_EVENT_KEY', message: 'external_event_key ซ้ำภายใน 5 นาที', rows: 8, severity: 'warning', resolved_at: null, fix: 'รวมเป็นรายการเดียว เก็บประวัติ' },
    { issue_id: 'QI-03', batch_id: 'B-1400-DS03', source_id: 'DS03', rule_code: 'NEGATIVE_COUNT', message: 'count_value ติดลบ', rows: 5, severity: 'critical', resolved_at: null, fix: 'ขอข้อมูลซ้ำจากแหล่ง ไม่เติมค่าอัตโนมัติ' },
    { issue_id: 'QI-04', batch_id: 'B-1358-DS01', source_id: 'DS01', rule_code: 'TIMESTAMP_FUTURE', message: 'observed_at อยู่ในอนาคตเกิน 5 นาที', rows: 5, severity: 'critical', resolved_at: null, fix: 'ตรวจเขตเวลาต้นทาง (UTC+7 vs UTC)' },
  ];
  const social_signals = [
    { signal_id: 'SG-01', scenario: 'flood', source_id: 'DS06', area_id: 'A1', language: 'th', topic: 'น้ำท่วม', sentiment: -0.72, confidence: 0.81, published_at: T('13:05'), verification_status: 'verified', text: 'ถนนบางลาน้ำท่วมถึงเข่าแล้ว รถเล็กผ่านไม่ได้' },
    { signal_id: 'SG-02', scenario: 'flood', source_id: 'DS06', area_id: 'A1', language: 'en', topic: 'flood', sentiment: -0.55, confidence: 0.64, published_at: T('13:20'), verification_status: 'unverified', text: 'Heard the whole Patong is being evacuated?? anyone confirm' },
    { signal_id: 'SG-03', scenario: 'flood', source_id: 'DS06', area_id: 'A1', language: 'zh', topic: '洪水', sentiment: -0.6, confidence: 0.58, published_at: T('13:25'), verification_status: 'unverified', text: '巴东海滩附近淹水，酒店说不要出门' },
    { signal_id: 'SG-04', scenario: 'boat', source_id: 'DS06', area_id: 'A4', language: 'th', topic: 'เรือ', sentiment: -0.8, confidence: 0.77, published_at: T('13:50'), verification_status: 'verified', text: 'เรือสปีดโบ๊ตหน้าอ่าวฉลองลอยลำ เห็นคนโบกมือขอความช่วยเหลือ' },
    { signal_id: 'SG-05', scenario: 'boat', source_id: 'DS06', area_id: 'A4', language: 'en', topic: 'boat', sentiment: -0.9, confidence: 0.42, published_at: T('13:52'), verification_status: 'rejected', text: 'BREAKING boat sank at Chalong 20 dead' },
    { signal_id: 'SG-06', scenario: 'crowd', source_id: 'DS06', area_id: 'A3', language: 'th', topic: 'เทศกาล', sentiment: 0.3, confidence: 0.7, published_at: T('13:10'), verification_status: 'verified', text: 'งานเมืองเก่าคนแน่นมาก เดินแทบไม่ได้ตรงถนนถลาง' },
    { signal_id: 'SG-07', scenario: 'crowd', source_id: 'DS06', area_id: 'A3', language: 'zh', topic: '节日', sentiment: 0.1, confidence: 0.5, published_at: T('13:40'), verification_status: 'unverified', text: '老城区活动据说要取消了？' },
  ];

  /* ---------- analytics.risk_assessment (กฎ rule-v1.2) + geo.risk_zone ---------- */
  const riskScores = { // area × hazard → risk_score 0–100, confidence
    A1: { flood: [92, 0.86], marine: [55, 0.7], crowd: [68, 0.6], traffic: [48, 0.65], health: [30, 0.5] },
    A2: { flood: [58, 0.8], marine: [72, 0.7], crowd: [35, 0.55], traffic: [52, 0.65], health: [22, 0.5] },
    A3: { flood: [28, 0.75], marine: [10, 0.9], crowd: [90, 0.78], traffic: [40, 0.6], health: [45, 0.55] },
    A4: { flood: [35, 0.75], marine: [94, 0.82], crowd: [38, 0.55], traffic: [36, 0.6], health: [25, 0.5] },
  };
  const risk_assessments = [];
  Object.entries(riskScores).forEach(([aid, h]) => Object.entries(h).forEach(([hz, [score, conf]]) => {
    risk_assessments.push({ assessment_id: `RA-${aid}-${hz}`, area_id: aid, hazard_code: hz, model_id: null, method: 'rule-v1.2', assessed_at: T('13:50'), horizon_days: 1,
      probability: +(score / 100 * 0.9).toFixed(2), impact: Math.max(1, Math.min(5, Math.round(score / 20))), risk_score: score, confidence: conf,
      explanation: { inputs: hz === 'flood' ? ['ฝนสะสม 3 ชม. (DS01)', 'ระดับน้ำเซนเซอร์ (DS07)', 'เหตุย้อนหลัง 90 วัน'] : hz === 'marine' ? ['ความสูงคลื่น (DS01)', 'ธงเตือนชายหาด', 'เหตุทางทะเลย้อนหลัง'] : hz === 'crowd' ? ['Occupancy จุดตรวจนับ (DS03)', 'ปฏิทินกิจกรรม', 'ความจุพื้นที่'] : hz === 'traffic' ? ['อุบัติเหตุย้อนหลัง', 'ฝน'] : ['รายงาน รพ.', 'อุณหภูมิ'], weights: 'สัญญาณล่าสุด 60% · ประวัติ 40%', note: 'กฎที่เจ้าหน้าที่ร่วมออกแบบ ยังไม่ใช้ ML' } });
  }));
  const risk_zones = [
    { zone_id: 'RZ-01', area_id: 'A1', hazard_code: 'flood', level: 5, valid_from: T('00:00', '2026-10-01'), evidence_reference: 'แผนที่น้ำท่วมซ้ำซาก ปภ. 2568' },
    { zone_id: 'RZ-02', area_id: 'A4', hazard_code: 'marine', level: 4, valid_from: T('00:00', '2026-05-01'), evidence_reference: 'ประกาศเขตคลื่นลมแรงมรสุม กรมเจ้าท่า' },
    { zone_id: 'RZ-03', area_id: 'A3', hazard_code: 'crowd', level: 4, valid_from: T('00:00', '2026-10-10'), evidence_reference: 'แผนจัดงานเทศกาลเมืองเก่า 2569' },
    { zone_id: 'RZ-04', area_id: 'A2', hazard_code: 'marine', level: 3, valid_from: T('00:00', '2026-05-01'), evidence_reference: 'สถิติกระแสน้ำดูดหาดกะรน' },
  ];
  const monthly_incidents = [
    { month: '2025-11', count: 14 }, { month: '2025-12', count: 22 }, { month: '2026-01', count: 25 }, { month: '2026-02', count: 19 }, { month: '2026-03', count: 17 }, { month: '2026-04', count: 28 },
    { month: '2026-05', count: 21 }, { month: '2026-06', count: 30 }, { month: '2026-07', count: 34 }, { month: '2026-08', count: 29 }, { month: '2026-09', count: 38 }, { month: '2026-10', count: 41 },
  ];

  /* ---------- geo.mobility_cell + analytics.heatmap_cell ----------
   * 2 cell ต่อพื้นที่ · window 3600 s (11:00–14:00) · population_group All · fusion_version fusion-v1
   * estimated_count = null → No data (ไม่แสดงสีปลอดภัย)
   */
  const mobility_cells = [
    { cell_id: 'C-PTG-1', area_id: 'A1', name: 'ป่าตอง · หาด/บางลา', area_m2: 180000, grid_version: 'utm47n-300m-v1' },
    { cell_id: 'C-PTG-2', area_id: 'A1', name: 'ป่าตอง · ถนนราษฎร์อุทิศ', area_m2: 220000, grid_version: 'utm47n-300m-v1' },
    { cell_id: 'C-KRN-1', area_id: 'A2', name: 'กะรน · หาด', area_m2: 160000, grid_version: 'utm47n-300m-v1' },
    { cell_id: 'C-KRN-2', area_id: 'A2', name: 'กะรน · วงเวียน', area_m2: 140000, grid_version: 'utm47n-300m-v1' },
    { cell_id: 'C-OLD-1', area_id: 'A3', name: 'เมืองเก่า · ถนนถลาง', area_m2: 90000, grid_version: 'utm47n-300m-v1' },
    { cell_id: 'C-OLD-2', area_id: 'A3', name: 'เมืองเก่า · ถนนดีบุก', area_m2: 110000, grid_version: 'utm47n-300m-v1' },
    { cell_id: 'C-CHL-1', area_id: 'A4', name: 'อ่าวฉลอง · ท่าเรือ', area_m2: 120000, grid_version: 'utm47n-300m-v1' },
    { cell_id: 'C-CHL-2', area_id: 'A4', name: 'อ่าวฉลอง · วงเวียน', area_m2: 150000, grid_version: 'utm47n-300m-v1' },
  ];
  const crowdByScenario = { // ต่อ cell: [11,12,13,14]
    flood: { 'C-PTG-1': [90, 150, 240, 290], 'C-PTG-2': [50, 70, 120, 130], 'C-KRN-1': [50, 70, null, 75], 'C-KRN-2': [30, 40, 50, 45], 'C-OLD-1': [35, 55, 70, 60], 'C-OLD-2': [25, 35, 50, 40], 'C-CHL-1': [25, 45, 55, 45], 'C-CHL-2': [15, 25, 30, 25] },
    boat:  { 'C-PTG-1': [60, 65, 80, 70], 'C-PTG-2': [30, 35, 40, 35], 'C-KRN-1': [40, 45, null, 50], 'C-KRN-2': [20, 25, 30, 30], 'C-OLD-1': [40, 60, 65, 60], 'C-OLD-2': [30, 40, 45, 40], 'C-CHL-1': [90, 130, 230, 300], 'C-CHL-2': [30, 50, 80, 90] },
    crowd: { 'C-PTG-1': [65, 80, 100, 95], 'C-PTG-2': [35, 40, 50, 45], 'C-KRN-1': [45, 50, null, 60], 'C-KRN-2': [25, 30, 40, 40], 'C-OLD-1': [120, 180, 270, 360], 'C-OLD-2': [60, 80, 110, 130], 'C-CHL-1': [30, 40, 55, 50], 'C-CHL-2': [15, 25, 30, 25] },
  };
  const heatmap_cells = [];
  Object.entries(crowdByScenario).forEach(([sc, cells]) => Object.entries(cells).forEach(([cid, vals]) => vals.forEach((v, i) => {
    const cell = mobility_cells.find(c => c.cell_id === cid);
    const coverage = cid === 'C-KRN-1' ? 0.55 : cid.endsWith('-2') ? 0.7 : 0.85;
    heatmap_cells.push({ scenario: sc, cell_id: cid, window_start: T(`${11 + i}:00`), window_seconds: 3600, population_group: 'All', fusion_version: 'fusion-v1',
      estimated_count: v, confidence: v == null ? null : (cid === 'C-KRN-1' ? 0.5 : 0.78), source_count: v == null ? 0 : (cid.startsWith('C-PTG') ? 2 : 1), coverage_fraction: v == null ? null : coverage,
      count_method: 'occupancy', is_suppressed: v != null && v < 10, density_per_km2: v == null ? null : Math.round(v / (cell.area_m2 * coverage / 1e6)), updated_at: T('13:58') });
  })));
  // ตัวอย่าง Flow count จาก CCTV ประตูทางเข้า (คนละตัวชี้วัดกับ Occupancy)
  const flow_counts = [{ scenario: 'crowd', cell_id: 'C-OLD-1', window_start: T('13:00'), count_method: 'flow', count_value: 1240, note: 'จำนวนผ่านจุดทางเข้าถนนถลาง / ชม. — ไม่ใช่จำนวนคนในพื้นที่' }];

  /* ---------- analytics.kpi_definition ---------- */
  const kpi_definitions = [
    { kpi_code: 'INC_CONFIRMED', version: 2, name: 'เหตุที่ยืนยันแล้ว', unit: 'เหตุ', owner_agency_id: 'AG02', grain: 'พื้นที่ × ชั่วโมง', formula: 'COUNT(incident WHERE verified_by IS NOT NULL AND status != reported)', limitation: 'ไม่รวมเหตุที่ยังเป็นรายงาน' },
    { kpi_code: 'SOS_OPEN', version: 1, name: 'SOS ใหม่และค้าง', unit: 'รายการ', owner_agency_id: 'AG02', grain: 'พื้นที่ × นาที', formula: 'COUNT(sos_request WHERE status IN (received, screened) AND no completed task)', limitation: 'นับคำขอ ไม่ใช่จำนวนคน' },
    { kpi_code: 'RESP_START_P50', version: 3, name: 'เวลาเริ่มตอบสนอง P50', unit: 'นาที', owner_agency_id: 'AG02', grain: 'พื้นที่ × วัน', formula: 'PERCENTILE_CONT(0.5)(screened_at − created_at) ของ SOS ที่คัดกรองแล้ว', limitation: 'วัดถึงเจ้าหน้าที่รับคัดกรอง ไม่ใช่เวลาถึงจุดเกิดเหตุ' },
    { kpi_code: 'RESP_START_P95', version: 3, name: 'เวลาเริ่มตอบสนอง P95', unit: 'นาที', owner_agency_id: 'AG02', grain: 'พื้นที่ × วัน', formula: 'PERCENTILE_CONT(0.95)(screened_at − created_at)', limitation: 'ตัวอย่างน้อยทำให้ P95 แกว่ง' },
    { kpi_code: 'TASK_SLA_RATE', version: 1, name: 'อัตรางานเสร็จตาม SLA', unit: '%', owner_agency_id: 'AG02', grain: 'พื้นที่ × วัน', formula: 'completed ที่ completed_at ≤ due_at / งานที่เข้าเกณฑ์ (ไม่รวม cancelled)', limitation: 'งานยกเลิกแยกรายงาน' },
    { kpi_code: 'ACCEPT_RATE', version: 1, name: 'อัตราตอบรับงาน', unit: '%', owner_agency_id: 'SP32', grain: 'วัน', formula: 'assignment accepted / assignment offered', limitation: 'การส่งข้อความสำเร็จ ≠ ตอบรับ' },
    { kpi_code: 'VOL_READY', version: 1, name: 'อาสาสมัครพร้อมปฏิบัติงาน', unit: 'คน', owner_agency_id: 'SP32', grain: 'พื้นที่ × นาที', formula: 'COUNT(volunteer verified AND available AND active_tasks < max)', limitation: 'ตำแหน่งล่าสุดอาจล้าสมัย' },
    { kpi_code: 'DATA_ON_TIME', version: 2, name: 'สัดส่วนข้อมูลตรงเวลา', unit: '%', owner_agency_id: 'AG-UNI', grain: 'ชั่วโมง', formula: 'แหล่งที่ now − last_received ≤ 2 × refresh_seconds / แหล่งที่เปิดใช้', limitation: 'ไม่สะท้อนคุณภาพเนื้อหา' },
    { kpi_code: 'DENSITY_RISK', version: 1, name: 'ความหนาแน่นโดยประมาณในพื้นที่เสี่ยง', unit: 'คน/ตร.กม.', owner_agency_id: 'AG-UNI', grain: 'cell × ชั่วโมง', formula: 'estimated_count / (area_m2 × coverage_fraction) × 1e6', limitation: 'ค่าประมาณ ไม่ใช่จำนวนนักท่องเที่ยวไม่ซ้ำ' },
  ];
  const alert_rules = [
    { rule_id: 'AR-01', name: 'ฝนสะสม 3 ชม. > 90 มม.', condition: 'DS01.rain_3h > 90', action: 'แจ้งผู้บัญชาการ + เสนอร่างประกาศระดับ 4', enabled: true },
    { rule_id: 'AR-02', name: 'Occupancy > 80% ความจุ cell', condition: 'heatmap.estimated_count / capacity > 0.8', action: 'แจ้งศูนย์สั่งการ', enabled: true },
    { rule_id: 'AR-03', name: 'SOS Hard Priority ไม่มีผู้รับงานเกิน 10 นาที', condition: 'task.hard_priority AND status=pending AND age > 10m', action: 'ยกระดับไปหัวหน้าศูนย์', enabled: true },
    { rule_id: 'AR-04', name: 'แหล่งข้อมูลหลักล่าช้าเกิน 2 รอบ', condition: 'now − last_received > 2 × refresh_seconds', action: 'ติดป้าย Stale บนทุก Dashboard', enabled: true },
  ];

  const audit_log = [
    { occurred_at: T('13:59'), actor_id: 'system', action: 'import_batch.loaded', entity_type: 'import_batch', entity_id: 'B-1400-DS03', request_id: 'req-7f21', change_summary: { accepted: 1222, rejected: 18 } },
    { occurred_at: T('13:56'), actor_id: 'U02', action: 'sos.screened', entity_type: 'sos_request', entity_id: 'SOS-FL-001', request_id: 'req-7f0c', change_summary: { urgency: 5, task: 'TSK-FL-001' } },
    { occurred_at: T('13:52'), actor_id: 'U02', action: 'task.offered', entity_type: 'rescue_task', entity_id: 'TSK-FL-002', request_id: 'req-7edd', change_summary: { volunteer: 'V01', expires_at: T('14:02') } },
    { occurred_at: T('13:47'), actor_id: 'U02', action: 'alert.submitted', entity_type: 'alert', entity_id: 'ALT-FL-01', request_id: 'req-7e90', change_summary: { status: 'review' } },
    { occurred_at: T('13:32'), actor_id: 'U03', action: 'alert.published', entity_type: 'alert', entity_id: 'ALT-CR-01', request_id: 'req-7d11', change_summary: { channels: 3 } },
    { occurred_at: T('13:30'), actor_id: 'U01', action: 'alert.approved', entity_type: 'alert', entity_id: 'ALT-CR-01', request_id: 'req-7d02', change_summary: { level: 3 } },
  ];

  const scenarios = major.map(m => ({ id: m.scenario, incident_id: m.incident_id, code: m.code, name: m.title }));

  return { tenant, other_tenant, agencies, agency_functions, meeting_rounds, roles, areas, tourism_assets, hazard_types, users, major_incidents: major, incidents, volunteers, skill_names,
           sos_requests, rescue_tasks, alerts, data_sources, import_batches, quality_issues, social_signals, risk_assessments, risk_zones, monthly_incidents,
           mobility_cells, heatmap_cells, flow_counts, kpi_definitions, alert_rules, audit_log, scenarios,
           protocol_stages: [['reported', 'ตรวจพบ', 'ระบบ / ผู้แจ้ง'], ['verified', 'ตรวจสอบ', 'เจ้าหน้าที่ศูนย์สั่งการ'], ['escalated', 'ยกระดับ', 'หัวหน้าศูนย์'], ['notified', 'แจ้งผู้รับผิดชอบ', 'ผู้บัญชาการเหตุการณ์'], ['tracking', 'ติดตาม', 'เจ้าหน้าที่ศูนย์สั่งการ'], ['closed', 'ปิดเหตุ', 'หัวหน้าศูนย์']],
           meta: { data_version: '2026-10-13.3', now: NOW, snapshot_label: 'ข้อมูลจำลอง ณ 14:00 น. · 13 ต.ค. 2569', priority_rule_version: 'PR-2569.1', offer_timeout_min: 10, today: DAY } };
})();
