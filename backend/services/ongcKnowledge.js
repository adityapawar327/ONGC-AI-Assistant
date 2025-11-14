import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ONGCKnowledgeService {
  constructor() {
    this.knowledge = null;
  }

  async loadKnowledge() {
    try {
      const knowledgePath = path.join(__dirname, '../data/ongc_knowledge.json');
      const data = await fs.readFile(knowledgePath, 'utf-8');
      this.knowledge = JSON.parse(data);
      console.log('✅ ONGC knowledge base loaded');
    } catch (error) {
      console.error('⚠️  Failed to load ONGC knowledge:', error.message);
      this.knowledge = {};
    }
  }

  getContextualKnowledge(question) {
    if (!this.knowledge) return '';

    const lowerQuestion = question.toLowerCase();
    let relevantInfo = [];

    // Company basics
    if (lowerQuestion.match(/what is ongc|about ongc|ongc company|tell me about/i)) {
      relevantInfo.push(`ONGC (Oil and Natural Gas Corporation Limited) is India's largest oil and gas exploration and production company, founded in 1956. It is a Maharatna Public Sector Undertaking headquartered in Dehradun, with corporate office in New Delhi.`);
      relevantInfo.push(`Key Facts: Revenue of ₹4.76 lakh crore (FY 2022-23), over 30,000 employees, contributes ~70% of India's domestic oil production.`);
    }

    // Operations
    if (lowerQuestion.match(/operation|production|drilling|exploration|field/i)) {
      relevantInfo.push(`ONGC Operations: Produces ~21 million metric tonnes of crude oil and ~21 billion cubic meters of natural gas annually.`);
      relevantInfo.push(`Major operational areas: Mumbai High (Western Offshore), Krishna-Godavari Basin (Eastern Offshore), Assam, Cambay Basin, Rajasthan.`);
    }

    // Mumbai High
    if (lowerQuestion.match(/mumbai high|bombay high/i)) {
      relevantInfo.push(`Mumbai High is India's largest offshore oil field, located 160 km west of Mumbai in the Arabian Sea. Discovered in 1974, it is a major contributor to India's oil production.`);
    }

    // Subsidiaries
    if (lowerQuestion.match(/subsidiary|subsidiari|ovl|videsh|mrpl|opal/i)) {
      relevantInfo.push(`ONGC Subsidiaries: ONGC Videsh Limited (OVL) - overseas E&P operations in 20+ countries; MRPL - Mangalore Refinery (15 MMTPA capacity); OPaL - Petrochemical complex in Dahej, Gujarat.`);
    }

    // Technology
    if (lowerQuestion.match(/technology|digital|ai|ml|innovation|iot/i)) {
      relevantInfo.push(`ONGC Technology Initiatives: AI/ML for reservoir management, IoT-enabled smart wells, digital twin technology, drone-based inspections, blockchain for supply chain.`);
    }

    // Renewable Energy
    if (lowerQuestion.match(/renewable|solar|wind|green|hydrogen|carbon/i)) {
      relevantInfo.push(`ONGC Renewable Energy: Solar and wind power projects, geothermal energy exploration, hydrogen fuel initiatives, carbon capture and storage. Target: Net zero carbon emissions by 2038.`);
    }

    // Safety
    if (lowerQuestion.match(/safety|hse|health|environment|iso/i)) {
      relevantInfo.push(`ONGC Safety Standards: ISO 9001, ISO 14001, ISO 45001, ISO 50001 certified. Programs include Process Safety Management (PSM), Behavior Based Safety (BBS), Emergency Response systems.`);
    }

    // CSR
    if (lowerQuestion.match(/csr|social|community|responsibility/i)) {
      relevantInfo.push(`ONGC CSR Focus Areas: Education and skill development, healthcare, rural development, water conservation, sports promotion, art and culture preservation.`);
    }

    // Training
    if (lowerQuestion.match(/training|institute|education|learning|ihrdc/i)) {
      relevantInfo.push(`ONGC Training: ONGC Energy Centre in Dehradun is the premier training institute. IHRDC (Institute of Human Resource Development Centre) has centers in Dehradun, Goa, Ahmedabad, and Kakinada.`);
    }

    // Achievements
    if (lowerQuestion.match(/achievement|award|milestone|maharatna|fortune/i)) {
      relevantInfo.push(`ONGC Achievements: Maharatna status (2010), Forbes Global 2000 company, Fortune 500 company. Milestones include first offshore oil discovery (1974), 1 billion tonnes cumulative oil production.`);
    }

    // Environmental
    if (lowerQuestion.match(/environment|green|eco|pollution|emission/i)) {
      relevantInfo.push(`ONGC Environmental Commitment: Zero flaring policy, afforestation programs, marine biodiversity conservation, waste management. Target: Net zero by 2038.`);
    }

    // Locations
    if (lowerQuestion.match(/location|office|headquarter|where/i)) {
      relevantInfo.push(`ONGC Headquarters: Dehradun, Uttarakhand. Corporate Office: ONGC Bhawan, Vasant Kunj, New Delhi. Website: www.ongcindia.com`);
    }

    return relevantInfo.length > 0 
      ? `\n\nONGC Background Knowledge:\n${relevantInfo.join('\n\n')}\n`
      : '';
  }

  getFullContext() {
    if (!this.knowledge) return '';

    return `
ONGC (Oil and Natural Gas Corporation Limited) - Company Overview:
- India's largest oil and gas E&P company, founded in 1956
- Maharatna PSU with headquarters in Dehradun
- Revenue: ₹4.76 lakh crore (FY 2022-23)
- Produces ~21 MMT crude oil and ~21 BCM natural gas annually
- Contributes ~70% of India's domestic oil production
- Major assets: Mumbai High, Bassein Field, KG Basin
- Subsidiaries: ONGC Videsh (OVL), MRPL, OPaL
- Focus on digitalization, renewable energy, and sustainability
- Target: Net zero carbon emissions by 2038
`;
  }
}

export default new ONGCKnowledgeService();
