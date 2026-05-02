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
const CompanyLogo = ({ logoUrl, companyId, companyName = "", alt = "Company Logo", className = "" }) => {
    const [currentLogo, setCurrentLogo] = useState(logoUrl);
    const [hasFailed, setHasFailed] = useState(false);

    useEffect(() => {
        setHasFailed(false);
        setCurrentLogo(logoUrl);
    }, [logoUrl, companyId]);

    useEffect(() => {
        if (!currentLogo && companyId && !hasFailed) {
            const fetchLogo = async () => {
                try {
                    const res = await companyService.getCompanyDetail(companyId);
                    if (res?.logoUrl) {
                        setCurrentLogo(res.logoUrl);
                    } else if (res?.logo) {
                        setCurrentLogo(res.logo);
                    }
                } catch (err) {
                    setHasFailed(true);
                }
            };
            fetchLogo();
        }
    }, [currentLogo, companyId, hasFailed]);

    const fallbackUrl = companyName 
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=3AB4E6&color=fff&bold=true` 
        : "/assets/default-company.png";

    return (
        <img 
            src={getCompanyLogoUrl(currentLogo, companyName)} 
            alt={alt} 
            className={className}
            onError={(e) => {
                e.target.onerror = null; 
                e.target.src = fallbackUrl;
            }}
        />
    );
};

export default CompanyLogo;
