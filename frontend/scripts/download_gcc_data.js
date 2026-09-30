// Script to fetch official Greater Chennai Corporation health centres from OpenCity CKAN dataset e08b7485-40ab-4401-861f-f790ed8e5328
// and convert to verified GeoJSON and JSON for CivicAI.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'src', 'data', 'publicData');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const UPHC_KML_URL = 'https://data.opencity.in/dataset/e08b7485-40ab-4401-861f-f790ed8e5328/resource/5a81427f-0aa1-4270-8df4-5d4cef250912/download/a33b403b-f341-4214-8613-88e2ec227359.kml';
const UCHC_KML_URL = 'https://data.opencity.in/dataset/e08b7485-40ab-4401-861f-f790ed8e5328/resource/cd4effee-997f-4fe0-b376-8801080c6962/download/a604ea86-6bed-45ab-89cf-074fb5a59bfc.kml';

function extractField(xmlStr, fieldName) {
  const match = xmlStr.match(new RegExp(`<SimpleData name="${fieldName}">([\\s\\S]*?)<\\/SimpleData>`));
  return match ? match[1].trim() : '';
}

function parseKmlFacilities(kmlText, defaultType) {
  const items = [];
  const placemarks = kmlText.split('<Placemark>').slice(1);

  for (const pm of placemarks) {
    const coordMatch = pm.match(/<coordinates>\s*([\d.-]+)\s*,\s*([\d.-]+)/);
    if (!coordMatch) continue;

    const lng = parseFloat(coordMatch[1]);
    const lat = parseFloat(coordMatch[2]);

    const rawAddress = extractField(pm, 'ADDRESS') || extractField(pm, 'NAME') || '';
    const parts = rawAddress.split(',');
    let facilityName = parts[0].trim();
    let address = parts.slice(1).join(',').trim() || rawAddress;

    const rawType = extractField(pm, 'TYPE') || defaultType;
    const normType = rawType.toUpperCase().includes('COMMUNITY') || rawType.toUpperCase().includes('UCHC')
      ? 'UCHC'
      : 'UPHC';

    // If the facility name was just a door number like "11", use the street name
    if (/^\d+$/.test(facilityName) && parts.length > 1) {
      facilityName = `${normType} - ${parts[1].trim()}`;
    }

    const code = extractField(pm, 'FINAL_CODE') || ('FAC-' + extractField(pm, 'OBJECTID'));
    const division = extractField(pm, 'DIVISION');
    const zone = extractField(pm, 'ZONE');
    const dept = extractField(pm, 'DEPARTMENT') || 'HEALTH-MSD';

    items.push({
      id: code,
      facilityName: facilityName || `${normType} (Ward ${division})`,
      facilityType: normType,
      address: address,
      fullAddress: rawAddress,
      ward: division ? parseInt(division, 10) : null,
      zone: zone ? parseInt(zone, 10) : null,
      department: dept,
      latitude: lat,
      longitude: lng
    });
  }
  return items;
}

async function run() {
  console.log('Downloading real GCC Health Centres dataset from OpenCity...');
  const [uphcRes, uchcRes] = await Promise.all([
    fetch(UPHC_KML_URL),
    fetch(UCHC_KML_URL)
  ]);

  if (!uphcRes.ok) throw new Error(`Failed to download UPHC KML: status ${uphcRes.status}`);
  if (!uchcRes.ok) throw new Error(`Failed to download UCHC KML: status ${uchcRes.status}`);

  const uphcText = await uphcRes.text();
  const uchcText = await uchcRes.text();

  const uphcs = parseKmlFacilities(uphcText, 'UPHC');
  const uchcs = parseKmlFacilities(uchcText, 'UCHC');

  const allFacilities = [...uphcs, ...uchcs];
  console.log(`Successfully parsed ${uphcs.length} UPHCs and ${uchcs.length} UCHCs. Total: ${allFacilities.length}`);

  // Create standard GeoJSON
  const geojson = {
    type: 'FeatureCollection',
    metadata: {
      source: 'Greater Chennai Corporation (GCC) Health Centres',
      datasetUrl: 'https://data.opencity.in/dataset/chennai-health-centres',
      officialOrganization: 'Greater Chennai Corporation / Public Health Department',
      retrievedAt: new Date().toISOString(),
      facilityCount: allFacilities.length
    },
    features: allFacilities.map(f => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [f.longitude, f.latitude]
      },
      properties: {
        id: f.id,
        facilityName: f.facilityName,
        facilityType: f.facilityType,
        address: f.address,
        fullAddress: f.fullAddress,
        ward: f.ward,
        zone: f.zone,
        department: f.department
      }
    }))
  };

  const jsonPath = path.join(outputDir, 'gccHealthCentres.json');
  const geojsonPath = path.join(outputDir, 'gccHealthCentres.geojson');

  fs.writeFileSync(jsonPath, JSON.stringify(allFacilities, null, 2), 'utf8');
  fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2), 'utf8');

  console.log(`Saved JSON: ${jsonPath} (${(fs.statSync(jsonPath).size / 1024).toFixed(1)} KB)`);
  console.log(`Saved GeoJSON: ${geojsonPath} (${(fs.statSync(geojsonPath).size / 1024).toFixed(1)} KB)`);
}

run().catch(err => {
  console.error('Download failed:', err);
  process.exit(1);
});
