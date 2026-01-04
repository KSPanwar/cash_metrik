
import { Transaction, TransactionType, BankType } from '../types';
import * as XLSX from 'xlsx';

interface BankConfig {
  id: BankType;
  headerKeywords: string[];
  columnMap: {
    date: string[];
    remarks: string[];
    txnNo: string[];
    debit: string[];
    credit: string[];
  };
}

const BANK_CONFIGS: Record<BankType, BankConfig> = {
  PNB: {
    id: 'PNB',
    headerKeywords: ['txn date', 'description'],
    columnMap: {
      date: ['Txn Date'],
      remarks: ['Description'],
      txnNo: ['Txn No.', 'Reference No.'],
      debit: ['Dr Amount'],
      credit: ['Cr Amount'],
    }
  },
  HDFC: {
    id: 'HDFC',
    headerKeywords: ['narration', 'withdrawal amt.'],
    columnMap: {
      date: ['Date'],
      remarks: ['Narration'],
      txnNo: ['Chq./Ref.No.'],
      debit: ['Withdrawal Amt.'],
      credit: ['Deposit Amt.'],
    }
  },
  SBI: {
    id: 'SBI',
    headerKeywords: ['details', 'ref no./cheque no.'],
    columnMap: {
      date: ['Date'],
      remarks: ['Details'],
      txnNo: ['Ref No./Cheque No.'],
      debit: ['Debit'],
      credit: ['Credit'],
    }
  },
  Manual: {
    id: 'Manual',
    headerKeywords: [],
    columnMap: { date: [], remarks: [], txnNo: [], debit: [], credit: [] }
  }
};

export async function parseExcelStatement(
  file: File,
  bankId: BankType,
  password?: string
): Promise<Transaction[]> {
  const data = await file.arrayBuffer();
  const uint8Data = new Uint8Array(data);
  
  let workbook;
  try {
    workbook = XLSX.read(uint8Data, { 
      cellDates: true,
      password: password,
      type: 'array'
    });
  } catch (error: any) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('password') || msg.includes('decrypt') || msg.includes('encrypted')) {
      if (password) throw new Error('WRONG_PASSWORD');
      throw new Error('PASSWORD_REQUIRED');
    }
    throw new Error(`File Error: ${error.message}`);
  }
  
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!worksheet) throw new Error('Empty file.');
  
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const config = BANK_CONFIGS[bankId];

  // Robust header detection
  const headerIndex = rawRows.findIndex(row => 
    row && row.some(cell => {
      const s = String(cell || '').toLowerCase();
      return config.headerKeywords.some(k => s.includes(k));
    })
  );

  if (headerIndex === -1) {
    throw new Error(`Could not find the ${bankId} transaction table structure.`);
  }

  const headers = rawRows[headerIndex].map(h => String(h || '').trim());
  const dataRows = rawRows.slice(headerIndex + 1);
  const transactions: Transaction[] = [];

  const getVal = (rowObj: any, keys: string[]) => {
    for (const key of keys) {
      if (rowObj[key] !== undefined && rowObj[key] !== null) return rowObj[key];
    }
    return undefined;
  };

  dataRows.forEach((row, index) => {
    if (!row || row.length === 0) return;
    const rowObj: any = {};
    headers.forEach((header, i) => { rowObj[header] = row[i]; });

    const rawDate = getVal(rowObj, config.columnMap.date);
    const description = String(getVal(rowObj, config.columnMap.remarks) || '');
    const txnNo = getVal(rowObj, config.columnMap.txnNo);
    
    if (!rawDate || !description || description.trim() === '') return;

    let transactionDate: Date;
    if (rawDate instanceof Date) {
      transactionDate = rawDate;
    } else {
      const dateStr = String(rawDate).trim();
      const parts = dateStr.split(/[\/-]/);
      if (parts.length === 3) {
        const d = parseInt(parts[0]), m = parseInt(parts[1]) - 1;
        let y = parseInt(parts[2]);
        if (parts[2].length === 2) y += 2000;
        transactionDate = new Date(y, m, d);
      } else return;
    }

    if (isNaN(transactionDate.getTime())) return;

    const drVal = String(getVal(rowObj, config.columnMap.debit) || '').replace(/,/g, '').trim();
    const crVal = String(getVal(rowObj, config.columnMap.credit) || '').replace(/,/g, '').trim();
    const drAmount = parseFloat(drVal), crAmount = parseFloat(crVal);

    let type: TransactionType, amount: number;
    if (!isNaN(drAmount) && drAmount > 0) { type = 'Debit'; amount = drAmount; }
    else if (!isNaN(crAmount) && crAmount > 0) { type = 'Credit'; amount = crAmount; }
    else return;

    const payee = extractPayee(description, bankId);
    
    // SBI Specific ID Parsing: If Ref No is empty, use details logic
    let uniqueId = txnNo ? `${bankId}-${String(txnNo).trim()}` : null;
    if (!uniqueId && bankId === 'SBI') {
      const match = description.match(/Transfer (?:to|from) (.*?) -/i);
      if (match && match[1]) {
        uniqueId = `${bankId}-${match[1].trim()}-${transactionDate.getTime()}`;
      }
    }
    
    if (!uniqueId) {
      uniqueId = `${bankId}-txn-${index}-${transactionDate.getTime()}`;
    }

    transactions.push({
      id: uniqueId,
      date: transactionDate,
      type,
      amount,
      remarks: description,
      payee,
      bank: bankId
    });
  });

  return transactions;
}

function extractPayee(description: string, bankId: BankType): string {
  const clean = description.trim();
  const upper = clean.toUpperCase();
  
  // 1. Handle "Bank Acc" handling for UPI/Transfers first
  if (upper.includes('BANK ACC')) {
    const segments = clean.split('/');
    const bankAccIdx = segments.findIndex(s => s.toUpperCase().trim() === 'BANK ACC');
    if (bankAccIdx !== -1 && bankAccIdx < segments.length - 1) {
      return `Bank Acc - ${segments[bankAccIdx + 1].trim()}`;
    }
    // Fallback if not / delimited
    const spaceSegments = clean.split(' ');
    const bIdx = spaceSegments.findIndex(s => s.toUpperCase() === 'ACC');
    if (bIdx !== -1 && bIdx < spaceSegments.length - 1) {
       return `Bank Acc - ${spaceSegments[bIdx + 1].trim()}`;
    }
  }

  // 2. Specialized NEFT/IMPS logic for HDFC and others
  // Example: NEFT CR-XXXXX - NAME -
  if (upper.includes('NEFT CR') || upper.includes('NEFT DR') || upper.includes('IMPS') || upper.includes('RTGS')) {
    const parts = clean.split('-');
    if (parts.length >= 3) {
      // Typically: [Type, Reference, Name, Remaining]
      const nameCandidate = parts[2].trim();
      if (nameCandidate && nameCandidate.length > 2) {
        return nameCandidate;
      }
    }
  }

  // 3. Generic UPI parsing for any bank using / delimiter
  if (upper.includes('UPI/')) {
    const segments = clean.split('/');
    
    // SBI Specific Payee Extraction
    if (bankId === 'SBI') {
      // e.g. Transfer to xxxxxxx - UPI/DR/XXXXXX/AMAZON -> return AMAZON
      if (segments.length > 0) {
        return segments[segments.length - 1].trim();
      }
    }

    // Generic UPI fallback (often the 4th segment or last)
    if (segments.length > 3) {
      const name = segments[3].trim();
      if (name.length > 1) return name;
    }
  }

  // 4. Specific HDFC UPI logic
  if (bankId === 'HDFC' && upper.startsWith('UPI-')) {
    const parts = clean.split('-');
    if (parts.length > 1) {
      const candidate = parts[1].trim();
      if (candidate.length > 1) return candidate;
    }
  }

  // 5. SBI Specific "Transfer to/from"
  if (bankId === 'SBI' && (upper.startsWith('TRANSFER TO') || upper.startsWith('TRANSFER FROM'))) {
     const match = clean.match(/Transfer (?:to|from) (.*?) -/i);
     if (match && match[1]) return match[1].trim();
     
     const parts = clean.split(' ');
     if (parts.length > 2) return parts.slice(2, 5).join(' ').trim();
  }

  // 6. Generic cleaning fallback
  return clean
    .replace(/(TRANSFER|IMPS|NEFT|RTGS|CHQ|POS|ATM|WDL|DEP|UPI|CR|DR)-/gi, '')
    .split('/')[0]
    .split('-')[0]
    .replace(/^\s+|\s+$/g, '')
    .trim() || 'Other Transaction';
}
