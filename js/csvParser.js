// CSV Parser for Email Validation
class CSVParser {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.maxPreviewRows = 10;
        this.supportedDelimiters = [',', ';', '\t', '|'];
    }

    // Main parsing function
    parseCSVFile(file) {
        return new Promise((resolve, reject) => {
            // Validate file
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                reject(new Error(validation.error));
                return;
            }

            // Parse CSV using Papa Parse
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                delimiter: '', // Auto-detect
                complete: (results) => {
                    try {
                        const parsedData = this.processParseResults(results, file);
                        resolve(parsedData);
                    } catch (error) {
                        reject(error);
                    }
                },
                error: (error) => {
                    reject(new Error('CSV parsing failed: ' + error.message));
                }
            });
        });
    }

    // Validate uploaded file
    validateFile(file) {
        const result = { isValid: true, error: null };

        // Check file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            result.isValid = false;
            result.error = 'Please upload a CSV file';
            return result;
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            result.isValid = false;
            result.error = `File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`;
            return result;
        }

        // Check if file is empty
        if (file.size === 0) {
            result.isValid = false;
            result.error = 'File is empty';
            return result;
        }

        return result;
    }

    // Process Papa Parse results
    processParseResults(results, file) {
        if (results.errors && results.errors.length > 0) {
            const criticalErrors = results.errors.filter(error => error.type === 'Delimiter');
            if (criticalErrors.length > 0) {
                throw new Error('Unable to parse CSV: Invalid format or delimiter');
            }
        }

        const data = results.data.filter(row => {
            // Filter out completely empty rows
            return Object.values(row).some(value => value && value.trim() !== '');
        });

        if (data.length === 0) {
            throw new Error('No valid data found in CSV file');
        }

        // Detect email columns
        const emailColumns = this.detectEmailColumns(data);
        
        // Determine CSV structure
        const structure = this.determineCsvStructure(data, emailColumns);

        return {
            fileName: file.name,
            fileSize: this.formatFileSize(file.size),
            totalRows: data.length,
            columns: Object.keys(data[0] || {}),
            emailColumns: emailColumns,
            structure: structure,
            previewData: data.slice(0, this.maxPreviewRows),
            fullData: data,
            delimiter: results.meta.delimiter || ',',
            parseInfo: {
                errors: results.errors,
                truncated: results.meta.truncated,
                cursor: results.meta.cursor
            }
        };
    }

    // Detect potential email columns
    detectEmailColumns(data) {
        const columns = Object.keys(data[0] || {});
        const emailColumns = [];

        columns.forEach(column => {
            const score = this.calculateEmailColumnScore(data, column);
            if (score.isEmailColumn) {
                emailColumns.push({
                    name: column,
                    confidence: score.confidence,
                    validEmails: score.validEmails,
                    totalValues: score.totalValues,
                    examples: score.examples
                });
            }
        });

        // Sort by confidence
        emailColumns.sort((a, b) => b.confidence - a.confidence);

        return emailColumns;
    }

    // Calculate email column score
    calculateEmailColumnScore(data, columnName) {
        const sampleSize = Math.min(50, data.length);
        const sample = data.slice(0, sampleSize);
        
        let validEmails = 0;
        let totalValues = 0;
        const examples = [];
        
        // Check column name patterns
        const nameScore = this.getColumnNameScore(columnName);
        
        sample.forEach(row => {
            const value = row[columnName];
            if (value && typeof value === 'string' && value.trim() !== '') {
                totalValues++;
                if (this.isLikelyEmail(value.trim())) {
                    validEmails++;
                    if (examples.length < 3) {
                        examples.push(value.trim());
                    }
                }
            }
        });

        const emailRatio = totalValues > 0 ? validEmails / totalValues : 0;
        const confidence = (emailRatio * 0.7) + (nameScore * 0.3);

        return {
            isEmailColumn: confidence > 0.5 && validEmails > 0,
            confidence: Math.round(confidence * 100),
            validEmails,
            totalValues,
            examples
        };
    }

    // Score column name for email likelihood
    getColumnNameScore(columnName) {
        const name = columnName.toLowerCase().trim();
        
        // Exact matches
        if (['email', 'e-mail', 'mail', 'email_address', 'emailaddress'].includes(name)) {
            return 1.0;
        }
        
        // Partial matches
        if (name.includes('email') || name.includes('mail')) {
            return 0.8;
        }
        
        // Common variations
        const emailPatterns = [
            /^e[-_]?mail/i,
            /mail[-_]?address/i,
            /contact[-_]?email/i,
            /user[-_]?email/i,
            /customer[-_]?email/i
        ];
        
        for (const pattern of emailPatterns) {
            if (pattern.test(name)) {
                return 0.7;
            }
        }
        
        return 0.0;
    }

    // Basic email format check
    isLikelyEmail(value) {
        // Simple email pattern for detection
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(value);
    }

    // Determine CSV structure type
    determineCsvStructure(data, emailColumns) {
        const totalColumns = Object.keys(data[0] || {}).length;
        
        if (totalColumns === 1 && emailColumns.length === 1) {
            return {
                type: 'single_column',
                description: 'Single column containing email addresses',
                emailColumn: emailColumns[0].name,
                autoDetected: true
            };
        } else if (emailColumns.length > 0) {
            return {
                type: 'multi_column',
                description: 'Multiple columns with email data detected',
                emailColumn: emailColumns[0].name, // Best match
                totalColumns: totalColumns,
                autoDetected: true,
                alternatives: emailColumns.slice(1)
            };
        } else {
            return {
                type: 'unknown',
                description: 'No email columns automatically detected',
                emailColumn: null,
                autoDetected: false,
                requiresManualSelection: true
            };
        }
    }

    // Extract emails from parsed data
    extractEmails(data, emailColumnName) {
        const emails = [];
        const errors = [];

        data.forEach((row, index) => {
            const emailValue = row[emailColumnName];
            
            if (emailValue && typeof emailValue === 'string') {
                const trimmedEmail = emailValue.trim();
                if (trimmedEmail !== '') {
                    emails.push({
                        email: trimmedEmail,
                        rowIndex: index + 1,
                        originalRow: row
                    });
                }
            } else if (emailValue !== undefined && emailValue !== null && emailValue !== '') {
                errors.push({
                    rowIndex: index + 1,
                    error: 'Invalid email format in row',
                    value: emailValue
                });
            }
        });

        return {
            emails,
            errors,
            totalExtracted: emails.length,
            totalErrors: errors.length
        };
    }

    // Generate preview table HTML
    generatePreviewTable(data, emailColumns) {
        if (!data || data.length === 0) {
            return '<p>No data to preview</p>';
        }

        const columns = Object.keys(data[0]);
        let html = '<thead><tr>';
        
        columns.forEach(column => {
            const isEmailColumn = emailColumns.some(ec => ec.name === column);
            const className = isEmailColumn ? 'email-column' : '';
            const badge = isEmailColumn ? ' <span class="email-badge">📧</span>' : '';
            html += `<th class="${className}">${column}${badge}</th>`;
        });
        
        html += '</tr></thead><tbody>';
        
        data.forEach(row => {
            html += '<tr>';
            columns.forEach(column => {
                const value = row[column] || '';
                const isEmailColumn = emailColumns.some(ec => ec.name === column);
                const className = isEmailColumn ? 'email-cell' : '';
                html += `<td class="${className}">${this.escapeHtml(value)}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody>';
        return html;
    }

    // Generate column selector options
    generateColumnOptions(columns, emailColumns) {
        let options = '';
        
        // Add detected email columns first
        emailColumns.forEach(emailCol => {
            options += `<option value="${emailCol.name}" data-confidence="${emailCol.confidence}">
                ${emailCol.name} (${emailCol.confidence}% confidence - ${emailCol.validEmails}/${emailCol.totalValues} emails)
            </option>`;
        });
        
        // Add separator if we have both detected and other columns
        if (emailColumns.length > 0 && columns.length > emailColumns.length) {
            options += '<option disabled>──────────</option>';
        }
        
        // Add other columns
        columns.forEach(column => {
            const isEmailColumn = emailColumns.some(ec => ec.name === column);
            if (!isEmailColumn) {
                options += `<option value="${column}">${column}</option>`;
            }
        });
        
        return options;
    }

    // Utility functions
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Validate CSV structure
    validateCsvStructure(data) {
        const issues = [];
        
        if (!data || data.length === 0) {
            issues.push('No data found in CSV');
            return { isValid: false, issues };
        }
        
        // Check for consistent column structure
        const firstRowColumns = Object.keys(data[0]);
        const inconsistentRows = [];
        
        data.forEach((row, index) => {
            const rowColumns = Object.keys(row);
            if (rowColumns.length !== firstRowColumns.length) {
                inconsistentRows.push(index + 1);
            }
        });
        
        if (inconsistentRows.length > 0) {
            issues.push(`Inconsistent column count in rows: ${inconsistentRows.slice(0, 5).join(', ')}${inconsistentRows.length > 5 ? '...' : ''}`);
        }
        
        // Check for completely empty columns
        const emptyColumns = [];
        firstRowColumns.forEach(column => {
            const hasData = data.some(row => row[column] && row[column].trim() !== '');
            if (!hasData) {
                emptyColumns.push(column);
            }
        });
        
        if (emptyColumns.length > 0) {
            issues.push(`Empty columns detected: ${emptyColumns.join(', ')}`);
        }
        
        return {
            isValid: issues.length === 0,
            issues,
            warnings: inconsistentRows.length > 0 || emptyColumns.length > 0 ? issues : []
        };
    }

    // Get file statistics
    getFileStatistics(data, emailColumns) {
        const stats = {
            totalRows: data.length,
            totalColumns: Object.keys(data[0] || {}).length,
            emailColumnsDetected: emailColumns.length,
            estimatedEmails: 0,
            dataQuality: 'Unknown'
        };

        if (emailColumns.length > 0) {
            const bestEmailColumn = emailColumns[0];
            stats.estimatedEmails = bestEmailColumn.validEmails;
            
            // Calculate data quality
            const qualityRatio = bestEmailColumn.validEmails / bestEmailColumn.totalValues;
            if (qualityRatio >= 0.9) stats.dataQuality = 'Excellent';
            else if (qualityRatio >= 0.7) stats.dataQuality = 'Good';
            else if (qualityRatio >= 0.5) stats.dataQuality = 'Fair';
            else stats.dataQuality = 'Poor';
        }

        return stats;
    }
}

// Export for use in other modules
window.CSVParser = CSVParser;
