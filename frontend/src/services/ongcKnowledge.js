// ONGC Knowledge Base - Frontend Version
const ongcKnowledge = {
  company: {
    name: "Oil and Natural Gas Corporation Limited (ONGC)",
    established: "1956",
    headquarters: "New Delhi, India",
    type: "Public Sector Undertaking (PSU)",
    industry: "Oil and Gas Exploration and Production"
  },
  
  operations: [
    "Exploration and production of oil and natural gas",
    "Offshore and onshore drilling operations",
    "Refining and petrochemicals",
    "Power generation",
    "Renewable energy initiatives"
  ],
  
  assets: [
    "Mumbai High - Major offshore oil field",
    "Bassein field - Natural gas production",
    "Gandhar field - Gujarat",
    "Hazira field - Gujarat",
    "Ankleshwar - Major onshore field"
  ],
  
  subsidiaries: [
    "ONGC Videsh Limited (OVL) - International operations",
    "Mangalore Refinery and Petrochemicals Limited (MRPL)",
    "ONGC Petro additions Limited (OPaL)",
    "Hindustan Petroleum Corporation Limited (HPCL)"
  ],
  
  getContext: function() {
    return `
ONGC (Oil and Natural Gas Corporation Limited) is India's largest oil and gas exploration and production company, established in 1956. 
Headquarters: New Delhi, India.

Key Operations:
- Exploration and production of oil and natural gas
- Offshore and onshore drilling operations
- Refining and petrochemicals
- Power generation and renewable energy

Major Assets:
- Mumbai High (offshore oil field)
- Bassein field (natural gas)
- Gandhar and Hazira fields in Gujarat
- Ankleshwar (major onshore field)

Subsidiaries:
- ONGC Videsh Limited (OVL) for international operations
- Mangalore Refinery and Petrochemicals Limited (MRPL)
- ONGC Petro additions Limited (OPaL)
- Hindustan Petroleum Corporation Limited (HPCL)

ONGC is committed to energy security, sustainable development, and technological innovation in the oil and gas sector.
    `.trim();
  }
};

export default ongcKnowledge;
