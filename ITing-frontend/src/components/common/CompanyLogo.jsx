import React, { useState, useEffect } from 'react';
import { getCompanyLogoUrl } from '../../utils/jobUrl';
import companyService from '../../services/companyService';

/**
 * Component to display company logo with automatic fallback and fetch logic
 * @param {string} logoUrl - Initial logo URL
 * @param {number} companyId - ID of the company to fetch logo if missing
 * @param {string} alt - Alt text
 * @param {string} className - Tailwind CSS classes
 */
const CompanyLogo = ({ logoUrl, companyId, alt = "Company Logo", className = "" }) => {
    const [currentLogo, setCurrentLogo] = useState(logoUrl);

    useEffect(() => {
        // If logo is missing but companyId is present, try to fetch it
        if (!logoUrl && companyId) {
            const fetchLogo = async () => {
                try {
                    const res = await companyService.getCompanyDetail(companyId);
                    if (res?.logoUrl) {
                        setCurrentLogo(res.logoUrl);
                    }
                } catch (err) {
                    // Silently fail, getCompanyLogoUrl will use default placeholder
                    console.warn(`Could not fetch logo for company ${companyId}`);
                }
            };
            fetchLogo();
        } else {
            setCurrentLogo(logoUrl);
        }
    }, [logoUrl, companyId]);

    return (
        <img 
            src={getCompanyLogoUrl(currentLogo)} 
            alt={alt} 
            className={className}
            onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = "/assets/default-company.png";
            }}
        />
    );
};

export default CompanyLogo;
