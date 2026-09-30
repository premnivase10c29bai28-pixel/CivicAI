// CivicAI Realistic Mock Data (DEMO / PROTOTYPE DATA)
// Note: Location, user identities, complaints, and metrics are simulated sample data
// to be replaced by real Firebase authentication and live backend APIs in later stages.

export const MOCK_USER_CITIZEN = {
  id: "USR-CTZ-0891",
  name: "Joshua Sheshan",
  email: "joshua.sheshan@civicai.org",
  phone: "+91 98401 23456",
  district: "Chennai South",
  ward: "Ward 12",
  preferredLanguage: "Tamil",
  role: "citizen",
  isDemoProfile: true,
  joinedDate: "2026-01-15",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
};

export const MOCK_USER_AUTHORITY = {
  id: "USR-AUTH-0042",
  name: "Dr. K. Ramanathan, IAS",
  email: "commissioner@civic-portal.gov.in",
  phone: "+91 44 2538 4100",
  district: "Greater Municipal Region",
  department: "Municipal Administration & Civic Governance",
  designation: "Zonal Municipal Commissioner",
  role: "authority",
  isDemoProfile: true,
  badgeNumber: "TN-MC-2026-88",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
};

export const CIVIC_DEPARTMENTS = [
  "Water Supply & Sewerage (CMWSSB)",
  "Solid Waste Management",
  "Roads & Infrastructure",
  "Electrical & Street Lighting",
  "Public Health & Sanitation",
  "Stormwater Drainage",
  "Urban Forestry & Parks"
];

export const CIVIC_CATEGORIES = [
  { id: "water", name: "Water Supply", subcategories: ["Drinking Water", "Low Pressure", "Contaminated Water", "Pipeline Leakage", "Water Tanker Delay"] },
  { id: "drainage", name: "Drainage & Sanitation", subcategories: ["Sewage Overflow", "Blocked Drain", "Missing Manhole Cover", "Stormwater Overflow", "Mosquito Breeding"] },
  { id: "roads", name: "Roads & Traffic", subcategories: ["Potholes", "Damaged Road", "Traffic Light Malfunction", "Speed Breaker Need", "Footpath Encroachment"] },
  { id: "lighting", name: "Street Lighting", subcategories: ["Streetlight Not Working", "Flickering Lights", "Broken Lamp Post", "Daytime Burning Lights", "Dark Stretch"] },
  { id: "waste", name: "Solid Waste Management", subcategories: ["Garbage Accumulation", "Uncleaned Bins", "Open Dumping", "Dead Animal Removal", "Hazardous Waste"] },
  { id: "electricity", name: "Electricity & Power", subcategories: ["Low Voltage", "Power Fluctuation", "Hanging Wire", "Damaged Transformer", "Meter Box Issue"] },
  { id: "parks", name: "Public Health & Parks", subcategories: ["Damaged Play Equipment", "Overgrown Weeds", "Stray Dogs Issue", "Public Toilet Maintenance", "Fumigation Request"] }
];

export const INITIAL_COMPLAINTS = [
  {
    id: "CIV-2026-00124",
    title: "Drinking water unavailable for 5 consecutive days",
    originalText: "எங்கள் பகுதியில் ஐந்து நாட்களாக குடிநீர் வரவில்லை. பொதுமக்கள் மிகவும் சிரமப்படுகின்றனர். தயவுசெய்து உடனடி நடவடிக்கை எடுக்கவும்.",
    originalTextEn: "Drinking water has not been available in our area for five days. Residents are facing severe hardship. Please take immediate action.",
    language: "Tamil",
    category: "Water Supply",
    subcategory: "Drinking Water",
    severity: "High",
    status: "In Progress",
    department: "Water Supply & Sewerage (CMWSSB)",
    location: {
      address: "Cross Street 4, Kasturba Nagar, Adyar",
      ward: "Ward 12",
      district: "Chennai South",
      lat: 13.0067,
      lng: 80.2571
    },
    submittedBy: "Joshua Sheshan",
    userId: "USR-CTZ-0891",
    submittedAt: "2026-09-24T09:30:00Z",
    updatedAt: "2026-09-27T14:15:00Z",
    aiAnalysis: {
      model: "CivicAI Neural Engine v3.4",
      confidence: 0.96,
      detectedLanguage: "Tamil (தமிழ்)",
      keyEntities: ["5 days water shortage", "Ward 12", "drinking water infrastructure"],
      urgencyScore: 88,
      summary: "Drinking water has not been available in the reported area for approximately five days, impacting residential households.",
      suggestedDepartment: "Water Supply & Sewerage (CMWSSB)",
      detectedSeverity: "High",
      citizenConfirmed: true,
      confirmedAt: "2026-09-24T09:32:10Z"
    },
    images: [
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
    ],
    timeline: [
      {
        stage: "Reported",
        timestamp: "2026-09-24T09:30:00Z",
        actor: "Joshua Sheshan (Citizen)",
        note: "Complaint submitted via CivicAI Voice & Text Assistant in Tamil. Citizen verified AI analysis."
      },
      {
        stage: "Received",
        timestamp: "2026-09-24T09:35:12Z",
        actor: "CivicAI Central Routing Engine",
        note: "Triaged and auto-routed to CMWSSB Adyar Distribution Section."
      },
      {
        stage: "Under Review",
        timestamp: "2026-09-25T11:20:00Z",
        actor: "Er. S. Muruganathan (Asst. Engineer)",
        note: "Corroborated with Feeder Line 4 pressure drop telemetry. Pressure fault detected."
      },
      {
        stage: "Assigned",
        timestamp: "2026-09-26T08:45:00Z",
        actor: "CMWSSB Operations Control",
        note: "Field Repair Crew #3 deployed under Supervisor R. Babu."
      },
      {
        stage: "In Progress",
        timestamp: "2026-09-27T14:15:00Z",
        actor: "Repair Team Alpha",
        note: "Excavation and sub-feeder valve replacement underway at Kasturba 3rd cross junction."
      }
    ],
    authorityUpdates: [
      {
        id: "UPD-101",
        officer: "Er. S. Muruganathan (CMWSSB)",
        date: "2026-09-27 14:15",
        status: "In Progress",
        message: "Emergency water tankers (2 vehicles) have been dispatched to Kasturba Nagar 4th Cross as temporary relief while the 150mm main valve is replaced."
      }
    ]
  },
  {
    id: "CIV-2026-00119",
    title: "Heavy sewage overflow overflowing onto main market road",
    originalText: "மெயின் ரோட்டில் பாதாள சாக்கடை அடைப்பு ஏற்பட்டு கழிவுநீர் சாலையில் பெருக்கெடுத்து ஓடுகிறது. துர்நாற்றம் தாங்க முடியவில்லை, கடைக்காரர்கள் மிகவும் பாதிக்கப்பட்டுள்ளனர்.",
    originalTextEn: "Underground sewer line is choked on Main Road and wastewater is spilling heavily onto the street. Foul odor and serious health hazard for shopkeepers.",
    language: "Tamil",
    category: "Drainage & Sanitation",
    subcategory: "Sewage Overflow",
    severity: "Critical",
    status: "Assigned",
    department: "Stormwater Drainage",
    location: {
      address: "Gandhi Bazaar Main Road, T. Nagar",
      ward: "Ward 8",
      district: "Chennai Central",
      lat: 13.0418,
      lng: 80.2341
    },
    submittedBy: "K. Selvam",
    userId: "USR-CTZ-0412",
    submittedAt: "2026-09-25T16:20:00Z",
    updatedAt: "2026-09-26T10:00:00Z",
    aiAnalysis: {
      model: "CivicAI Neural Engine v3.4",
      confidence: 0.98,
      detectedLanguage: "Tamil (தமிழ்)",
      keyEntities: ["sewer choking", "public health risk", "market area"],
      urgencyScore: 94,
      summary: "Severe sewage overflow on commercial road creating acute sanitation hazard and business disruption.",
      suggestedDepartment: "Stormwater Drainage",
      detectedSeverity: "Critical",
      citizenConfirmed: true,
      confirmedAt: "2026-09-25T16:22:00Z"
    },
    images: [
      "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80"
    ],
    timeline: [
      {
        stage: "Reported",
        timestamp: "2026-09-25T16:20:00Z",
        actor: "K. Selvam (Citizen)",
        note: "Reported with photo evidence."
      },
      {
        stage: "Received",
        timestamp: "2026-09-25T16:21:40Z",
        actor: "CivicAI System",
        note: "Auto-classified Critical Severity due to commercial market density."
      },
      {
        stage: "Under Review",
        timestamp: "2026-09-25T18:00:00Z",
        actor: "Sanitation Duty Officer",
        note: "Flagged as recurring hotspot issue in Ward 8."
      },
      {
        stage: "Assigned",
        timestamp: "2026-09-26T10:00:00Z",
        actor: "Zonal Drainage Div.",
        note: "Super Sucker desilting machine (TN-01-G-9921) scheduled for night shift."
      }
    ],
    authorityUpdates: [
      {
        id: "UPD-102",
        officer: "V. Swaminathan (Sanitation Inspector)",
        date: "2026-09-26 10:00",
        status: "Assigned",
        message: "High velocity suction truck assigned for 22:00 PM clearance to minimize market traffic disturbance."
      }
    ]
  },
  {
    id: "CIV-2026-00098",
    title: "Dangerous deep crater pothole near Metro Pillar 142",
    originalText: "Deep pothole formed on arterial ring road near Metro Pillar 142. Two two-wheelers skidded yesterday. Immediate asphalt filling needed before someone gets fatally hurt.",
    originalTextEn: "Deep pothole formed on arterial ring road near Metro Pillar 142. Two two-wheelers skidded yesterday. Immediate asphalt filling needed before someone gets fatally hurt.",
    language: "English",
    category: "Roads & Traffic",
    subcategory: "Potholes",
    severity: "High",
    status: "Resolved",
    department: "Roads & Infrastructure",
    location: {
      address: "100 Feet Ring Road, Near Pillar 142, Velachery",
      ward: "Ward 21",
      district: "Chennai South",
      lat: 12.9790,
      lng: 80.2212
    },
    submittedBy: "Priyanka Roy",
    userId: "USR-CTZ-0922",
    submittedAt: "2026-09-20T08:15:00Z",
    updatedAt: "2026-09-23T17:30:00Z",
    aiAnalysis: {
      model: "CivicAI Neural Engine v3.4",
      confidence: 0.95,
      detectedLanguage: "English",
      keyEntities: ["deep crater", "two-wheeler accident risk", "arterial road"],
      urgencyScore: 89,
      summary: "Arterial road surface crater causing active vehicular accidents; prioritized for rapid cold-mix asphalt patch.",
      suggestedDepartment: "Roads & Infrastructure",
      detectedSeverity: "High",
      citizenConfirmed: true,
      confirmedAt: "2026-09-20T08:16:30Z"
    },
    images: [
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
    ],
    timeline: [
      { stage: "Reported", timestamp: "2026-09-20T08:15:00Z", actor: "Priyanka Roy", note: "Submitted via mobile app." },
      { stage: "Received", timestamp: "2026-09-20T08:16:00Z", actor: "System", note: "Categorized Roads & Infrastructure." },
      { stage: "Under Review", timestamp: "2026-09-20T11:00:00Z", actor: "Highways Dept.", note: "Verified road jurisdiction." },
      { stage: "Assigned", timestamp: "2026-09-21T09:00:00Z", actor: "Pothole Rapid Response", note: "Van #4 allocated." },
      { stage: "In Progress", timestamp: "2026-09-22T14:00:00Z", actor: "Field Crew", note: "Base stone packing and cold mix bituminization completed." },
      { stage: "Resolved", timestamp: "2026-09-23T17:30:00Z", actor: "Road Safety Inspector", note: "Road surface leveled and friction tested. Closed." }
    ],
    authorityUpdates: [
      {
        id: "UPD-103",
        officer: "M. Jayakumar (Roads AE)",
        date: "2026-09-23 17:30",
        status: "Resolved",
        message: "Patch repair completed and barricades cleared. Citizen feedback rating received: 5/5 stars."
      }
    ]
  },
  {
    id: "CIV-2026-00084",
    title: "Streetlights dark for 4 consecutive nights on 4th Cross",
    originalText: "Streetlights on 4th Cross Road have been flickering and completely off for the last 4 nights, causing extreme safety concerns for women and senior citizens walking after sunset.",
    originalTextEn: "Streetlights on 4th Cross Road have been flickering and completely off for the last 4 nights, causing extreme safety concerns for women and senior citizens walking after sunset.",
    language: "English",
    category: "Street Lighting",
    subcategory: "Streetlight Not Working",
    severity: "Medium",
    status: "Under Review",
    department: "Electrical & Street Lighting",
    location: {
      address: "4th Cross Road, Anna Nagar West",
      ward: "Ward 4",
      district: "Chennai North",
      lat: 13.0850,
      lng: 80.2101
    },
    submittedBy: "Joshua Sheshan",
    userId: "USR-CTZ-0891",
    submittedAt: "2026-09-26T20:10:00Z",
    updatedAt: "2026-09-27T09:00:00Z",
    aiAnalysis: {
      model: "CivicAI Neural Engine v3.4",
      confidence: 0.94,
      detectedLanguage: "English",
      keyEntities: ["4 nights dark", "safety vulnerability", "feeder box issue"],
      urgencyScore: 68,
      summary: "Multi-fixture illumination failure along residential stretch posing pedestrian safety vulnerability.",
      suggestedDepartment: "Electrical & Street Lighting",
      detectedSeverity: "Medium",
      citizenConfirmed: true,
      confirmedAt: "2026-09-26T20:12:00Z"
    },
    images: [
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
    ],
    timeline: [
      { stage: "Reported", timestamp: "2026-09-26T20:10:00Z", actor: "Joshua Sheshan", note: "Reported via web portal." },
      { stage: "Received", timestamp: "2026-09-26T20:11:00Z", actor: "System", note: "Auto-forwarded to Zonal Electrical Wing." },
      { stage: "Under Review", timestamp: "2026-09-27T09:00:00Z", actor: "Linesman In-Charge", note: "Checking feeder box relay timer switch." }
    ],
    authorityUpdates: [
      {
        id: "UPD-104",
        officer: "P. Loganathan (Electrical JE)",
        date: "2026-09-27 09:00",
        status: "Under Review",
        message: "Automated timer switch failure suspected at Pillar 12. Inspection scheduled today at 18:00 PM."
      }
    ]
  },
  {
    id: "CIV-2026-00072",
    title: "Severe garbage accumulation near school entrance",
    originalText: "பள்ளி வாசல் அருகே குப்பை மலைபோல் தேங்கிக் கிடக்கிறது. துர்நாற்றம் வீசுகிறது, நாய்கள் தொல்லை அதிகமாக உள்ளது. குழந்தைகள் பள்ளிக்கு செல்ல பயப்படுகின்றனர்.",
    originalTextEn: "Massive pile of uncleared garbage right beside primary school gate. Stench is unbearable and stray dog pack is roaming. Children scared to enter school.",
    language: "Tamil",
    category: "Solid Waste Management",
    subcategory: "Garbage Accumulation",
    severity: "High",
    status: "Received",
    department: "Solid Waste Management",
    location: {
      address: "Near Govt Primary School, Gandhi Street, Perambur",
      ward: "Ward 15",
      district: "Chennai North",
      lat: 13.1143,
      lng: 80.2329
    },
    submittedBy: "A. Revathi",
    userId: "USR-CTZ-0331",
    submittedAt: "2026-09-28T07:45:00Z",
    updatedAt: "2026-09-28T07:50:00Z",
    aiAnalysis: {
      model: "CivicAI Neural Engine v3.4",
      confidence: 0.97,
      detectedLanguage: "Tamil (தமிழ்)",
      keyEntities: ["school zone waste", "stray animal hazard", "sanitation risk"],
      urgencyScore: 84,
      summary: "Accumulated uncollected waste near school premises triggering public health and child safety hazards.",
      suggestedDepartment: "Solid Waste Management",
      detectedSeverity: "High",
      citizenConfirmed: true,
      confirmedAt: "2026-09-28T07:47:00Z"
    },
    images: [
      "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80"
    ],
    timeline: [
      { stage: "Reported", timestamp: "2026-09-28T07:45:00Z", actor: "A. Revathi", note: "Reported with geo-tagged photograph." },
      { stage: "Received", timestamp: "2026-09-28T07:50:00Z", actor: "CivicAI System", note: "High priority tag added due to School Zone proximity." }
    ],
    authorityUpdates: []
  },
  {
    id: "CIV-2026-00055",
    title: "Broken swings and hazardous exposed iron in children's park",
    originalText: "Public park children's swing frame has broken down with jagged rusty metal edges exposed. Toddlers might get injured. Please repair urgently.",
    originalTextEn: "Public park children's swing frame has broken down with jagged rusty metal edges exposed. Toddlers might get injured. Please repair urgently.",
    language: "English",
    category: "Public Health & Parks",
    subcategory: "Damaged Play Equipment",
    severity: "Medium",
    status: "Reported",
    department: "Urban Forestry & Parks",
    location: {
      address: "Sector 5 Community Park, K.K. Nagar",
      ward: "Ward 18",
      district: "Chennai South",
      lat: 13.0402,
      lng: 80.1985
    },
    submittedBy: "Joshua Sheshan",
    userId: "USR-CTZ-0891",
    submittedAt: "2026-09-28T11:20:00Z",
    updatedAt: "2026-09-28T11:20:00Z",
    aiAnalysis: {
      model: "CivicAI Neural Engine v3.4",
      confidence: 0.93,
      detectedLanguage: "English",
      keyEntities: ["playground hazard", "rusty iron", "child injury risk"],
      urgencyScore: 62,
      summary: "Damaged park play apparatus with exposed metal edges requiring replacement to ensure child safety.",
      suggestedDepartment: "Urban Forestry & Parks",
      detectedSeverity: "Medium",
      citizenConfirmed: true,
      confirmedAt: "2026-09-28T11:21:45Z"
    },
    images: [
      "https://images.unsplash.com/photo-1575783970733-1aaedde1db74?auto=format&fit=crop&w=800&q=80"
    ],
    timeline: [
      { stage: "Reported", timestamp: "2026-09-28T11:20:00Z", actor: "Joshua Sheshan", note: "Initial submission received." }
    ],
    authorityUpdates: []
  },
  {
    id: "CIV-2026-00041",
    title: "Private construction debris dumped into stormwater canal",
    originalText: "மழைநீர் வடிகாலில் தனியார் கட்டிடக் கழிவுகளை கொட்டி அடைத்து விட்டார்கள். மழை வந்தால் தண்ணீர் தேங்கி ஊரே வெள்ளக்காடாகிவிடும்.",
    originalTextEn: "Private contractors dumped construction debris into the stormwater canal. Next heavy rain will cause complete street flooding.",
    language: "Tamil",
    category: "Drainage & Sanitation",
    subcategory: "Stormwater Overflow",
    severity: "High",
    status: "In Progress",
    department: "Stormwater Drainage",
    location: {
      address: "Canal Bank Road, Mandaveli",
      ward: "Ward 14",
      district: "Chennai Central",
      lat: 13.0270,
      lng: 80.2630
    },
    submittedBy: "G. Venkatesan",
    userId: "USR-CTZ-0210",
    submittedAt: "2026-09-22T14:10:00Z",
    updatedAt: "2026-09-27T16:00:00Z",
    aiAnalysis: {
      model: "CivicAI Neural Engine v3.4",
      confidence: 0.97,
      detectedLanguage: "Tamil (தமிழ்)",
      keyEntities: ["canal obstruction", "flood risk", "debris dumping"],
      urgencyScore: 86,
      summary: "Illegal debris disposal in stormwater drainage trunk channel creating acute localized flood danger.",
      suggestedDepartment: "Stormwater Drainage",
      detectedSeverity: "High",
      citizenConfirmed: true,
      confirmedAt: "2026-09-22T14:12:00Z"
    },
    images: [
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80"
    ],
    timeline: [
      { stage: "Reported", timestamp: "2026-09-22T14:10:00Z", actor: "G. Venkatesan", note: "Reported with photos." },
      { stage: "Received", timestamp: "2026-09-22T14:15:00Z", actor: "System", note: "Assigned high flood warning flag." },
      { stage: "Under Review", timestamp: "2026-09-23T10:30:00Z", actor: "Enforcement Officer", note: "Notice issued to nearby building site." },
      { stage: "Assigned", timestamp: "2026-09-25T11:00:00Z", actor: "Drainage JCB Unit", note: "Excavator team mobilized." },
      { stage: "In Progress", timestamp: "2026-09-27T16:00:00Z", actor: "Zonal Crew", note: "Clearing 12 truckloads of rubble." }
    ],
    authorityUpdates: [
      {
        id: "UPD-105",
        officer: "K. Balamurugan (Enforcement Officer)",
        date: "2026-09-27 16:00",
        status: "In Progress",
        message: "Notice served with ₹25,000 fine to infringing developer; 75% canal bottleneck cleared."
      }
    ]
  },
  {
    id: "CIV-2026-00131",
    title: "Severe drinking water outage for 4 consecutive days",
    originalText: "எங்கள் தெருவில் கடந்த நான்கு நாட்களாக குடிநீர் விநியோகம் முற்றிலும் நின்றுவிட்டது. லாரிகள் கூட வரவில்லை.",
    originalTextEn: "Drinking water supply has completely ceased for 4 consecutive days in our street. Even supply tankers have not arrived.",
    language: "Tamil",
    category: "Water Supply",
    subcategory: "Drinking Water",
    severity: "High",
    status: "Under Review",
    department: "Water Supply & Sewerage (CMWSSB)",
    location: {
      address: "Model School Road, Thousand Lights",
      ward: "Ward 111",
      district: "Chennai Central",
      lat: 13.0609,
      lng: 80.2567
    },
    submittedBy: "M. Abdul Kareem",
    userId: "USR-CTZ-0512",
    submittedAt: "2026-09-27T08:30:00Z",
    updatedAt: "2026-09-27T10:00:00Z",
    aiAnalysis: {
      model: "CivicAI Neural Engine v3.4",
      confidence: 0.96,
      detectedLanguage: "Tamil (தமிழ்)",
      keyEntities: ["water outage 4 days", "tanker needed", "Ward 111"],
      urgencyScore: 89,
      summary: "Total municipal drinking water interruption affecting residential zone for 4 days.",
      suggestedDepartment: "Water Supply & Sewerage (CMWSSB)",
      detectedSeverity: "High",
      citizenConfirmed: true,
      confirmedAt: "2026-09-27T08:32:00Z"
    },
    images: [],
    timeline: [
      { stage: "Reported", timestamp: "2026-09-27T08:30:00Z", actor: "M. Abdul Kareem", note: "Reported via mobile." }
    ],
    authorityUpdates: []
  },
  {
    id: "CIV-2026-00132",
    title: "Low pressure and contaminated water from domestic tap connections",
    originalText: "Water coming from taps has a dirty brownish tint and pressure is so low it does not reach the ground floor storage sumps.",
    originalTextEn: "Water coming from taps has a dirty brownish tint and pressure is so low it does not reach the ground floor storage sumps.",
    language: "English",
    category: "Water Supply",
    subcategory: "Low Pressure",
    severity: "High",
    status: "Received",
    department: "Water Supply & Sewerage (CMWSSB)",
    location: {
      address: "Greams Road 2nd Lane, Thousand Lights",
      ward: "Ward 111",
      district: "Chennai Central",
      lat: 13.0605,
      lng: 80.2565
    },
    submittedBy: "Deepa Raman",
    userId: "USR-CTZ-0774",
    submittedAt: "2026-09-28T09:15:00Z",
    updatedAt: "2026-09-28T09:20:00Z",
    aiAnalysis: {
      model: "CivicAI Neural Engine v3.4",
      confidence: 0.95,
      detectedLanguage: "English",
      keyEntities: ["brownish water", "low pressure", "storage sump"],
      urgencyScore: 86,
      summary: "Contaminated water supply with acute low pressure affecting apartment residents.",
      suggestedDepartment: "Water Supply & Sewerage (CMWSSB)",
      detectedSeverity: "High",
      citizenConfirmed: true,
      confirmedAt: "2026-09-28T09:16:30Z"
    },
    images: [],
    timeline: [
      { stage: "Reported", timestamp: "2026-09-28T09:15:00Z", actor: "Deepa Raman", note: "Reported via portal." }
    ],
    authorityUpdates: []
  },
  {
    id: "CIV-2026-00133",
    title: "CMWSSB main distribution line joint fracture and leakage",
    originalText: "Clean drinking water is bursting out of the road surface at the lane junction. Gallons of water wasted every hour.",
    originalTextEn: "Clean drinking water is bursting out of the road surface at the lane junction. Gallons of water wasted every hour.",
    language: "English",
    category: "Water Supply",
    subcategory: "Pipeline Leakage",
    severity: "Medium",
    status: "Assigned",
    department: "Water Supply & Sewerage (CMWSSB)",
    location: {
      address: "Aziz Mulk 3rd Street, Thousand Lights",
      ward: "Ward 111",
      district: "Chennai Central",
      lat: 13.0608,
      lng: 80.2566
    },
    submittedBy: "S. K. Nathan",
    userId: "USR-CTZ-0891",
    submittedAt: "2026-09-28T14:40:00Z",
    updatedAt: "2026-09-28T16:00:00Z",
    aiAnalysis: {
      model: "CivicAI Neural Engine v3.4",
      confidence: 0.97,
      detectedLanguage: "English",
      keyEntities: ["pipe burst", "drinking water wastage", "road junction"],
      urgencyScore: 78,
      summary: "Pipeline joint fracture spilling potable water onto roadway.",
      suggestedDepartment: "Water Supply & Sewerage (CMWSSB)",
      detectedSeverity: "Medium",
      citizenConfirmed: true,
      confirmedAt: "2026-09-28T14:42:00Z"
    },
    images: [],
    timeline: [
      { stage: "Reported", timestamp: "2026-09-28T14:40:00Z", actor: "S. K. Nathan", note: "Reported via voice assistant." }
    ],
    authorityUpdates: []
  },
  {
    id: "CIV-2026-00134",
    title: "Complete lack of water tanker delivery to tenement quarters",
    originalText: "குடிநீர் வாரிய லாரி வரவில்லை. குழந்தைகள் மற்றும் முதியவர்கள் குடிநீரின்றி தவிக்கின்றனர். உடனடியாக லாரி அனுப்பவும்.",
    originalTextEn: "Water supply board tanker has not arrived. Children and elderly are suffering without drinking water. Please dispatch immediately.",
    language: "Tamil",
    category: "Water Supply",
    subcategory: "Water Tanker Delay",
    severity: "High",
    status: "Reported",
    department: "Water Supply & Sewerage (CMWSSB)",
    location: {
      address: "Peters Road Cross, Thousand Lights",
      ward: "Ward 111",
      district: "Chennai Central",
      lat: 13.06073,
      lng: 80.25673
    },
    submittedBy: "Joshua Sheshan",
    userId: "USR-CTZ-0891",
    submittedAt: "2026-09-29T08:10:00Z",
    updatedAt: "2026-09-29T08:15:00Z",
    aiAnalysis: {
      model: "CivicAI Neural Engine v3.4",
      confidence: 0.98,
      detectedLanguage: "Tamil (தமிழ்)",
      keyEntities: ["emergency tanker", "vulnerable residents", "Ward 111"],
      urgencyScore: 91,
      summary: "Emergency tanker supply required immediately due to persistent pipe failure.",
      suggestedDepartment: "Water Supply & Sewerage (CMWSSB)",
      detectedSeverity: "High",
      citizenConfirmed: true,
      confirmedAt: "2026-09-29T08:11:30Z"
    },
    images: [],
    timeline: [
      { stage: "Reported", timestamp: "2026-09-29T08:10:00Z", actor: "Joshua Sheshan", note: "Urgent ticket lodged via mobile." }
    ],
    authorityUpdates: []
  }
];

export const MOCK_HOTSPOTS = [
  {
    id: "HSP-01",
    area: "Ward 12",
    locality: "Kasturba Nagar & Adyar",
    category: "Water Supply",
    complaintCount: 42,
    recentActivity: "High activity (+18 in 7d)",
    severity: "High",
    hotspotScore: 92,
    trend: "+24% this week",
    coordinates: { lat: 13.0067, lng: 80.2571 },
    rootCauseAI: "Feeder valve pressure drop on Sub-grid 3 line",
    status: "Active Investigation",
    affectedPopulationEst: "18,500 residents"
  },
  {
    id: "HSP-02",
    area: "Ward 8",
    locality: "T. Nagar Commercial Hub",
    category: "Drainage & Sanitation",
    complaintCount: 31,
    recentActivity: "Critical activity (+14 in 4d)",
    severity: "Critical",
    hotspotScore: 88,
    trend: "+38% this week",
    coordinates: { lat: 13.0418, lng: 80.2341 },
    rootCauseAI: "Grease and commercial waste obstruction in underground trunk line",
    status: "Action Assigned",
    affectedPopulationEst: "35,000 daily visitors & shopkeepers"
  },
  {
    id: "HSP-03",
    area: "Ward 21",
    locality: "Velachery Ring Road Corridor",
    category: "Roads & Traffic",
    complaintCount: 28,
    recentActivity: "High activity (+9 in 5d)",
    severity: "High",
    hotspotScore: 85,
    trend: "+15% this week",
    coordinates: { lat: 12.9790, lng: 80.2212 },
    rootCauseAI: "Subsurface water pipe leak causing road settlement & bitumen erosion",
    status: "Work in Progress",
    affectedPopulationEst: "65,000 daily commuters"
  },
  {
    id: "HSP-04",
    area: "Ward 15",
    locality: "Perambur North Zone",
    category: "Solid Waste Management",
    complaintCount: 24,
    recentActivity: "Moderate activity (+7 in 6d)",
    severity: "Medium",
    hotspotScore: 74,
    trend: "+8% this week",
    coordinates: { lat: 13.1143, lng: 80.2329 },
    rootCauseAI: "Truck route timing clash with morning school opening hours",
    status: "Rerouting Planned",
    affectedPopulationEst: "12,000 residents"
  },
  {
    id: "HSP-05",
    area: "Ward 4",
    locality: "Anna Nagar West",
    category: "Street Lighting",
    complaintCount: 19,
    recentActivity: "Moderate activity (+5 in 3d)",
    severity: "Medium",
    hotspotScore: 68,
    trend: "Stable",
    coordinates: { lat: 13.0850, lng: 80.2101 },
    rootCauseAI: "Feeder Pillar #6 transformer relay contactor malfunction",
    status: "Under Review",
    affectedPopulationEst: "8,500 residents"
  }
];

export const MOCK_AI_INSIGHTS = [
  {
    id: "INS-001",
    title: "Recurring Water Supply Issue",
    area: "Ward 12",
    category: "Water Supply",
    evidence: "42 complaints in 14 days.",
    trend: "Increasing",
    trendDirection: "up",
    severity: "High",
    aiSummary: "Multiple citizen complaints indicate a recurring water supply issue concentrated around Ward 12. Pressure telemetry verifies an anomaly in the secondary pipeline grid.",
    suggestedAction: "Review the water supply infrastructure and verify the affected distribution area. Dispatch joint leak-detection team.",
    decisionSupportNote: "AI-generated decision support. Does not represent official government decisions. Officer verification required prior to capital dispatch.",
    confidence: "94.6%",
    clustersDetected: 3,
    firstDetected: "2026-09-14"
  },
  {
    id: "INS-002",
    title: "Post-Monsoon Drainage Choke Surge",
    area: "Ward 8",
    category: "Drainage & Sanitation",
    evidence: "31 complaints in 7 days across a 400-meter radius.",
    trend: "High Surge (+38%)",
    trendDirection: "up",
    severity: "Critical",
    aiSummary: "Spatio-temporal clustering reveals repeated sewage backups along commercial corridors. High fat-oil-grease content reported from eateries entering storm drains.",
    suggestedAction: "Mobilize high-capacity desilting super suckers immediately; issue commercial grease-trap compliance notifications to restaurants.",
    decisionSupportNote: "AI-generated decision support. Generated from multi-lingual citizen reports and historical drainage maps.",
    confidence: "97.1%",
    clustersDetected: 4,
    firstDetected: "2026-09-21"
  },
  {
    id: "INS-003",
    title: "Pothole Cluster on High-Speed Corridor",
    area: "Ward 21",
    category: "Roads & Traffic",
    evidence: "28 complaints along a 1.8km stretch in 10 days.",
    trend: "Stabilizing",
    trendDirection: "neutral",
    severity: "High",
    aiSummary: "Clustering indicates recurring asphalt degradation caused by poor subsurface storm runoff drainage near metro construction piers.",
    suggestedAction: "Execute cold-mix asphalt patch repair and inspect stormwater inlet gratings to prevent continuous water pooling.",
    decisionSupportNote: "AI-generated decision support. Corroborated with citizen imagery and spatial telemetry.",
    confidence: "92.8%",
    clustersDetected: 2,
    firstDetected: "2026-09-18"
  },
  {
    id: "INS-004",
    title: "Co-occurring Streetlight Circuit Tripping",
    area: "Ward 4",
    category: "Street Lighting",
    evidence: "19 complaints along 3 adjacent avenues over 5 days.",
    trend: "Periodic",
    trendDirection: "neutral",
    severity: "Medium",
    aiSummary: "Complaints coincide precisely between 18:30 and 22:00. Circuit analysis points to overloaded phase distributor box at Pillar 6.",
    suggestedAction: "Re-balance lighting phase load across secondary transformer and replace heat-sensitive 63A breaker switch.",
    decisionSupportNote: "AI-generated decision support. Cross-referenced with local electrical maintenance logs.",
    confidence: "95.3%",
    clustersDetected: 1,
    firstDetected: "2026-09-23"
  }
];

export const MOCK_ANALYTICS = {
  kpis: {
    totalComplaints: 1248,
    openComplaints: 215,
    inProgress: 342,
    resolved: 641,
    rejected: 50,
    highSeverity: 87,
    activeHotspots: 5,
    avgResolutionDays: 3.4,
    citizenSatisfaction: 89.2,
    aiTriageAccuracy: 96.4
  },
  complaintsByCategory: [
    { name: "Water Supply", count: 340, fill: "#2563eb" },
    { name: "Drainage", count: 280, fill: "#06b6d4" },
    { name: "Roads & Traffic", count: 245, fill: "#f59e0b" },
    { name: "Solid Waste", count: 185, fill: "#10b981" },
    { name: "Street Lighting", count: 120, fill: "#8b5cf6" },
    { name: "Public Health", count: 78, fill: "#ec4899" }
  ],
  complaintsOverTime: [
    { date: "Sep 01", complaints: 28, resolved: 22 },
    { date: "Sep 05", complaints: 35, resolved: 30 },
    { date: "Sep 10", complaints: 42, resolved: 36 },
    { date: "Sep 15", complaints: 56, resolved: 48 },
    { date: "Sep 20", complaints: 64, resolved: 52 },
    { date: "Sep 25", complaints: 78, resolved: 65 },
    { date: "Sep 28", complaints: 82, resolved: 71 }
  ],
  statusDistribution: [
    { name: "Reported", value: 68, color: "#64748b" },
    { name: "Received", value: 52, color: "#0284c7" },
    { name: "Under Review", value: 95, color: "#d97706" },
    { name: "Assigned", value: 110, color: "#7c3aed" },
    { name: "In Progress", value: 232, color: "#2563eb" },
    { name: "Resolved", value: 641, color: "#059669" },
    { name: "Rejected", value: 50, color: "#e11d48" }
  ],
  severityDistribution: [
    { name: "Low", value: 310, color: "#64748b" },
    { name: "Medium", value: 485, color: "#f59e0b" },
    { name: "High", value: 340, color: "#ea580c" },
    { name: "Critical", value: 113, color: "#dc2626" }
  ],
  wardPerformance: [
    { ward: "Ward 12", total: 142, resolved: 98, rate: 69 },
    { ward: "Ward 8", total: 165, resolved: 104, rate: 63 },
    { ward: "Ward 21", total: 118, resolved: 89, rate: 75 },
    { ward: "Ward 15", total: 95, resolved: 74, rate: 78 },
    { ward: "Ward 4", total: 84, resolved: 68, rate: 81 },
    { ward: "Ward 18", total: 62, resolved: 54, rate: 87 }
  ]
};

export const MOCK_COMMUNITY_ISSUES = [
  {
    id: "CI-01",
    title: "Drinking water supply schedule disrupted in Kasturba Nagar",
    category: "Water Supply",
    ward: "Ward 12",
    upvotes: 46,
    status: "In Progress",
    commentCount: 14,
    reportedAgo: "3 days ago"
  },
  {
    id: "CI-02",
    title: "Stray cattle causing night traffic near Velachery junction",
    category: "Roads & Traffic",
    ward: "Ward 21",
    upvotes: 38,
    status: "Under Review",
    commentCount: 9,
    reportedAgo: "1 day ago"
  },
  {
    id: "CI-03",
    title: "Mosquito fogging vehicle needed in South Sector 4",
    category: "Public Health & Parks",
    ward: "Ward 12",
    upvotes: 29,
    status: "Received",
    commentCount: 6,
    reportedAgo: "5 hours ago"
  }
];

export const MOCK_SAMPLE_PRESETS = [
  {
    label: "Water Scarcity (Tamil - Adyar)",
    text: "எங்கள் பகுதியில் ஐந்து நாட்களாக குடிநீர் வரவில்லை. பொதுமக்கள் மிகவும் சிரமப்படுகின்றனர். தயவுசெய்து உடனடி நடவடிக்கை எடுக்கவும்.",
    category: "Water Supply",
    subcategory: "Drinking Water",
    severity: "High",
    department: "Water Supply & Sewerage (CMWSSB)",
    language: "Tamil",
    location: "Cross Street 4, Kasturba Nagar, Adyar, Ward 12",
    summary: "Drinking water has not been available in the reported area for approximately five days, impacting residential households."
  },
  {
    label: "Sewerage Overflow (Tamil - T. Nagar)",
    text: "மெயின் ரோட்டில் பாதாள சாக்கடை அடைப்பு ஏற்பட்டு கழிவுநீர் சாலையில் பெருக்கெடுத்து ஓடுகிறது. துர்நாற்றம் தாங்க முடியவில்லை.",
    category: "Drainage & Sanitation",
    subcategory: "Sewage Overflow",
    severity: "Critical",
    department: "Stormwater Drainage",
    language: "Tamil",
    location: "Gandhi Bazaar Main Road, Ward 8",
    summary: "Severe sewage overflow on commercial road creating acute sanitation hazard and business disruption."
  },
  {
    label: "Dangerous Pothole (English - Velachery)",
    text: "Deep pothole formed on arterial ring road near Metro Pillar 142. Two two-wheelers skidded yesterday. Immediate asphalt filling needed.",
    category: "Roads & Traffic",
    subcategory: "Potholes",
    severity: "High",
    department: "Roads & Infrastructure",
    language: "English",
    location: "100 Feet Ring Road, Near Pillar 142, Velachery, Ward 21",
    summary: "Arterial road surface crater causing active vehicular accidents; prioritized for rapid cold-mix asphalt patch."
  },
  {
    label: "Dark Streetlights (English - Anna Nagar)",
    text: "Streetlights on 4th Cross Road have been flickering and completely off for the last 4 nights, causing extreme safety concerns for pedestrians.",
    category: "Street Lighting",
    subcategory: "Streetlight Not Working",
    severity: "Medium",
    department: "Electrical & Street Lighting",
    language: "English",
    location: "4th Cross Road, Anna Nagar West, Ward 4",
    summary: "Multi-fixture illumination failure along residential stretch posing pedestrian safety vulnerability."
  }
];
