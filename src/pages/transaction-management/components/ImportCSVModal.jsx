import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { budgetService } from '../../../services/budgetService';

const VALID_TYPES = ['income', 'expense'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Validates + normalizes one parsed CSV row. Returns { row } on success or
// { error } on failure - never throws, so one bad row never aborts the batch.
const validateRow = (raw, rowNumber) => {
  const date = raw.date?.trim();
  const type = raw.type?.trim().toLowerCase();
  const category = raw.category?.trim();
  const amountStr = raw.amount?.trim();
  const description = raw.description?.trim() || '';

  if (!date || !DATE_REGEX.test(date)) {
    return { error: `Row ${rowNumber}: invalid or missing date "${raw.date || ''}" (expected YYYY-MM-DD)` };
  }
  if (!VALID_TYPES.includes(type)) {
    return { error: `Row ${rowNumber}: type must be "income" or "expense", got "${raw.type || ''}"` };
  }
  if (!category) {
    return { error: `Row ${rowNumber}: missing category` };
  }
  const amount = Number(amountStr);
  if (!amountStr || Number.isNaN(amount) || amount <= 0) {
    return { error: `Row ${rowNumber}: invalid amount "${raw.amount || ''}"` };
  }

  return { row: { date, type, category, amount, description } };
};

const ImportCSVModal = ({ isOpen, onClose, onImportComplete, userId, categories }) => {
  const [fileName, setFileName] = useState('');
  const [validRows, setValidRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [newCategories, setNewCategories] = useState([]);
  const [stage, setStage] = useState('select'); // 'select' | 'preview' | 'importing' | 'done'
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const reset = () => {
    setFileName('');
    setValidRows([]);
    setErrors([]);
    setNewCategories([]);
    setStage('select');
    setImportResult(null);
    setImportError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const valid = [];
        const rowErrors = [];

        results.data.forEach((raw, idx) => {
          const { row, error } = validateRow(raw, idx + 2); // +2: header row + 1-index
          if (error) rowErrors.push(error);
          else valid.push(row);
        });

        // Which category names in the file don't already exist for this user
        const existingNames = new Set(
          (categories || []).map((c) => c.name.trim().toLowerCase())
        );
        const newCats = [
          ...new Map(
            valid
              .filter((r) => !existingNames.has(r.category.trim().toLowerCase()))
              .map((r) => [`${r.category.trim().toLowerCase()}|${r.type}`, { name: r.category, type: r.type }])
          ).values()
        ];

        setValidRows(valid);
        setErrors(rowErrors);
        setNewCategories(newCats);
        setStage('preview');
      },
      error: (err) => {
        setImportError(`Failed to parse CSV: ${err.message}`);
      }
    });
  };

  const handleImport = async () => {
    try {
      setStage('importing');
      setImportError('');

      // 1. Create any missing categories first, so transactions can reference them
      const createdCategoryMap = new Map();
      for (const cat of newCategories) {
        const created = await budgetService.createCategory({
          user_id: userId,
          name: cat.name,
          type: cat.type,
          icon: cat.type === 'income' ? 'DollarSign' : 'Tag'
        });
        createdCategoryMap.set(`${cat.name.toLowerCase()}|${cat.type}`, created.id);
      }

      // 2. Build a full name->id lookup (existing categories + newly created ones)
      const categoryIdByKey = new Map();
      (categories || []).forEach((c) => {
        categoryIdByKey.set(`${c.name.trim().toLowerCase()}|${c.type}`, c.id);
      });
      createdCategoryMap.forEach((id, key) => categoryIdByKey.set(key, id));

      // 3. Build transaction rows and bulk insert
      const transactionsToInsert = validRows.map((row) => ({
        user_id: userId,
        type: row.type,
        category_id: categoryIdByKey.get(`${row.category.trim().toLowerCase()}|${row.type}`) || null,
        amount: row.amount,
        description: row.description,
        date: row.date
      }));

      const inserted = await budgetService.createTransactionsBulk(transactionsToInsert);

      setImportResult({
        imported: inserted.length,
        categoriesCreated: newCategories.length,
        skipped: errors.length
      });
      setStage('done');
      onImportComplete();
    } catch (err) {
      console.error('Import failed:', err);
      setImportError(err.message || 'Import failed');
      setStage('preview');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Import Transactions from CSV</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {stage === 'select' && (
            <>
              <div className="bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">Expected CSV columns:</p>
                <code className="block bg-card border border-border rounded px-2 py-1 text-xs">
                  date,type,category,amount,description
                </code>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li><strong>date</strong> - format YYYY-MM-DD</li>
                  <li><strong>type</strong> - "income" or "expense"</li>
                  <li><strong>category</strong> - any name; new ones are created automatically</li>
                  <li><strong>amount</strong> - positive number</li>
                  <li><strong>description</strong> - optional</li>
                </ul>
              </div>

              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary transition-colors">
                <Icon name="Upload" size={28} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to choose a CSV file</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </>
          )}

          {stage === 'preview' && (
            <>
              <p className="text-sm text-muted-foreground">
                File: <span className="font-medium text-foreground">{fileName}</span>
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-success/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-success">{validRows.length}</p>
                  <p className="text-xs text-muted-foreground">Ready to import</p>
                </div>
                <div className="bg-error/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-error">{errors.length}</p>
                  <p className="text-xs text-muted-foreground">Rows skipped</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{newCategories.length}</p>
                  <p className="text-xs text-muted-foreground">New categories</p>
                </div>
              </div>

              {newCategories.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Categories that will be created:</p>
                  <div className="flex flex-wrap gap-2">
                    {newCategories.map((c) => (
                      <span key={`${c.name}-${c.type}`} className="text-xs px-2 py-1 rounded-full bg-muted text-foreground">
                        {c.name} ({c.type})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {errors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Skipped rows:</p>
                  <div className="max-h-32 overflow-y-auto bg-muted/40 rounded-lg p-2 text-xs text-muted-foreground space-y-1">
                    {errors.slice(0, 20).map((e, i) => <p key={i}>{e}</p>)}
                    {errors.length > 20 && <p>...and {errors.length - 20} more</p>}
                  </div>
                </div>
              )}

              {importError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{importError}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" onClick={reset}>Choose Different File</Button>
                <Button
                  variant="default"
                  onClick={handleImport}
                  disabled={validRows.length === 0}
                >
                  Import {validRows.length} Transaction{validRows.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </>
          )}

          {stage === 'importing' && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Importing transactions...</p>
            </div>
          )}

          {stage === 'done' && importResult && (
            <div className="text-center py-6 space-y-3">
              <div className="flex items-center justify-center w-14 h-14 bg-success/10 rounded-full mx-auto">
                <Icon name="CheckCircle2" size={28} className="text-success" />
              </div>
              <p className="text-lg font-semibold text-foreground">Import Complete</p>
              <p className="text-sm text-muted-foreground">
                Imported {importResult.imported} transaction{importResult.imported !== 1 ? 's' : ''}
                {importResult.categoriesCreated > 0 && `, created ${importResult.categoriesCreated} new categor${importResult.categoriesCreated !== 1 ? 'ies' : 'y'}`}
                {importResult.skipped > 0 && `, skipped ${importResult.skipped} invalid row${importResult.skipped !== 1 ? 's' : ''}`}.
              </p>
              <Button variant="default" onClick={handleClose}>Done</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportCSVModal;
