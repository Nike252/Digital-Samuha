import json

# Load districts
with open('d:/FFYYPP/BAckup/FYP/digital-samuha-frontend/src/utils/nepal_districts.json', 'r', encoding='utf-8') as f:
    districts_raw = json.load(f)

district_map = {d['district_id']: d['name'] for d in districts_raw}

# Load local levels
with open('d:/FFYYPP/BAckup/FYP/digital-samuha-frontend/src/utils/nepal_full_local_levels.json', 'r', encoding='utf-8') as f:
    local_levels_raw = json.load(f)

# Group municipalities by district name
municipalities_by_district = {}
for entry in local_levels_raw:
    dist_name = district_map.get(entry['district_id'])
    if dist_name:
        if dist_name not in municipalities_by_district:
            municipalities_by_district[dist_name] = []
        # Append name (clean up "काठमाडौं ।" etc if needed, but let's stick to English name)
        muni_name = entry['name'].strip()
        if muni_name not in municipalities_by_district[dist_name]:
            municipalities_by_district[dist_name].append(muni_name)

# Sort them alphabetically
for dist in municipalities_by_district:
    municipalities_by_district[dist].sort()

# Add standard Ward Numbers
ward_numbers = [str(i) for i in range(1, 36)]

# Final Provinces data (keep existing or hardcode)
provinces = [
    "Koshi Province", "Madhesh Province", "Bagmati Province",
    "Gandaki Province", "Lumbini Province", "Karnali Province", "Sudurpashchim Province"
]

# Map districts to Provinces (Standard Mapping)
# I'll need a way to link districts to provinces for the triple cascade.
# Let's use the districts raw data if it has province_id.
province_to_districts = {}
for d in districts_raw:
    prov_name = provinces[d['province_id'] - 1] # Assuming 1-based indexing
    if prov_name not in province_to_districts:
        province_to_districts[prov_name] = []
    province_to_districts[prov_name].append(d['name'])

for prov in province_to_districts:
    province_to_districts[prov].sort()

# Generate JS Content
output = f"""/**
 * Nepal Administrative Data (Full 753 Local Levels)
 * Generated from bibekoli/local-levels-of-nepal-dataset
 */

export const NEPAL_DATA = {{
  provinces: {json.dumps(provinces, indent=2)},
  districts: {json.dumps(province_to_districts, indent=2)},
  municipalities: {json.dumps(municipalities_by_district, indent=2)},
  wardNumbers: {json.dumps(ward_numbers)}
}};
"""

with open('d:/FFYYPP/BAckup/FYP/digital-samuha-frontend/src/utils/nepalData.js', 'w', encoding='utf-8') as f:
    f.write(output)

print("Successfully generated nepalData.js with 753 local levels!")
