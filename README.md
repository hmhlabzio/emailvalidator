# Email Validator - Indian Banking Norms

A comprehensive web-based email validation tool that validates emails against standard formats and Indian banking compliance requirements.

## Features

### 🎯 Core Functionality
- **CSV File Upload**: Support for both single-column and multi-column CSV formats
- **Drag & Drop Interface**: Easy file upload with visual feedback
- **Auto-Detection**: Automatically detects email columns in CSV files
- **Real-time Validation**: Progress tracking during validation process
- **Comprehensive Results**: Detailed validation results with error explanations

### 🏦 Indian Banking Compliance
- **RBI Guidelines**: Validates against Reserve Bank of India email standards
- **Banking Domain Recognition**: Recognizes major Indian banks (SBI, HDFC, ICICI, etc.)
- **Government Domain Support**: Validates .gov.in and .nic.in domains
- **KYC Compliance**: Checks for banking industry email standards
- **Risk Assessment**: Categorizes emails by risk level (Low, Medium, High)

### 📊 Validation Checks
- **Basic Format**: RFC 5322 compliance, @ symbol validation, domain structure
- **Security Checks**: Detects disposable emails, suspicious patterns, SQL injection attempts
- **Domain Validation**: TLD verification, domain format checks
- **Character Validation**: Ensures proper character usage for banking standards

### 📈 Results & Analytics
- **Statistics Dashboard**: Visual summary of validation results
- **Filtering & Search**: Filter by status, search by email or error details
- **Pagination**: Efficient handling of large datasets
- **Risk Level Analysis**: Color-coded risk indicators

### 📥 Export Options
- **Valid Emails CSV**: Clean list of validated emails only
- **Complete Results CSV**: Detailed validation results with all data
- **Invalid Emails CSV**: Failed emails with error explanations
- **Banking Compliant CSV**: Emails meeting Indian banking standards
- **Excel Reports**: Comprehensive validation reports

## Supported Banking Domains

### Public Sector Banks
- State Bank of India (sbi.co.in)
- Punjab National Bank (pnb.co.in)
- Bank of Baroda (bankofbaroda.com)
- Canara Bank (canarabank.com)
- Union Bank of India (unionbankofindia.co.in)
- Indian Bank (indianbank.in)
- Bank of India (boi.co.in)
- Central Bank of India (centralbankofindia.co.in)

### Private Sector Banks
- HDFC Bank (hdfcbank.com)
- ICICI Bank (icicibank.com)
- Axis Bank (axisbank.com)
- Kotak Mahindra Bank (kotakbank.com)
- Yes Bank (yesbank.in)
- IndusInd Bank (indusind.com)
- Federal Bank (federalbank.co.in)

### Payment Banks
- Paytm Payments Bank (paytm.com)
- Airtel Payments Bank (airtel.in)
- Jio Payments Bank (jio.com)

### Government & Regulatory
- Reserve Bank of India (rbi.org.in)
- SEBI (sebi.gov.in)
- NPCI (npci.org.in)
- All .gov.in and .nic.in domains

## How to Use

### 1. Upload CSV File
- Click "Browse Files" or drag & drop your CSV file
- Supported formats: single column (emails only) or multi-column
- Maximum file size: 10MB

### 2. Preview & Column Selection
- Review the file preview showing first 10 rows
- If multiple columns detected, select the email column
- Auto-detection highlights likely email columns

### 3. Start Validation
- Click "Start Validation" to begin the process
- Watch real-time progress as emails are validated
- Processing is done in batches for optimal performance

### 4. Review Results
- View comprehensive statistics dashboard
- Browse detailed results table with pagination
- Use filters to focus on specific validation outcomes
- Search for specific emails or error types

### 5. Export Results
- **Download Valid Emails**: Get clean list of validated emails
- **Download All Results**: Complete validation report
- **Download Invalid Emails**: Failed emails with error details
- **Download Banking Compliant**: Emails meeting banking standards

## CSV File Format

### Single Column Format
```csv
Email
user@sbi.co.in
customer@hdfcbank.com
admin@icicibank.com
```

### Multi-Column Format
```csv
Name,Email,Phone,Department
John Doe,john@sbi.co.in,9876543210,Finance
Jane Smith,jane@hdfcbank.com,9876543211,HR
```

## Validation Results

### Status Indicators
- ✅ **Valid**: Email passes all validation checks
- ❌ **Invalid**: Email fails one or more validation checks

### Banking Compliance
- 🏦 **Yes**: Email from recognized Indian banking domain
- ⚠️ **Partial**: Email from trusted but non-banking domain
- ❌ **No**: Email from unrecognized domain

### Risk Levels
- 🟢 **Low**: Minimal risk, high confidence
- 🟡 **Medium**: Some concerns, moderate confidence
- 🔴 **High**: Significant issues, low confidence

## Technical Specifications

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### File Requirements
- Format: CSV (.csv extension)
- Size: Maximum 10MB
- Encoding: UTF-8 recommended
- Delimiters: Comma, semicolon, tab, or pipe

### Performance
- Processes up to 10,000 emails efficiently
- Batch processing prevents browser freezing
- Real-time progress tracking
- Client-side processing (no data sent to servers)

## Privacy & Security

### Data Protection
- **Client-Side Processing**: All validation happens in your browser
- **No Server Upload**: CSV data never leaves your computer
- **No Data Storage**: No emails or results are stored anywhere
- **Secure Validation**: Protection against malicious email patterns

### Security Features
- SQL injection pattern detection
- Script tag filtering
- Disposable email domain detection
- Suspicious pattern recognition

## Error Types & Solutions

### Common Validation Errors
1. **Missing @ Symbol**: Email must contain exactly one @ symbol
2. **Invalid Domain Format**: Domain must follow proper structure
3. **Invalid Characters**: Contains characters not allowed in emails
4. **Too Short/Long**: Email length outside acceptable range
5. **Consecutive Dots**: Multiple dots in sequence not allowed

### Banking Compliance Issues
1. **Non-Banking Domain**: Email not from recognized banking institution
2. **Suspicious Domain**: Email from temporary/disposable service
3. **Format Non-Compliance**: Doesn't meet banking industry standards

## Troubleshooting

### File Upload Issues
- Ensure file has .csv extension
- Check file size is under 10MB
- Verify CSV format is valid
- Try different delimiter if parsing fails

### Validation Problems
- Ensure email column is properly selected
- Check for empty rows in CSV
- Verify CSV encoding (UTF-8 recommended)

### Export Issues
- Enable downloads in browser settings
- Check popup blocker settings
- Ensure sufficient disk space

## Browser Requirements

### Required Features
- File API support
- Blob/URL creation
- ES6 JavaScript support
- CSS Grid and Flexbox

### Recommended Settings
- JavaScript enabled
- Pop-up blocker disabled for downloads
- Sufficient memory for large files

## Support

For technical support or feature requests, please check the browser console for error messages and ensure your browser meets the minimum requirements.

## Version History

### v1.0.0 (Current)
- Initial release
- Complete email validation engine
- Indian banking norms compliance
- CSV upload and processing
- Multiple export formats
- Responsive design
- Real-time progress tracking

---

**Note**: This tool is designed for email validation purposes and should be used in compliance with applicable data protection and privacy laws.
