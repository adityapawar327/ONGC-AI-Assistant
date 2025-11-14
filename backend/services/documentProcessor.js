import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document } from 'langchain/document';
import pdfParse from 'pdf-parse';
import xlsx from 'xlsx';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DocumentProcessor {
  async processFile(filePath, filename) {
    const ext = path.extname(filename).toLowerCase();
    
    switch (ext) {
      case '.txt':
        return await this.processTxt(filePath, filename);
      case '.pdf':
        return await this.processPdf(filePath, filename);
      case '.xlsx':
      case '.xls':
        return await this.processExcel(filePath, filename);
      case '.csv':
        return await this.processCsv(filePath, filename);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  async processTxt(filePath, filename) {
    const content = await fs.readFile(filePath, 'utf-8');
    return [
      new Document({
        pageContent: content,
        metadata: { source: filename, type: 'txt' }
      })
    ];
  }

  async processPdf(filePath, filename) {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    return [
      new Document({
        pageContent: data.text,
        metadata: { 
          source: filename, 
          type: 'pdf',
          pages: data.numpages
        }
      })
    ];
  }

  async processExcel(filePath, filename) {
    const workbook = xlsx.readFile(filePath);
    const documents = [];

    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Convert to text format
      let content = `Sheet: ${sheetName}\n\n`;
      jsonData.forEach((row, rowIndex) => {
        if (row.length > 0) {
          content += row.join(' | ') + '\n';
        }
      });

      documents.push(
        new Document({
          pageContent: content,
          metadata: {
            source: filename,
            type: 'excel',
            sheet: sheetName,
            sheetIndex: index,
            rows: jsonData.length
          }
        })
      );
    });

    return documents;
  }

  async processCsv(filePath, filename) {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const records = parse(fileContent, {
      skip_empty_lines: true,
      trim: true
    });

    let content = 'CSV Data:\n\n';
    records.forEach((row, index) => {
      content += row.join(' | ') + '\n';
    });

    return [
      new Document({
        pageContent: content,
        metadata: {
          source: filename,
          type: 'csv',
          rows: records.length
        }
      })
    ];
  }

  async loadDocumentsFromDirectory(dirPath) {
    const documents = [];
    
    try {
      const files = await fs.readdir(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isFile()) {
          try {
            const docs = await this.processFile(filePath, file);
            documents.push(...docs);
            console.log(`✅ Processed: ${file}`);
          } catch (error) {
            console.error(`❌ Failed to process ${file}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
    
    return documents;
  }
}

export default new DocumentProcessor();
