// Main Application Controller
class EmailValidatorApp {
    constructor() {
        this.csvParser = new CSVParser();
        this.emailValidator = new EmailValidator();
        this.exportUtils = new ExportUtils();
        
        this.currentData = null;
        this.validationResults = [];
        this.currentPage = 1;
        this.itemsPerPage = 50;
        this.filteredResults = [];
        
        this.initializeEventListeners();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Mode switching
        document.getElementById('csvModeTab').addEventListener('click', () => this.switchMode('csv'));
        document.getElementById('singleModeTab').addEventListener('click', () => this.switchMode('single'));
        
        // Single email validation
        document.getElementById('validateSingleBtn').addEventListener('click', this.validateSingleEmail.bind(this));
        document.getElementById('clearSingleBtn').addEventListener('click', this.clearSingleResult.bind(this));
        document.getElementById('copySingleBtn').addEventListener('click', this.copySingleEmail.bind(this));
        document.getElementById('exportSingleBtn').addEventListener('click', this.exportSingleResult.bind(this));
        
        // Enter key support for single email input
        document.getElementById('singleEmailInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validateSingleEmail();
            }
        });
        
        // File upload events
        const uploadArea = document.getElementById('uploadArea');
        const csvFile = document.getElementById('csvFile');
        
        uploadArea.addEventListener('click', () => csvFile.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleFileDrop.bind(this));
        
        csvFile.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Validation button
        document.getElementById('validateBtn').addEventListener('click', this.startValidation.bind(this));
        
        // Export buttons
        document.getElementById('exportValidBtn').addEventListener('click', () => this.exportResults('valid'));
        document.getElementById('exportAllBtn').addEventListener('click', () => this.exportResults('all'));
        document.getElementById('exportInvalidBtn').addEventListener('click', () => this.exportResults('invalid'));
        document.getElementById('exportBankingBtn').addEventListener('click', () => this.exportResults('banking'));
        
        // Filter and search
        document.getElementById('statusFilter').addEventListener('change', this.applyFilters.bind(this));
        document.getElementById('searchInput').addEventListener('input', this.debounce(this.applyFilters.bind(this), 300));
    }

    // Switch between CSV and single email modes
    switchMode(mode) {
        const csvTab = document.getElementById('csvModeTab');
        const singleTab = document.getElementById('singleModeTab');
        const csvSection = document.getElementById('uploadSection');
        const singleSection = document.getElementById('singleEmailSection');
        const progressSection = document.getElementById('progressSection');
        const resultsSection = document.getElementById('resultsSection');
        
        if (mode === 'csv') {
            csvTab.classList.add('active');
            singleTab.classList.remove('active');
            csvSection.style.display = 'block';
            singleSection.style.display = 'none';
        } else {
            singleTab.classList.add('active');
            csvTab.classList.remove('active');
            csvSection.style.display = 'none';
            singleSection.style.display = 'block';
            // Hide other sections when switching to single mode
            progressSection.style.display = 'none';
            resultsSection.style.display = 'none';
        }
    }

    // Validate single email
    validateSingleEmail() {
        const emailInput = document.getElementById('singleEmailInput');
        const email = emailInput.value.trim();
        
        if (!email) {
            this.showError('Please enter an email address');
            return;
        }
        
        // Validate the email
        const result = this.emailValidator.validateEmail(email);
        
        // Display the result
        this.displaySingleResult(result);
    }

    // Display single email validation result
    displaySingleResult(result) {
        const resultSection = document.getElementById('singleResult');
        const statusElement = document.getElementById('singleStatus');
        const emailValue = document.getElementById('singleEmailValue');
        const bankingValue = document.getElementById('singleBankingValue');
        const riskValue = document.getElementById('singleRiskValue');
        const domainValue = document.getElementById('singleDomainValue');
        const checksGrid = document.getElementById('singleChecksGrid');
        const errorDetails = document.getElementById('singleErrorDetails');
        const errorList = document.getElementById('singleErrorList');
        
        // Set basic info
        emailValue.textContent = result.email;
        bankingValue.textContent = result.isBankingCompliant;
        riskValue.textContent = result.riskLevel;
        domainValue.textContent = this.extractDomain(result.email);
        
        // Set status
        statusElement.textContent = result.isValid ? 'Valid' : 'Invalid';
        statusElement.className = `result-status ${result.isValid ? 'valid' : 'invalid'}`;
        
        // Apply risk level styling
        riskValue.className = `value risk-${result.riskLevel.toLowerCase()}`;
        
        // Apply banking compliance styling
        bankingValue.className = `value banking-${result.isBankingCompliant.toLowerCase()}`;
        
        // Generate detailed checks
        this.generateDetailedChecks(result, checksGrid);
        
        // Show/hide error details
        if (!result.isValid && result.errorDetails !== 'None') {
            errorDetails.style.display = 'block';
            errorList.innerHTML = '';
            const errors = result.errorDetails.split(';').filter(error => error.trim());
            errors.forEach(error => {
                const errorItem = document.createElement('div');
                errorItem.className = 'error-item';
                errorItem.textContent = error.trim();
                errorList.appendChild(errorItem);
            });
        } else {
            errorDetails.style.display = 'none';
        }
        
        // Show result section
        resultSection.style.display = 'block';
        resultSection.classList.add('fade-in');
        
        // Store result for export
        this.currentSingleResult = result;
    }

    // Generate detailed validation checks display
    generateDetailedChecks(result, container) {
        container.innerHTML = '';
        
        // Use the validation checks from the result object
        const validationChecks = result.validationChecks || {};
        
        const checks = [
            { 
                label: 'Basic Format', 
                passed: validationChecks.basicFormat?.passed || false,
                details: validationChecks.basicFormat?.details
            },
            { 
                label: 'RFC Compliance', 
                passed: validationChecks.rfcCompliance?.passed || false,
                details: validationChecks.rfcCompliance?.details
            },
            { 
                label: 'RBI Guidelines', 
                passed: validationChecks.rbiCompliance?.passed || false,
                details: validationChecks.rbiCompliance?.details
            },
            { 
                label: 'Domain Validation', 
                passed: validationChecks.domainValidation?.passed || false,
                details: validationChecks.domainValidation?.details
            },
            { 
                label: 'Banking Domain', 
                passed: validationChecks.bankingDomain?.passed || false,
                details: validationChecks.bankingDomain?.details
            },
            { 
                label: 'Security Check', 
                passed: validationChecks.securityCheck?.passed || false,
                details: validationChecks.securityCheck?.details
            }
        ];
        
        checks.forEach(check => {
            const checkItem = document.createElement('div');
            checkItem.className = 'check-item';
            
            const icon = document.createElement('i');
            icon.className = `fas ${check.passed ? 'fa-check-circle' : 'fa-times-circle'} check-icon ${check.passed ? 'pass' : 'fail'}`;
            
            const label = document.createElement('span');
            label.className = 'check-label';
            label.textContent = check.label;
            
            checkItem.appendChild(icon);
            checkItem.appendChild(label);
            container.appendChild(checkItem);
        });
    }

    // Clear single email result
    clearSingleResult() {
        document.getElementById('singleResult').style.display = 'none';
        document.getElementById('singleEmailInput').value = '';
        this.currentSingleResult = null;
    }

    // Copy single email to clipboard
    async copySingleEmail() {
        if (!this.currentSingleResult) return;
        
        try {
            await this.exportUtils.copyToClipboard([this.currentSingleResult], 'emails');
            this.showSuccess('Email copied to clipboard');
        } catch (error) {
            this.showError('Failed to copy email: ' + error.message);
        }
    }

    // Export single email result
    exportSingleResult() {
        if (!this.currentSingleResult) return;
        
        try {
            const csvContent = this.exportUtils.generateCompleteResultsCSV([this.currentSingleResult]);
            const timestamp = this.exportUtils.getTimestamp();
            const filename = `single_email_validation_${timestamp}.csv`;
            
            this.exportUtils.downloadFile(csvContent, filename, 'text/csv');
            this.showSuccess(`Downloaded ${filename}`);
        } catch (error) {
            this.showError('Export failed: ' + error.message);
        }
    }

    // Extract domain from email
    extractDomain(email) {
        const parts = email.split('@');
        return parts.length > 1 ? parts[1] : '';
    }

    // Handle drag over event
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('dragover');
    }

    // Handle drag leave event
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
    }

    // Handle file drop event
    handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    // Handle file selection
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    // Process uploaded file
    async processFile(file) {
        try {
            this.showLoading('Parsing CSV file...');
            
            const parsedData = await this.csvParser.parseCSVFile(file);
            this.currentData = parsedData;
            
            this.displayFilePreview(parsedData);
            this.hideLoading();
            
        } catch (error) {
            this.hideLoading();
            this.showError('File processing failed: ' + error.message);
        }
    }

    // Display file preview
    displayFilePreview(data) {
        const previewSection = document.getElementById('filePreview');
        const uploadSection = document.getElementById('uploadSection');
        
        // Update file info
        document.getElementById('fileName').textContent = `📄 ${data.fileName}`;
        document.getElementById('fileSize').textContent = `📊 ${data.fileSize}`;
        document.getElementById('rowCount').textContent = `📋 ${data.totalRows} rows`;
        
        // Generate preview table
        const previewTable = document.getElementById('previewTable');
        previewTable.innerHTML = this.csvParser.generatePreviewTable(data.previewData, data.emailColumns);
        
        // Handle column selection
        const columnSelector = document.getElementById('columnSelector');
        const emailColumnSelect = document.getElementById('emailColumn');
        
        if (data.structure.requiresManualSelection) {
            columnSelector.style.display = 'block';
            emailColumnSelect.innerHTML = this.csvParser.generateColumnOptions(data.columns, data.emailColumns);
        } else {
            columnSelector.style.display = 'none';
            // Auto-select the best email column
            emailColumnSelect.innerHTML = `<option value="${data.structure.emailColumn}">${data.structure.emailColumn}</option>`;
        }
        
        previewSection.style.display = 'block';
        previewSection.classList.add('fade-in');
    }

    // Start email validation process
    async startValidation() {
        if (!this.currentData) {
            this.showError('Please upload a CSV file first');
            return;
        }

        const selectedColumn = document.getElementById('emailColumn').value;
        if (!selectedColumn) {
            this.showError('Please select an email column');
            return;
        }

        try {
            // Extract emails from CSV
            const extractedData = this.csvParser.extractEmails(this.currentData.fullData, selectedColumn);
            
            if (extractedData.emails.length === 0) {
                this.showError('No valid emails found in the selected column');
                return;
            }

            // Show progress section
            this.showProgressSection();
            
            // Validate emails with progress tracking
            await this.validateEmailsWithProgress(extractedData.emails);
            
            // Show results
            this.showResults();
            
        } catch (error) {
            this.hideProgressSection();
            this.showError('Validation failed: ' + error.message);
        }
    }

    // Validate emails with progress tracking
    async validateEmailsWithProgress(emails) {
        this.validationResults = [];
        const total = emails.length;
        const batchSize = 10; // Process in batches for better performance
        
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            
            // Process batch
            const batchResults = batch.map(emailData => {
                const result = this.emailValidator.validateEmail(emailData.email);
                return {
                    ...result,
                    rowIndex: emailData.rowIndex,
                    originalRow: emailData.originalRow
                };
            });
            
            this.validationResults.push(...batchResults);
            
            // Update progress
            const progress = Math.min(100, ((i + batchSize) / total) * 100);
            this.updateProgress(progress, i + batchSize, total);
            
            // Small delay to prevent UI blocking
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // Final progress update
        this.updateProgress(100, total, total);
    }

    // Show progress section
    showProgressSection() {
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('progressSection').classList.add('fade-in');
    }

    // Hide progress section
    hideProgressSection() {
        document.getElementById('progressSection').style.display = 'none';
    }

    // Update progress bar
    updateProgress(percentage, processed, total) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const processedCount = document.getElementById('processedCount');
        
        progressFill.style.width = percentage + '%';
        progressText.textContent = Math.round(percentage) + '% Complete';
        processedCount.textContent = `${processed} / ${total} emails processed`;
    }

    // Show results section
    showResults() {
        this.hideProgressSection();
        
        // Calculate statistics
        const stats = this.calculateStatistics();
        
        // Update statistics dashboard
        this.updateStatistics(stats);
        
        // Initialize results table
        this.filteredResults = [...this.validationResults];
        this.renderResultsTable();
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('resultsSection').classList.add('slide-up');
    }

    // Calculate validation statistics
    calculateStatistics() {
        const total = this.validationResults.length;
        const valid = this.validationResults.filter(r => r.isValid).length;
        const invalid = total - valid;
        const bankingCompliant = this.validationResults.filter(r => r.isBankingCompliant === 'Yes').length;
        
        return { total, valid, invalid, bankingCompliant };
    }

    // Update statistics dashboard
    updateStatistics(stats) {
        document.getElementById('totalEmails').textContent = stats.total;
        document.getElementById('validEmails').textContent = stats.valid;
        document.getElementById('invalidEmails').textContent = stats.invalid;
        document.getElementById('bankingCompliant').textContent = stats.bankingCompliant;
    }

    // Apply filters to results
    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        
        this.filteredResults = this.validationResults.filter(result => {
            // Status filter
            let statusMatch = true;
            switch (statusFilter) {
                case 'valid':
                    statusMatch = result.isValid;
                    break;
                case 'invalid':
                    statusMatch = !result.isValid;
                    break;
                case 'banking':
                    statusMatch = result.isBankingCompliant === 'Yes';
                    break;
            }
            
            // Search filter
            const searchMatch = !searchTerm || 
                result.email.toLowerCase().includes(searchTerm) ||
                result.errorDetails.toLowerCase().includes(searchTerm);
            
            return statusMatch && searchMatch;
        });
        
        this.currentPage = 1;
        this.renderResultsTable();
    }

    // Render results table with pagination
    renderResultsTable() {
        const tbody = document.getElementById('resultsTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageResults = this.filteredResults.slice(startIndex, endIndex);
        
        tbody.innerHTML = '';
        
        pageResults.forEach(result => {
            const row = this.createResultRow(result);
            tbody.appendChild(row);
        });
        
        this.updatePaginationInfo();
        this.renderPagination();
    }

    // Create a result table row
    createResultRow(result) {
        const row = document.createElement('tr');
        
        // Email
        const emailCell = document.createElement('td');
        emailCell.textContent = result.email;
        row.appendChild(emailCell);
        
        // Status
        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge ${result.isValid ? 'status-valid' : 'status-invalid'}`;
        statusBadge.textContent = result.isValid ? 'Valid' : 'Invalid';
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);
        
        // Banking Compliant
        const bankingCell = document.createElement('td');
        const bankingBadge = document.createElement('span');
        bankingBadge.className = `status-badge banking-${result.isBankingCompliant.toLowerCase()}`;
        bankingBadge.textContent = result.isBankingCompliant;
        bankingCell.appendChild(bankingBadge);
        row.appendChild(bankingCell);
        
        // Error Details
        const errorCell = document.createElement('td');
        errorCell.textContent = result.errorDetails === 'None' ? '' : result.errorDetails;
        errorCell.title = result.errorDetails; // Tooltip for long errors
        row.appendChild(errorCell);
        
        // Risk Level
        const riskCell = document.createElement('td');
        riskCell.className = `risk-${result.riskLevel.toLowerCase()}`;
        riskCell.textContent = result.riskLevel;
        row.appendChild(riskCell);
        
        return row;
    }

    // Update pagination info
    updatePaginationInfo() {
        const total = this.filteredResults.length;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(startIndex + this.itemsPerPage - 1, total);
        
        document.getElementById('paginationInfo').textContent = 
            `Showing ${startIndex} - ${endIndex} of ${total} results`;
    }

    // Render pagination controls
    renderPagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredResults.length / this.itemsPerPage);
        
        pagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Previous button
        const prevBtn = this.createPaginationButton('Previous', this.currentPage - 1, this.currentPage === 1);
        pagination.appendChild(prevBtn);
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = this.createPaginationButton(i.toString(), i, false, i === this.currentPage);
            pagination.appendChild(pageBtn);
        }
        
        // Next button
        const nextBtn = this.createPaginationButton('Next', this.currentPage + 1, this.currentPage === totalPages);
        pagination.appendChild(nextBtn);
    }

    // Create pagination button
    createPaginationButton(text, page, disabled, active = false) {
        const button = document.createElement('button');
        button.textContent = text;
        button.disabled = disabled;
        
        if (active) {
            button.classList.add('active');
        }
        
        if (!disabled) {
            button.addEventListener('click', () => {
                this.currentPage = page;
                this.renderResultsTable();
            });
        }
        
        return button;
    }

    // Export results based on type
    async exportResults(type) {
        try {
            let result;
            
            switch (type) {
                case 'valid':
                    result = this.exportUtils.exportValidEmails(this.validationResults);
                    break;
                case 'all':
                    result = this.exportUtils.exportAllResults(this.validationResults);
                    break;
                case 'invalid':
                    result = this.exportUtils.exportInvalidEmails(this.validationResults);
                    break;
                case 'banking':
                    result = this.exportUtils.exportBankingCompliantEmails(this.validationResults);
                    break;
            }
            
            this.showSuccess(`Downloaded ${result.filename} with ${result.count} emails`);
            
        } catch (error) {
            this.showError('Export failed: ' + error.message);
        }
    }

    // Utility functions
    showLoading(message = 'Loading...') {
        // You can implement a loading overlay here
        console.log('Loading:', message);
    }

    hideLoading() {
        // Hide loading overlay
        console.log('Loading complete');
    }

    showError(message) {
        alert('Error: ' + message);
        console.error('Error:', message);
    }

    showSuccess(message) {
        // You can implement a success notification here
        console.log('Success:', message);
        
        // Simple success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 500;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Debounce function for search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Reset application state
    reset() {
        this.currentData = null;
        this.validationResults = [];
        this.filteredResults = [];
        this.currentPage = 1;
        
        // Reset UI
        document.getElementById('filePreview').style.display = 'none';
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
        
        // Clear file input
        document.getElementById('csvFile').value = '';
    }

    // Get validation summary
    getValidationSummary() {
        if (this.validationResults.length === 0) {
            return null;
        }
        
        const stats = this.calculateStatistics();
        const domains = {};
        const errorTypes = {};
        
        this.validationResults.forEach(result => {
            // Domain analysis
            const domain = result.email.split('@')[1];
            if (domain) {
                domains[domain] = (domains[domain] || 0) + 1;
            }
            
            // Error analysis
            if (!result.isValid && result.errorDetails !== 'None') {
                const primaryError = result.errorDetails.split(';')[0]?.trim();
                if (primaryError) {
                    errorTypes[primaryError] = (errorTypes[primaryError] || 0) + 1;
                }
            }
        });
        
        return {
            statistics: stats,
            topDomains: Object.entries(domains)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10),
            commonErrors: Object.entries(errorTypes)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
        };
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.emailValidatorApp = new EmailValidatorApp();
});

// Add some additional CSS for email column highlighting
const additionalStyles = `
    .email-column {
        background-color: rgba(16, 185, 129, 0.1) !important;
        font-weight: 600;
    }
    
    .email-cell {
        background-color: rgba(16, 185, 129, 0.05);
        font-family: monospace;
    }
    
    .email-badge {
        font-size: 0.8em;
        margin-left: 5px;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
