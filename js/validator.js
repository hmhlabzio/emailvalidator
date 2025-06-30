// Email Validator with Indian Banking Norms
class EmailValidator {
    constructor() {
        this.indianBankDomains = new Set([
            // Public Sector Banks
            'sbi.co.in', 'statebankofindia.com', 'onlinesbi.com',
            'pnb.co.in', 'pnbindia.in',
            'bankofbaroda.com', 'bankofbaroda.co.in',
            'canarabank.com', 'canarabank.in',
            'unionbankofindia.co.in', 'unionbankofindia.com',
            'indianbank.in', 'indianbank.net.in',
            'boi.co.in', 'bankofindia.co.in',
            'centralbankofindia.co.in',
            'indianoverseasbank.com',
            'ucobank.com', 'ucobank.co.in',
            'bankofmaharashtra.in',
            'punjabsind.com',
            
            // Private Sector Banks
            'hdfcbank.com', 'hdfc.com',
            'icicibank.com', 'icici.com',
            'axisbank.com', 'axisbank.co.in',
            'kotakbank.com', 'kotak.com',
            'yesbank.in', 'yesbank.co.in',
            'indusind.com', 'indusindbank.com',
            'federalbank.co.in',
            'southindianbank.com',
            'karurbank.com',
            'cityunionbank.com',
            'dcbbank.com',
            'rblbank.com',
            'bandhanbank.com',
            'idfcfirstbank.com',
            
            // Foreign Banks in India
            'standardchartered.co.in',
            'citibank.co.in', 'citiindia.com',
            'hsbc.co.in',
            'deutschebank.co.in',
            'abnamro.co.in',
            'barclays.co.in',
            
            // Regional Rural Banks
            'andhragraminvikas.co.in',
            'apgvb.in',
            'kgb.co.in',
            'prathama.co.in',
            
            // Cooperative Banks
            'saraswabank.com',
            'apexbank.in',
            'dccb.com',
            
            // Payment Banks
            'paytm.com',
            'airtel.in',
            'jio.com',
            'fino.in',
            
            // Small Finance Banks
            'equitasbank.com',
            'esafbank.com',
            'ujjivanbank.com',
            'capitalbank.co.in',
            'suryodaybank.com',
            
            // NBFC and Financial Services
            'bajajfinserv.in',
            'mahindrafinance.com',
            'tatacapital.com',
            'lntecc.com',
            'shriramcity.com',
            
            // Government Domains
            'gov.in', 'nic.in', 'rbi.org.in',
            'sebi.gov.in', 'irda.gov.in',
            'npci.org.in', 'cersai.org.in'
        ]);

        this.trustedDomains = new Set([
            // Educational Institutions
            'iitb.ac.in', 'iitd.ac.in', 'iitk.ac.in', 'iitm.ac.in',
            'iisc.ac.in', 'iimb.ac.in', 'iima.ac.in',
            'du.ac.in', 'jnu.ac.in', 'bhu.ac.in',
            
            // Corporate Domains
            'tcs.com', 'infosys.com', 'wipro.com',
            'hcl.com', 'techm.com', 'mindtree.com',
            'reliance.com', 'adani.com', 'tatasteel.com',
            'bhartiairtel.in', 'idea.in', 'vodafone.in',
            
            // International Trusted
            'gmail.com', 'yahoo.com', 'outlook.com',
            'hotmail.com', 'live.com', 'icloud.com'
        ]);

        this.suspiciousDomains = new Set([
            'tempmail.org', '10minutemail.com', 'guerrillamail.com',
            'mailinator.com', 'throwaway.email', 'temp-mail.org',
            'fakeinbox.com', 'maildrop.cc', 'sharklasers.com',
            'bltiwd.com'
        ]);

        // RBI Email Guidelines Patterns
        this.rbiPatterns = {
            // Corporate email pattern
            corporate: /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/,
            
            // No consecutive dots
            noConsecutiveDots: /^[^.]*(\.[^.]*)*$/,
            
            // Valid characters only
            validChars: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            
            // Minimum length requirements
            minLength: /.{6,}/,
            
            // Maximum length requirements
            maxLength: /^.{1,254}$/
        };
    }

    // Main validation function
    validateEmail(email) {
        const result = {
            email: email.trim().toLowerCase(),
            isValid: false,
            isBankingCompliant: 'No',
            errorDetails: [],
            riskLevel: 'High',
            validationChecks: {}
        };

        try {
            // Basic format validation
            result.validationChecks.basicFormat = this.validateBasicFormat(result.email);
            
            // RFC 5322 compliance
            result.validationChecks.rfcCompliance = this.validateRFCCompliance(result.email);
            
            // RBI guidelines
            result.validationChecks.rbiCompliance = this.validateRBIGuidelines(result.email);
            
            // Domain validation
            result.validationChecks.domainValidation = this.validateDomain(result.email);
            
            // Banking domain check
            result.validationChecks.bankingDomain = this.checkBankingDomain(result.email);
            
            // Security checks
            result.validationChecks.securityCheck = this.performSecurityChecks(result.email);
            
            // Determine overall validity
            result.isValid = this.determineValidity(result.validationChecks);
            
            // Determine banking compliance
            result.isBankingCompliant = this.determineBankingCompliance(result.validationChecks);
            
            // Calculate risk level
            result.riskLevel = this.calculateRiskLevel(result.validationChecks);
            
            // Compile error details
            result.errorDetails = this.compileErrorDetails(result.validationChecks);

        } catch (error) {
            result.errorDetails.push('Validation error: ' + error.message);
            result.riskLevel = 'High';
        }

        return result;
    }

    validateBasicFormat(email) {
        const checks = {
            hasAtSymbol: email.includes('@'),
            singleAtSymbol: (email.match(/@/g) || []).length === 1,
            hasLocalPart: email.split('@')[0]?.length > 0,
            hasDomainPart: email.split('@')[1]?.length > 0,
            validLength: email.length >= 6 && email.length <= 254
        };

        return {
            passed: Object.values(checks).every(check => check),
            details: checks,
            errors: this.getBasicFormatErrors(checks)
        };
    }

    validateRFCCompliance(email) {
        const rfcPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        const checks = {
            rfcPattern: rfcPattern.test(email),
            noLeadingDot: !email.startsWith('.'),
            noTrailingDot: !email.endsWith('.'),
            noConsecutiveDots: !/\.\./.test(email),
            validLocalChars: this.validateLocalPartChars(email.split('@')[0] || ''),
            validDomainChars: this.validateDomainPartChars(email.split('@')[1] || '')
        };

        return {
            passed: Object.values(checks).every(check => check),
            details: checks,
            errors: this.getRFCErrors(checks)
        };
    }

    validateRBIGuidelines(email) {
        const checks = {
            corporatePattern: this.rbiPatterns.corporate.test(email),
            noConsecutiveDots: this.rbiPatterns.noConsecutiveDots.test(email.split('@')[0] || ''),
            validCharsOnly: this.rbiPatterns.validChars.test(email),
            minLength: this.rbiPatterns.minLength.test(email),
            maxLength: this.rbiPatterns.maxLength.test(email),
            noSpecialStart: !/^[._-]/.test(email),
            noSpecialEnd: !/[._-]@/.test(email)
        };

        return {
            passed: Object.values(checks).every(check => check),
            details: checks,
            errors: this.getRBIErrors(checks)
        };
    }

    validateDomain(email) {
        const domain = email.split('@')[1] || '';
        
        const checks = {
            hasDomain: domain.length > 0,
            validDomainFormat: /^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/.test(domain),
            hasTLD: domain.includes('.') && domain.split('.').pop().length >= 2,
            validTLD: /\.[a-zA-Z]{2,}$/.test(domain),
            notNumericTLD: !/\.\d+$/.test(domain),
            domainLength: domain.length >= 4 && domain.length <= 253
        };

        return {
            passed: Object.values(checks).every(check => check),
            details: checks,
            errors: this.getDomainErrors(checks),
            domain: domain
        };
    }

    checkBankingDomain(email) {
        const domain = email.split('@')[1] || '';
        
        const checks = {
            isIndianBank: this.indianBankDomains.has(domain),
            isTrustedDomain: this.trustedDomains.has(domain),
            isGovernmentDomain: domain.endsWith('.gov.in') || domain.endsWith('.nic.in'),
            isEducationalDomain: domain.endsWith('.ac.in') || domain.endsWith('.edu.in'),
            isCorporateDomain: this.isCorporateDomain(domain),
            isNotSuspicious: !this.suspiciousDomains.has(domain)
        };

        return {
            passed: checks.isIndianBank || checks.isTrustedDomain || checks.isGovernmentDomain,
            details: checks,
            errors: this.getBankingDomainErrors(checks),
            bankingLevel: this.getBankingComplianceLevel(checks)
        };
    }

    performSecurityChecks(email) {
        const checks = {
            notDisposable: !this.suspiciousDomains.has(email.split('@')[1] || ''),
            noSuspiciousPatterns: !this.hasSuspiciousPatterns(email),
            validCharacterSet: !/[<>\"'%;()&+]/.test(email),
            noSQLInjection: !this.hasSQLInjectionPatterns(email),
            noScriptTags: !/<script|javascript:/i.test(email)
        };

        return {
            passed: Object.values(checks).every(check => check),
            details: checks,
            errors: this.getSecurityErrors(checks)
        };
    }

    // Helper methods for validation
    validateLocalPartChars(localPart) {
        return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart);
    }

    validateDomainPartChars(domainPart) {
        return /^[a-zA-Z0-9.-]+$/.test(domainPart);
    }

    isCorporateDomain(domain) {
        const corporatePatterns = [
            /\.com$/i, /\.co\.in$/i, /\.org$/i, /\.net$/i,
            /\.in$/i, /\.biz$/i, /\.info$/i
        ];
        return corporatePatterns.some(pattern => pattern.test(domain));
    }

    hasSuspiciousPatterns(email) {
        const suspiciousPatterns = [
            /test.*test/i, /fake.*fake/i, /temp.*temp/i,
            /\d{10,}/i, /(.)\1{4,}/i, /admin.*admin/i
        ];
        return suspiciousPatterns.some(pattern => pattern.test(email));
    }

    hasSQLInjectionPatterns(email) {
        const sqlPatterns = [
            /union.*select/i, /drop.*table/i, /insert.*into/i,
            /delete.*from/i, /update.*set/i, /exec.*sp_/i
        ];
        return sqlPatterns.some(pattern => pattern.test(email));
    }

    // Determination methods
    determineValidity(checks) {
        return checks.basicFormat.passed && 
               checks.rfcCompliance.passed && 
               checks.domainValidation.passed && 
               checks.securityCheck.passed;
    }

    determineBankingCompliance(checks) {
        if (checks.bankingDomain.details.isIndianBank) {
            return 'Yes';
        } else if (checks.bankingDomain.details.isTrustedDomain || 
                   checks.bankingDomain.details.isGovernmentDomain) {
            return 'Partial';
        }
        return 'No';
    }

    calculateRiskLevel(checks) {
        let riskScore = 0;

        // Basic validation failures
        if (!checks.basicFormat.passed) riskScore += 30;
        if (!checks.rfcCompliance.passed) riskScore += 25;
        if (!checks.rbiCompliance.passed) riskScore += 20;
        if (!checks.domainValidation.passed) riskScore += 25;

        // Security concerns
        if (!checks.securityCheck.passed) riskScore += 40;

        // Banking domain benefits
        if (checks.bankingDomain.details.isIndianBank) riskScore -= 20;
        if (checks.bankingDomain.details.isTrustedDomain) riskScore -= 10;
        if (checks.bankingDomain.details.isGovernmentDomain) riskScore -= 15;

        if (riskScore <= 10) return 'Low';
        if (riskScore <= 30) return 'Medium';
        return 'High';
    }

    getBankingComplianceLevel(checks) {
        if (checks.isIndianBank) return 'Full';
        if (checks.isTrustedDomain || checks.isGovernmentDomain) return 'Partial';
        return 'None';
    }

    // Error compilation methods
    compileErrorDetails(checks) {
        const errors = [];
        
        if (!checks.basicFormat.passed) {
            errors.push(...checks.basicFormat.errors);
        }
        if (!checks.rfcCompliance.passed) {
            errors.push(...checks.rfcCompliance.errors);
        }
        if (!checks.rbiCompliance.passed) {
            errors.push(...checks.rbiCompliance.errors);
        }
        if (!checks.domainValidation.passed) {
            errors.push(...checks.domainValidation.errors);
        }
        if (!checks.bankingDomain.passed) {
            errors.push(...checks.bankingDomain.errors);
        }
        if (!checks.securityCheck.passed) {
            errors.push(...checks.securityCheck.errors);
        }

        return errors.length > 0 ? errors.join('; ') : 'None';
    }

    getBasicFormatErrors(checks) {
        const errors = [];
        if (!checks.hasAtSymbol) errors.push('Missing @ symbol');
        if (!checks.singleAtSymbol) errors.push('Multiple @ symbols');
        if (!checks.hasLocalPart) errors.push('Missing local part');
        if (!checks.hasDomainPart) errors.push('Missing domain part');
        if (!checks.validLength) errors.push('Invalid email length');
        return errors;
    }

    getRFCErrors(checks) {
        const errors = [];
        if (!checks.rfcPattern) errors.push('Invalid RFC format');
        if (!checks.noLeadingDot) errors.push('Starts with dot');
        if (!checks.noTrailingDot) errors.push('Ends with dot');
        if (!checks.noConsecutiveDots) errors.push('Consecutive dots');
        if (!checks.validLocalChars) errors.push('Invalid local characters');
        if (!checks.validDomainChars) errors.push('Invalid domain characters');
        return errors;
    }

    getRBIErrors(checks) {
        const errors = [];
        if (!checks.corporatePattern) errors.push('Non-corporate format');
        if (!checks.noConsecutiveDots) errors.push('Consecutive dots in local part');
        if (!checks.validCharsOnly) errors.push('Invalid characters for banking');
        if (!checks.minLength) errors.push('Too short for banking standards');
        if (!checks.maxLength) errors.push('Too long for banking standards');
        if (!checks.noSpecialStart) errors.push('Starts with special character');
        if (!checks.noSpecialEnd) errors.push('Ends with special character');
        return errors;
    }

    getDomainErrors(checks) {
        const errors = [];
        if (!checks.hasDomain) errors.push('No domain specified');
        if (!checks.validDomainFormat) errors.push('Invalid domain format');
        if (!checks.hasTLD) errors.push('Missing top-level domain');
        if (!checks.validTLD) errors.push('Invalid TLD format');
        if (!checks.notNumericTLD) errors.push('Numeric TLD not allowed');
        if (!checks.domainLength) errors.push('Invalid domain length');
        return errors;
    }

    getBankingDomainErrors(checks) {
        const errors = [];
        if (!checks.isNotSuspicious) errors.push('Suspicious/temporary domain');
        if (!checks.isIndianBank && !checks.isTrustedDomain && !checks.isGovernmentDomain) {
            errors.push('Not from recognized banking/trusted domain');
        }
        return errors;
    }

    getSecurityErrors(checks) {
        const errors = [];
        if (!checks.notDisposable) errors.push('Disposable email domain');
        if (!checks.noSuspiciousPatterns) errors.push('Suspicious email pattern');
        if (!checks.validCharacterSet) errors.push('Contains unsafe characters');
        if (!checks.noSQLInjection) errors.push('Potential SQL injection');
        if (!checks.noScriptTags) errors.push('Contains script tags');
        return errors;
    }
}

// Export for use in other modules
window.EmailValidator = EmailValidator;
