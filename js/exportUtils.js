// Export Utilities for Email Validation Results
class ExportUtils {
    constructor() {
        this.dateFormat = new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    // Generate timestamp for filenames
    getTimestamp() {
        const now = new Date();
        return now.toISOString().slice(0, 19).replace(/[T:]/g, '_').replace(/-/g, '');
    }

    // Export valid emails only as CSV
    exportValidEmails(validationResults) {
        const validEmails = validationResults.filter(result => result.isValid);
        
        if (validEmails.length === 0) {
            throw new Error('No valid emails found to export');
        }

        const csvContent = this.generateValidEmailsCSV(validEmails);
        const filename = `valid_emails_${this.getTimestamp()}.csv`;
        
        this.downloadFile(csvContent, filename, 'text/csv');
        
        return {
            filename,
            count: validEmails.length,
            type: 'valid_emails'
        };
    }

    // Export all validation results as CSV
    exportAllResults(validationResults) {
        if (validationResults.length === 0) {
            throw new Error('No results to export');
        }

        const csvContent = this.generateCompleteResultsCSV(validationResults);
        const filename = `validation_results_${this.getTimestamp()}.csv`;
        
        this.downloadFile(csvContent, filename, 'text/csv');
        
        return {
            filename,
            count: validationResults.length,
            type: 'all_results'
        };
    }

    // Export invalid emails as CSV
    exportInvalidEmails(validationResults) {
        const invalidEmails = validationResults.filter(result => !result.isValid);
        
        if (invalidEmails.length === 0) {
            throw new Error('No invalid emails found to export');
        }

        const csvContent = this.generateInvalidEmailsCSV(invalidEmails);
        const filename = `invalid_emails_${this.getTimestamp()}.csv`;
        
        this.downloadFile(csvContent, filename, 'text/csv');
        
        return {
            filename,
            count: invalidEmails.length,
            type: 'invalid_emails'
        };
    }

    // Export banking compliant emails as CSV
    exportBankingCompliantEmails(validationResults) {
        const bankingCompliant = validationResults.filter(result => 
            result.isValid && result.isBankingCompliant === 'Yes'
        );
        
        if (bankingCompliant.length === 0) {
            throw new Error('No banking compliant emails found to export');
        }

        const csvContent = this.generateBankingCompliantCSV(bankingCompliant);
        const filename = `banking_compliant_emails_${this.getTimestamp()}.csv`;
        
        this.downloadFile(csvContent, filename, 'text/csv');
        
        return {
            filename,
            count: bankingCompliant.length,
            type: 'banking_compliant'
        };
    }

    // Generate CSV for valid emails only
    generateValidEmailsCSV(validEmails) {
        const headers = ['Email'];
        const rows = validEmails.map(result => [result.email]);
        
        return this.arrayToCSV([headers, ...rows]);
    }

    // Generate CSV for complete validation results
    generateCompleteResultsCSV(results) {
        const headers = [
            'Email',
            'Status',
            'Banking_Compliant',
            'Error_Details',
            'Risk_Level',
            'Domain',
            'Validation_Date'
        ];

        const rows = results.map(result => [
            result.email,
            result.isValid ? 'Valid' : 'Invalid',
            result.isBankingCompliant,
            this.cleanErrorDetails(result.errorDetails),
            result.riskLevel,
            this.extractDomain(result.email),
            this.getCurrentDateTime()
        ]);

        return this.arrayToCSV([headers, ...rows]);
    }

    // Generate CSV for invalid emails
    generateInvalidEmailsCSV(invalidEmails) {
        const headers = [
            'Email',
            'Error_Details',
            'Risk_Level',
            'Primary_Issue'
        ];

        const rows = invalidEmails.map(result => [
            result.email,
            this.cleanErrorDetails(result.errorDetails),
            result.riskLevel,
            this.getPrimaryIssue(result.errorDetails)
        ]);

        return this.arrayToCSV([headers, ...rows]);
    }

    // Generate CSV for banking compliant emails
    generateBankingCompliantCSV(bankingEmails) {
        const headers = [
            'Email',
            'Domain',
            'Banking_Type',
            'Risk_Level',
            'Compliance_Level'
        ];

        const rows = bankingEmails.map(result => [
            result.email,
            this.extractDomain(result.email),
            this.getBankingType(result.email),
            result.riskLevel,
            result.isBankingCompliant
        ]);

        return this.arrayToCSV([headers, ...rows]);
    }

    // Generate comprehensive Excel-style report
    exportExcelReport(validationResults, statistics) {
        const workbook = this.createWorkbook(validationResults, statistics);
        const filename = `email_validation_report_${this.getTimestamp()}.csv`;
        
        // For now, export as CSV (can be enhanced to actual Excel format)
        this.downloadFile(workbook, filename, 'text/csv');
        
        return {
            filename,
            count: validationResults.length,
            type: 'excel_report'
        };
    }

    // Create workbook content (CSV format for simplicity)
    createWorkbook(results, stats) {
        let content = '';
        
        // Summary section
        content += 'EMAIL VALIDATION REPORT\n';
        content += `Generated on: ${this.getCurrentDateTime()}\n`;
        content += '\n';
        content += 'SUMMARY STATISTICS\n';
        content += `Total Emails Processed,${stats.total}\n`;
        content += `Valid Emails,${stats.valid}\n`;
        content += `Invalid Emails,${stats.invalid}\n`;
        content += `Banking Compliant,${stats.bankingCompliant}\n`;
        content += `Success Rate,${((stats.valid / stats.total) * 100).toFixed(2)}%\n`;
        content += `Banking Compliance Rate,${((stats.bankingCompliant / stats.total) * 100).toFixed(2)}%\n`;
        content += '\n';
        
        // Detailed results
        content += 'DETAILED VALIDATION RESULTS\n';
        content += this.generateCompleteResultsCSV(results);
        
        return content;
    }

    // Convert array to CSV format
    arrayToCSV(data) {
        return data.map(row => 
            row.map(field => {
                // Escape quotes and wrap in quotes if necessary
                const stringField = String(field || '');
                if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                    return '"' + stringField.replace(/"/g, '""') + '"';
                }
                return stringField;
            }).join(',')
        ).join('\n');
    }

    // Download file to user's computer
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            // Fallback for older browsers
            window.open('data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(content));
        }
    }

    // Utility functions
    extractDomain(email) {
        const parts = email.split('@');
        return parts.length > 1 ? parts[1] : '';
    }

    cleanErrorDetails(errorDetails) {
        if (!errorDetails || errorDetails === 'None') {
            return '';
        }
        // Remove extra semicolons and clean up formatting
        return errorDetails.replace(/;+/g, '; ').replace(/^; |; $/g, '');
    }

    getPrimaryIssue(errorDetails) {
        if (!errorDetails || errorDetails === 'None') {
            return 'Unknown';
        }
        
        const errors = errorDetails.split(';');
        const primaryError = errors[0]?.trim();
        
        // Categorize primary issues
        if (primaryError?.includes('@ symbol')) return 'Missing @ Symbol';
        if (primaryError?.includes('domain')) return 'Domain Issue';
        if (primaryError?.includes('format')) return 'Format Issue';
        if (primaryError?.includes('length')) return 'Length Issue';
        if (primaryError?.includes('character')) return 'Invalid Characters';
        
        return primaryError || 'Validation Error';
    }

    getBankingType(email) {
        const domain = this.extractDomain(email);
        
        // Public sector banks
        const publicBanks = ['sbi.co.in', 'pnb.co.in', 'bankofbaroda.com', 'canarabank.com'];
        if (publicBanks.some(bank => domain.includes(bank))) {
            return 'Public Sector Bank';
        }
        
        // Private sector banks
        const privateBanks = ['hdfcbank.com', 'icicibank.com', 'axisbank.com', 'kotakbank.com'];
        if (privateBanks.some(bank => domain.includes(bank))) {
            return 'Private Sector Bank';
        }
        
        // Government domains
        if (domain.endsWith('.gov.in') || domain.endsWith('.nic.in')) {
            return 'Government';
        }
        
        // Payment banks
        const paymentBanks = ['paytm.com', 'airtel.in', 'jio.com'];
        if (paymentBanks.some(bank => domain.includes(bank))) {
            return 'Payment Bank';
        }
        
        return 'Other Financial Institution';
    }

    getCurrentDateTime() {
        return this.dateFormat.format(new Date()).replace(/,/g, '');
    }

    // Generate statistics summary
    generateStatistics(validationResults) {
        const stats = {
            total: validationResults.length,
            valid: 0,
            invalid: 0,
            bankingCompliant: 0,
            riskLevels: { low: 0, medium: 0, high: 0 },
            domains: {},
            errorTypes: {}
        };

        validationResults.forEach(result => {
            if (result.isValid) {
                stats.valid++;
            } else {
                stats.invalid++;
            }

            if (result.isBankingCompliant === 'Yes') {
                stats.bankingCompliant++;
            }

            // Risk levels
            const risk = result.riskLevel.toLowerCase();
            if (stats.riskLevels[risk] !== undefined) {
                stats.riskLevels[risk]++;
            }

            // Domain analysis
            const domain = this.extractDomain(result.email);
            if (domain) {
                stats.domains[domain] = (stats.domains[domain] || 0) + 1;
            }

            // Error analysis
            if (!result.isValid && result.errorDetails && result.errorDetails !== 'None') {
                const primaryError = this.getPrimaryIssue(result.errorDetails);
                stats.errorTypes[primaryError] = (stats.errorTypes[primaryError] || 0) + 1;
            }
        });

        return stats;
    }

    // Export filtered results based on criteria
    exportFilteredResults(validationResults, filter) {
        let filteredResults = [];
        let filename = '';
        
        switch (filter.type) {
            case 'valid':
                filteredResults = validationResults.filter(r => r.isValid);
                filename = `valid_emails_${this.getTimestamp()}.csv`;
                break;
            case 'invalid':
                filteredResults = validationResults.filter(r => !r.isValid);
                filename = `invalid_emails_${this.getTimestamp()}.csv`;
                break;
            case 'banking':
                filteredResults = validationResults.filter(r => r.isBankingCompliant === 'Yes');
                filename = `banking_compliant_${this.getTimestamp()}.csv`;
                break;
            case 'risk_level':
                filteredResults = validationResults.filter(r => r.riskLevel === filter.value);
                filename = `${filter.value.toLowerCase()}_risk_emails_${this.getTimestamp()}.csv`;
                break;
            case 'domain':
                filteredResults = validationResults.filter(r => 
                    this.extractDomain(r.email) === filter.value
                );
                filename = `${filter.value.replace(/\./g, '_')}_emails_${this.getTimestamp()}.csv`;
                break;
            default:
                filteredResults = validationResults;
                filename = `filtered_results_${this.getTimestamp()}.csv`;
        }

        if (filteredResults.length === 0) {
            throw new Error(`No emails found matching filter: ${filter.type}`);
        }

        const csvContent = this.generateCompleteResultsCSV(filteredResults);
        this.downloadFile(csvContent, filename, 'text/csv');

        return {
            filename,
            count: filteredResults.length,
            type: filter.type
        };
    }

    // Batch export all file types
    exportAllTypes(validationResults) {
        const exports = [];
        
        try {
            // Valid emails
            const validEmails = validationResults.filter(r => r.isValid);
            if (validEmails.length > 0) {
                exports.push(this.exportValidEmails(validationResults));
            }

            // All results
            exports.push(this.exportAllResults(validationResults));

            // Invalid emails
            const invalidEmails = validationResults.filter(r => !r.isValid);
            if (invalidEmails.length > 0) {
                exports.push(this.exportInvalidEmails(validationResults));
            }

            // Banking compliant
            const bankingCompliant = validationResults.filter(r => 
                r.isValid && r.isBankingCompliant === 'Yes'
            );
            if (bankingCompliant.length > 0) {
                exports.push(this.exportBankingCompliantEmails(validationResults));
            }

        } catch (error) {
            console.error('Batch export error:', error);
            throw new Error('Failed to export some files: ' + error.message);
        }

        return exports;
    }

    // Copy results to clipboard
    copyToClipboard(validationResults, format = 'emails') {
        let content = '';
        
        switch (format) {
            case 'emails':
                const validEmails = validationResults.filter(r => r.isValid);
                content = validEmails.map(r => r.email).join('\n');
                break;
            case 'csv':
                content = this.generateCompleteResultsCSV(validationResults);
                break;
            case 'summary':
                const stats = this.generateStatistics(validationResults);
                content = `Total: ${stats.total}, Valid: ${stats.valid}, Invalid: ${stats.invalid}, Banking Compliant: ${stats.bankingCompliant}`;
                break;
        }

        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(content);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return Promise.resolve();
        }
    }
}

// Export for use in other modules
window.ExportUtils = ExportUtils;
