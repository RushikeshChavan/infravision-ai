import dotenv from "dotenv";
import mongoose from "mongoose";
import UserModel from "../models/user";
import ContractorModel from "../models/contractor";
import ProjectModel from "../models/project";
import MilestoneModel from "../models/milestone";
import BudgetModel from "../models/budget";
import InspectionModel from "../models/inspection";
import DocumentModel from "../models/document";
import { connectMongo } from "./mongo";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/infravision";

export async function seedDatabase() {
  console.log("Connecting to database at:", MONGODB_URI);
  await connectMongo(MONGODB_URI);

  console.log("Clearing existing collections...");
  await Promise.all([
    UserModel.deleteMany({}),
    ContractorModel.deleteMany({}),
    ProjectModel.deleteMany({}),
    MilestoneModel.deleteMany({}),
    BudgetModel.deleteMany({}),
    InspectionModel.deleteMany({}),
    DocumentModel.deleteMany({}),
  ]);

  console.log("Creating demo users across all 7 RBAC roles...");
  // Pass plain password; pre-save hook will hash it
  const defaultPassword = "Password@123";

  const superAdmin = await UserModel.create({
    name: "Dr. Rajeshwar Sharma",
    email: "admin@infravision.gov",
    password: defaultPassword,
    role: "Super Admin",
    department: "Ministry of Road Transport & Highways",
    isActive: true,
  });

  const deptAdmin = await UserModel.create({
    name: "Priya Nambiar",
    email: "deptadmin@pwd.gov",
    password: defaultPassword,
    role: "Department Admin",
    department: "Public Works Department",
    isActive: true,
  });

  const projectManager = await UserModel.create({
    name: "Vikramaditya Roy",
    email: "pm@pwd.gov",
    password: defaultPassword,
    role: "Project Manager",
    department: "Public Works Department",
    isActive: true,
  });

  const fieldEngineer = await UserModel.create({
    name: "Ananya Deshmukh",
    email: "field@pwd.gov",
    password: defaultPassword,
    role: "Field Engineer",
    department: "Public Works Department",
    isActive: true,
  });

  const contractorUser = await UserModel.create({
    name: "Sunil Kulkarni",
    email: "contractor@infra.com",
    password: defaultPassword,
    role: "Contractor",
    department: "L&T Heavy Civil Infrastructure",
    isActive: true,
  });

  const auditor = await UserModel.create({
    name: "Kavita Srinivasan",
    email: "auditor@cag.gov",
    password: defaultPassword,
    role: "Auditor",
    department: "Comptroller & Auditor General of India",
    isActive: true,
  });

  const citizen = await UserModel.create({
    name: "Aarav Mehta",
    email: "citizen@public.org",
    password: defaultPassword,
    role: "Citizen",
    isActive: true,
  });

  console.log("Users created successfully.");

  console.log("Creating registered contractors...");
  const lntContractor = await ContractorModel.create({
    companyName: "Larsen & Toubro Heavy Civil Infrastructure Ltd.",
    registrationNumber: "LNT-INF-2021-9982",
    contactPerson: "Sunil Kulkarni",
    email: "contractor@infra.com",
    phone: "+91 22 6752 5656",
    address: "L&T House, Ballard Estate, Mumbai, Maharashtra 400001",
    performanceScore: 94,
    status: "Active",
    user: contractorUser._id,
  });

  const afconsContractor = await ContractorModel.create({
    companyName: "Afcons Infrastructure Projects Corp.",
    registrationNumber: "AFC-INF-2019-4412",
    contactPerson: "Manish Tiwari",
    email: "mtiwari@afcons.com",
    phone: "+91 22 6719 1000",
    address: "Afcons House, Veera Desai Road, Andheri West, Mumbai 400053",
    performanceScore: 82,
    status: "Active",
  });

  const tataContractor = await ContractorModel.create({
    companyName: "Tata Projects Strategic Works Ltd.",
    registrationNumber: "TATA-PRJ-2020-7731",
    contactPerson: "Rameshwar Rao",
    email: "rrao@tataprojects.com",
    phone: "+91 40 6623 8800",
    address: "Mithona Towers, Prenderghast Road, Secunderabad, Telangana 500003",
    performanceScore: 96,
    status: "Active",
  });

  const dblContractor = await ContractorModel.create({
    companyName: "Dilip Buildcon Expressway Division",
    registrationNumber: "DBL-EXP-2022-3109",
    contactPerson: "Harish Patel",
    email: "hpatel@dilipbuildcon.com",
    phone: "+91 755 402 9999",
    address: "Plot No. 5, Inside Govind Narayan Colony, Bhopal, MP 462016",
    performanceScore: 68,
    status: "Active",
  });

  console.log("Contractors created successfully.");

  console.log("Creating realistic infrastructure projects...");

  // Project 1: Ongoing Coastal Road
  const p1 = await ProjectModel.create({
    name: "Mumbai Coastal Road Project (South Sector — Marine Drive to Worli)",
    projectCode: "MCRP-PKG-01",
    description:
      "An 8-lane, 10.58 km freeway grade expressway including twin 3.4 km undersea tunnels connecting Princess Street flyover at Marine Lines to Worli end of the Bandra-Worli Sea Link.",
    department: "Public Works Department",
    location: "Mumbai Coastal Corridor, Maharashtra",
    latitude: 18.9750,
    longitude: 72.8258,
    plannedStartDate: new Date("2024-01-15"),
    plannedEndDate: new Date("2026-12-31"),
    actualStartDate: new Date("2024-02-01"),
    totalBudget: 12721000000, // 12,721 Crores
    status: "Ongoing",
    projectManager: projectManager._id,
    contractor: lntContractor._id,
    createdBy: superAdmin._id,
  });

  // Project 2: Delayed Airport Metro Line
  const p2 = await ProjectModel.create({
    name: "Bengaluru Metro Phase 2B (KR Puram to Kempegowda International Airport)",
    projectCode: "BMRCL-PH2B",
    description:
      "A 37 km elevated rapid transit metro corridor with 17 stations along Outer Ring Road and Bellary Road connecting central tech parks to KIA Airport Terminal.",
    department: "Urban Development Department",
    location: "Hebbal-Yelahanka Corridor, Bengaluru, Karnataka",
    latitude: 13.0827,
    longitude: 77.6322,
    plannedStartDate: new Date("2023-06-01"),
    plannedEndDate: new Date("2025-11-30"),
    actualStartDate: new Date("2023-08-15"),
    totalBudget: 14844000000, // 14,844 Crores
    status: "Delayed",
    projectManager: projectManager._id,
    contractor: afconsContractor._id,
    createdBy: superAdmin._id,
  });

  // Project 3: Completed Atal Setu MTHL
  const p3 = await ProjectModel.create({
    name: "Atal Setu (Mumbai Trans Harbour Link — Sewri to Chirle Nhava Sheva)",
    projectCode: "MTHL-PKG-04",
    description:
      "A 21.8 km 6-lane sea bridge (16.5 km over sea) connecting Sewri in South Mumbai with Chirle in Navi Mumbai, featuring orthotropic steel deck spans.",
    department: "Ministry of Road Transport & Highways",
    location: "Sewri - Nhava Sheva, Maharashtra",
    latitude: 18.9986,
    longitude: 72.9642,
    plannedStartDate: new Date("2021-03-01"),
    plannedEndDate: new Date("2024-01-12"),
    actualStartDate: new Date("2021-04-10"),
    actualEndDate: new Date("2024-01-12"),
    totalBudget: 17840000000, // 17,840 Crores
    status: "Completed",
    projectManager: projectManager._id,
    contractor: tataContractor._id,
    createdBy: superAdmin._id,
  });

  // Project 4: Planned High Speed Bullet Rail
  const p4 = await ProjectModel.create({
    name: "Delhi-Varanasi High-Speed Bullet Rail Corridor (Section 1A Noida-Agra)",
    projectCode: "DVHSR-SEC-1A",
    description:
      "First 200 km section of the proposed 958 km high-speed electrified railway corridor operating at design speeds of 350 km/h connecting Jewar Airport to Agra Cantt.",
    department: "Ministry of Railways",
    location: "Noida - Agra Expressway Corridor, Uttar Pradesh",
    latitude: 27.8974,
    longitude: 78.0880,
    plannedStartDate: new Date("2026-09-01"),
    plannedEndDate: new Date("2030-03-31"),
    totalBudget: 28500000000, // 28,500 Crores
    status: "Planned",
    projectManager: projectManager._id,
    createdBy: superAdmin._id,
  });

  // Project 5: Ongoing Zojila Pass Strategic Tunnel
  const p5 = await ProjectModel.create({
    name: "Zojila Pass All-Weather Strategic Tunnel (NH-1 Sonamarg-Drass)",
    projectCode: "NHIDCL-ZOJILA",
    description:
      "A 14.15 km horseshoe-shaped single-tube bi-directional strategic tunnel at 11,578 ft altitude providing year-round connectivity between Srinagar and Leh.",
    department: "National Highways & Infrastructure Development",
    location: "Sonamarg - Baltal - Drass, Ladakh / J&K",
    latitude: 34.2819,
    longitude: 75.4806,
    plannedStartDate: new Date("2023-01-01"),
    plannedEndDate: new Date("2027-10-31"),
    actualStartDate: new Date("2023-03-15"),
    totalBudget: 6800000000, // 6,800 Crores
    status: "Ongoing",
    projectManager: projectManager._id,
    contractor: lntContractor._id,
    createdBy: superAdmin._id,
  });

  // Project 6: Delayed Logistics Multimodal ICD Hub
  const p6 = await ProjectModel.create({
    name: "Surat Multimodal Logistics Park & Inland Container Terminal",
    projectCode: "SMC-LOG-09",
    description:
      "A 120-acre automated warehousing, rail-linked inland container depot, and cold storage logistics transshipment facility near Hazira Industrial Zone.",
    department: "Commerce & Logistics Department",
    location: "Hazira Port Link, Surat, Gujarat",
    latitude: 21.1702,
    longitude: 72.8311,
    plannedStartDate: new Date("2023-10-01"),
    plannedEndDate: new Date("2025-06-30"),
    actualStartDate: new Date("2023-11-20"),
    totalBudget: 3450000000, // 3,450 Crores
    status: "Delayed",
    projectManager: projectManager._id,
    contractor: dblContractor._id,
    createdBy: superAdmin._id,
  });

  console.log("Projects created successfully.");

  console.log("Creating milestones across projects...");

  // Milestones for P1 (Mumbai Coastal Road - Ongoing, 65% overall progress)
  await MilestoneModel.create([
    {
      project: p1._id,
      name: "Land Reclamation & Sea Wall Armoring (Package 1)",
      description: "Reclamation of 111 hectares from Arabian Sea and construction of 7.5 km seawall with tetrapods.",
      plannedDate: new Date("2024-06-30"),
      actualDate: new Date("2024-07-10"),
      completionPercentage: 100,
      status: "Completed",
      verifiedBy: fieldEngineer._id,
      verificationDate: new Date("2024-07-12"),
    },
    {
      project: p1._id,
      name: "Undersea Twin Tunnel Excavation (Mavala TBM)",
      description: "12.19m diameter slurry TBM excavation under Malabar Hill and Arabian Sea bed over 2.07 km length.",
      plannedDate: new Date("2025-03-31"),
      actualDate: new Date("2025-04-15"),
      completionPercentage: 100,
      status: "Completed",
      verifiedBy: fieldEngineer._id,
      verificationDate: new Date("2025-04-18"),
    },
    {
      project: p1._id,
      name: "Interchange & Bowstring Arch Steel Bridge Installation",
      description: "Fabrication and hydraulic jacking of 144m arch bridge linking Coastal Road to Bandra-Worli Sea Link.",
      plannedDate: new Date("2025-12-15"),
      completionPercentage: 70,
      status: "In Progress",
      verifiedBy: fieldEngineer._id,
      verificationDate: new Date("2026-01-20"),
    },
    {
      project: p1._id,
      name: "SCADA Traffic Management & Fire Safety Commissioning",
      description: "Installation of Saccardo nozzle ventilation, automated incident detection cameras, and fire hydrants.",
      plannedDate: new Date("2026-08-30"),
      completionPercentage: 20,
      status: "In Progress",
    },
    {
      project: p1._id,
      name: "Final Safety Audit & Commercial Opening",
      description: "Comprehensive statutory safety certification by Independent Safety Assessor (ISA).",
      plannedDate: new Date("2026-12-31"),
      completionPercentage: 0,
      status: "Pending",
    },
  ]);

  // Milestones for P2 (Bangalore Airport Metro - Delayed)
  await MilestoneModel.create([
    {
      project: p2._id,
      name: "Utility Shifting & Land Acquisition (Package 1 & 2)",
      description: "Clearance of underground high-tension power cables and GAIL gas pipelines along Bellary Road.",
      plannedDate: new Date("2023-12-31"),
      actualDate: new Date("2024-04-20"),
      completionPercentage: 100,
      status: "Completed",
      verifiedBy: fieldEngineer._id,
      verificationDate: new Date("2024-04-25"),
    },
    {
      project: p2._id,
      name: "Pier Foundation & Substructure Erection",
      description: "Cast-in-situ piling and pier caps across 1,100 elevated spans along Outer Ring Road.",
      plannedDate: new Date("2024-08-31"),
      completionPercentage: 60,
      status: "Delayed",
      verifiedBy: fieldEngineer._id,
      verificationDate: new Date("2025-02-10"),
    },
    {
      project: p2._id,
      name: "U-Girder Launching & Viaduct Superstructure",
      description: "Segmental launching of 28m U-girders using hydraulic mobile launching gantries.",
      plannedDate: new Date("2025-04-30"),
      completionPercentage: 30,
      status: "Delayed",
    },
    {
      project: p2._id,
      name: "Airport Terminal Underground Station Box Construction",
      description: "Cut-and-cover underground box station structure beneath KIA T2 parking concourse.",
      plannedDate: new Date("2025-08-15"),
      completionPercentage: 15,
      status: "In Progress",
    },
  ]);

  // Milestones for P3 (Atal Setu MTHL - Completed 100%)
  await MilestoneModel.create([
    {
      project: p3._id,
      name: "Marine Geotechnical Borehole Investigation",
      description: "Deep seismic core drilling across Thane Creek seabed for pier foundation design.",
      plannedDate: new Date("2021-08-31"),
      actualDate: new Date("2021-08-15"),
      completionPercentage: 100,
      status: "Completed",
      verifiedBy: fieldEngineer._id,
      verificationDate: new Date("2021-08-20"),
    },
    {
      project: p3._id,
      name: "Orthotropic Steel Deck (OSD) Erection",
      description: "Erection of 70 long-span OSD steel segments manufactured in Japan and South Korea.",
      plannedDate: new Date("2023-05-31"),
      actualDate: new Date("2023-05-20"),
      completionPercentage: 100,
      status: "Completed",
      verifiedBy: fieldEngineer._id,
      verificationDate: new Date("2023-05-25"),
    },
    {
      project: p3._id,
      name: "Bridge Surface Asphalt Paving & Sound Barriers",
      description: "Mastic asphalt waterproofing, crash barriers, and noise mitigation acoustic panels.",
      plannedDate: new Date("2023-11-30"),
      actualDate: new Date("2023-11-15"),
      completionPercentage: 100,
      status: "Completed",
      verifiedBy: fieldEngineer._id,
      verificationDate: new Date("2023-11-20"),
    },
    {
      project: p3._id,
      name: "Statutory Load Testing & Inauguration",
      description: "Multi-axle dynamic load testing with 32 heavy dumpers and commercial commissioning.",
      plannedDate: new Date("2024-01-12"),
      actualDate: new Date("2024-01-12"),
      completionPercentage: 100,
      status: "Completed",
      verifiedBy: fieldEngineer._id,
      verificationDate: new Date("2024-01-12"),
    },
  ]);

  // Milestones for P5 (Zojila Tunnel - Ongoing)
  await MilestoneModel.create([
    {
      project: p5._id,
      name: "Portal Approach Road & Avalanche Gallery Construction",
      description: "Reinforced concrete snow gallery construction at Nilgrath and Minamarg portal approaches.",
      plannedDate: new Date("2024-05-31"),
      actualDate: new Date("2024-06-10"),
      completionPercentage: 100,
      status: "Completed",
      verifiedBy: fieldEngineer._id,
      verificationDate: new Date("2024-06-15"),
    },
    {
      project: p5._id,
      name: "Heading & Benching NATM Tunnel Excavation (Km 0 to Km 7)",
      description: "Drill and blast excavation using 3-boom computerized jumbo drilling rigs through metamorphic rock.",
      plannedDate: new Date("2025-10-31"),
      completionPercentage: 55,
      status: "In Progress",
      verifiedBy: fieldEngineer._id,
      verificationDate: new Date("2025-11-10"),
    },
    {
      project: p5._id,
      name: "Waterproofing Membrane & Final Concrete Lining",
      description: "Installation of 2mm PVC waterproofing membrane and hydraulic gantry cast-in-place lining.",
      plannedDate: new Date("2026-11-30"),
      completionPercentage: 20,
      status: "In Progress",
    },
  ]);

  // Milestones for P6 (Surat Logistics Hub - Delayed)
  await MilestoneModel.create([
    {
      project: p6._id,
      name: "Heavy Duty RCC Pavement & Railway Siding Laying",
      description: "Construction of 40-tonne container handling yard pavement and 3.2 km dedicated freight railway track.",
      plannedDate: new Date("2024-04-30"),
      actualDate: new Date("2024-08-15"),
      completionPercentage: 85,
      status: "Delayed",
      verifiedBy: fieldEngineer._id,
      verificationDate: new Date("2024-08-20"),
    },
    {
      project: p6._id,
      name: "Automated Cold Chain Warehouse Superstructure",
      description: "Pre-engineered steel building (PEB) structure with temperature-controlled multi-chamber chambers.",
      plannedDate: new Date("2024-11-30"),
      completionPercentage: 40,
      status: "Delayed",
    },
  ]);

  console.log("Milestones created successfully.");

  console.log("Creating budget allocations & expenditure records...");

  // Budgets for P1 (Mumbai Coastal Road - 12,721 Cr)
  await BudgetModel.create([
    {
      project: p1._id,
      category: "Civil Works & Sea Wall Reclamation",
      allocatedAmount: 5200000000,
      utilizedAmount: 4850000000,
      remainingAmount: 350000000,
      description: "Sub-sea reclamation, tetrapod placement, and armoring embankment.",
      lastUpdatedBy: projectManager._id,
    },
    {
      project: p1._id,
      category: "Undersea Tunnel Boring & Lining",
      allocatedAmount: 4100000000,
      utilizedAmount: 3900000000,
      remainingAmount: 200000000,
      description: "Mavala slurry TBM operation, precast ring segments, and grouting.",
      lastUpdatedBy: projectManager._id,
    },
    {
      project: p1._id,
      category: "Electrical, SCADA & Fire Suppression",
      allocatedAmount: 1800000000,
      utilizedAmount: 650000000,
      remainingAmount: 1150000000,
      description: "Ventilation fan banks, intelligent traffic management, CCTV, and sensors.",
      lastUpdatedBy: projectManager._id,
    },
    {
      project: p1._id,
      category: "Environmental & Marine Compliance",
      allocatedAmount: 821000000,
      utilizedAmount: 510000000,
      remainingAmount: 311000000,
      description: "Mangrove replantation, acoustic ocean monitors, and water turbidity checks.",
      lastUpdatedBy: projectManager._id,
    },
    {
      project: p1._id,
      category: "Contingency & Price Escalation Reserve",
      allocatedAmount: 800000000,
      utilizedAmount: 120000000,
      remainingAmount: 680000000,
      description: "Statutory escalation buffer and unforeseen geological adjustments.",
      lastUpdatedBy: projectManager._id,
    },
  ]);

  // Budgets for P2 (Bangalore Metro Phase 2B - 14,844 Cr)
  await BudgetModel.create([
    {
      project: p2._id,
      category: "Land Acquisition & Utility Diversion",
      allocatedAmount: 3800000000,
      utilizedAmount: 3750000000,
      remainingAmount: 50000000,
      description: "Right of Way acquisition along NH-44 and GAIL pipe relocation.",
      lastUpdatedBy: projectManager._id,
    },
    {
      project: p2._id,
      category: "Viaduct Superstructure & Piling",
      allocatedAmount: 6200000000,
      utilizedAmount: 4900000000,
      remainingAmount: 1300000000,
      description: "Foundation piles, pier caps, and U-girder casting and launching.",
      lastUpdatedBy: projectManager._id,
    },
    {
      project: p2._id,
      category: "Station Architecture & MEP",
      allocatedAmount: 2844000000,
      utilizedAmount: 820000000,
      remainingAmount: 2024000000,
      description: "17 elevated and underground stations civil and electrical fitouts.",
      lastUpdatedBy: projectManager._id,
    },
    {
      project: p2._id,
      category: "Rolling Stock & CBTC Signalling",
      allocatedAmount: 2000000000,
      utilizedAmount: 400000000,
      remainingAmount: 1600000000,
      description: "Driverless metro trainsets and CBTC signalling hardware.",
      lastUpdatedBy: projectManager._id,
    },
  ]);

  // Budgets for P3 (Atal Setu MTHL - 17,840 Cr)
  await BudgetModel.create([
    {
      project: p3._id,
      category: "Orthotropic Steel Deck Superstructure",
      allocatedAmount: 8900000000,
      utilizedAmount: 8850000000,
      remainingAmount: 50000000,
      description: "Imported high-tensile steel deck modules and marine barge erection.",
      lastUpdatedBy: projectManager._id,
    },
    {
      project: p3._id,
      category: "Marine Substructure & Deep Foundation",
      allocatedAmount: 5640000000,
      utilizedAmount: 5620000000,
      remainingAmount: 20000000,
      description: "Reverse circulation drilled piles and precast hollow pier elements.",
      lastUpdatedBy: projectManager._id,
    },
    {
      project: p3._id,
      category: "Toll Plaza, Lighting & ITS Systems",
      allocatedAmount: 3300000000,
      utilizedAmount: 3280000000,
      remainingAmount: 20000000,
      description: "Open road tolling gantries, variable message signs, and solar grid.",
      lastUpdatedBy: projectManager._id,
    },
  ]);

  console.log("Budgets created successfully.");

  console.log("Creating field inspections with GPS telemetry...");

  // Inspections for P1 (Mumbai Coastal Road)
  await InspectionModel.create([
    {
      project: p1._id,
      inspector: fieldEngineer._id,
      inspectionDate: new Date("2026-02-10"),
      latitude: 18.9752,
      longitude: 72.8260,
      status: "Completed",
      completionPercentage: 68,
      verified: true,
      remarks:
        "Verified bowstring arch steel bridge bearing seating. Core compressive strength exceeds 60 MPa target. No distress noted on seawall armoring.",
    },
    {
      project: p1._id,
      inspector: fieldEngineer._id,
      inspectionDate: new Date("2026-01-15"),
      latitude: 18.9680,
      longitude: 72.8190,
      status: "Completed",
      completionPercentage: 62,
      verified: true,
      remarks:
        "Inspected Saccardo jet fans and deluge sprinkler mains inside Southbound tunnel tube. Flow rate and pressure benchmarks satisfied.",
    },
    {
      project: p1._id,
      inspector: fieldEngineer._id,
      inspectionDate: new Date("2026-03-20"),
      latitude: 18.9810,
      longitude: 72.8290,
      status: "Scheduled",
      completionPercentage: 70,
      verified: false,
      remarks:
        "Scheduled quarterly structural audit of Worli interchange ramp connections and asphalt friction coefficient testing.",
    },
  ]);

  // Inspections for P2 (Bangalore Metro - Delayed)
  await InspectionModel.create([
    {
      project: p2._id,
      inspector: fieldEngineer._id,
      inspectionDate: new Date("2026-01-28"),
      latitude: 13.0830,
      longitude: 77.6325,
      status: "Completed",
      completionPercentage: 42,
      verified: true,
      remarks:
        "Non-conformance notice issued: Launching gantry #3 stalled due to hydraulic cylinder seal leak. Contractor instructed to expedite replacement parts.",
    },
    {
      project: p2._id,
      inspector: fieldEngineer._id,
      inspectionDate: new Date("2025-11-14"),
      latitude: 13.1105,
      longitude: 77.6401,
      status: "Failed",
      completionPercentage: 35,
      verified: false,
      remarks:
        "Rebar corrosion detected on exposed pier cap dowels near Yelahanka bypass. Requires sandblasting, rust converter primer, and re-inspection.",
    },
  ]);

  // Inspections for P3 (Atal Setu)
  await InspectionModel.create([
    {
      project: p3._id,
      inspector: fieldEngineer._id,
      inspectionDate: new Date("2024-01-10"),
      latitude: 18.9986,
      longitude: 72.9642,
      status: "Completed",
      completionPercentage: 100,
      verified: true,
      remarks:
        "Final commissioning audit concluded. Multi-axle load test deflection measured at 4.2 mm, well within permissible limit of 12 mm. Certified fit for opening.",
    },
  ]);

  console.log("Inspections created successfully.");

  console.log("Creating project documents with classification levels...");

  // Documents for P1 (Mumbai Coastal Road)
  await DocumentModel.create([
    {
      project: p1._id,
      uploadedBy: superAdmin._id,
      documentType: "Approval",
      fileName: "CRZ_Clearance_MoEFCC_MCRP.pdf",
      fileUrl: "https://infravision.gov.in/docs/CRZ_Clearance_MoEFCC_MCRP.pdf",
      classification: "PUBLIC",
      description: "Ministry of Environment, Forest & Climate Change Coastal Regulation Zone statutory clearance.",
      uploadedAt: new Date("2024-01-20"),
    },
    {
      project: p1._id,
      uploadedBy: projectManager._id,
      documentType: "Contract",
      fileName: "EPC_Contract_Agreement_LNT_Pkg1.pdf",
      fileUrl: "https://infravision.gov.in/docs/EPC_Contract_Agreement_LNT_Pkg1.pdf",
      classification: "INTERNAL",
      description: "Lump sum EPC agreement including performance guarantee, liquidated damages schedule, and defect liability terms.",
      uploadedAt: new Date("2024-02-05"),
    },
    {
      project: p1._id,
      uploadedBy: fieldEngineer._id,
      documentType: "Progress Report",
      fileName: "Q4_2025_Executive_Engineering_Progress.pdf",
      fileUrl: "https://infravision.gov.in/docs/Q4_2025_Executive_Engineering_Progress.pdf",
      classification: "PUBLIC",
      description: "Quarterly public progress overview with aerial photography, tunnel penetration metrics, and timeline chart.",
      uploadedAt: new Date("2026-01-05"),
    },
    {
      project: p1._id,
      uploadedBy: auditor._id,
      documentType: "Invoice",
      fileName: "Interim_Payment_Certificate_IPC_14.pdf",
      fileUrl: "https://infravision.gov.in/docs/Interim_Payment_Certificate_IPC_14.pdf",
      classification: "RESTRICTED",
      description: "Audited milestone payment release certificate for steel arch fabrication works.",
      uploadedAt: new Date("2026-02-01"),
    },
  ]);

  // Documents for P2 (Bangalore Metro)
  await DocumentModel.create([
    {
      project: p2._id,
      uploadedBy: projectManager._id,
      documentType: "Estimate",
      fileName: "Detailed_Project_Report_DPR_Ph2B.pdf",
      fileUrl: "https://infravision.gov.in/docs/Detailed_Project_Report_DPR_Ph2B.pdf",
      classification: "INTERNAL",
      description: "Comprehensive engineering DPR detailing alignment, ridership forecast, and station layouts.",
      uploadedAt: new Date("2023-06-15"),
    },
    {
      project: p2._id,
      uploadedBy: projectManager._id,
      documentType: "Approval",
      fileName: "Cabinet_Committee_Economic_Affairs_Approval.pdf",
      fileUrl: "https://infravision.gov.in/docs/CCEA_Approval_AirportMetro.pdf",
      classification: "PUBLIC",
      description: "Central government Cabinet approval sanction order with equity funding structure.",
      uploadedAt: new Date("2023-07-01"),
    },
  ]);

  // Documents for P3 (Atal Setu)
  await DocumentModel.create([
    {
      project: p3._id,
      uploadedBy: superAdmin._id,
      documentType: "Completion Report",
      fileName: "MTHL_Final_Project_Completion_Certificate.pdf",
      fileUrl: "https://infravision.gov.in/docs/MTHL_Final_Completion_Certificate.pdf",
      classification: "PUBLIC",
      description: "Official statutory completion certification and commercial handover certificate.",
      uploadedAt: new Date("2024-01-12"),
    },
  ]);

  console.log("Documents created successfully.");
  console.log("\n============================================================");
  console.log("INFRAVISION AI DEMO SEED COMPLETED SUCCESSFULLY!");
  console.log("============================================================");
  console.log("Demo Accounts (Password: Password@123 for all):");
  console.log("  1. Super Admin       : admin@infravision.gov");
  console.log("  2. Department Admin  : deptadmin@pwd.gov");
  console.log("  3. Project Manager   : pm@pwd.gov");
  console.log("  4. Field Engineer    : field@pwd.gov");
  console.log("  5. Contractor        : contractor@infra.com");
  console.log("  6. Auditor           : auditor@cag.gov");
  console.log("  7. Citizen           : citizen@public.org");
  console.log("============================================================\n");
}

// If invoked directly from CLI
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seed script execution finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed script failed:", err);
      process.exit(1);
    });
}
