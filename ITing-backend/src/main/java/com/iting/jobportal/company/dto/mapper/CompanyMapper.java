package com.iting.jobportal.company.dto.mapper;

import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.Company;
import org.springframework.stereotype.Component;

@Component
public class CompanyMapper {

    public CompanyResponse toResponse(Company company) {

        if (company == null) {
            return null;
        }

        CompanyResponse res = new CompanyResponse();

        res.setId(company.getId());
        res.setName(company.getName());
        res.setWebsite(company.getWebsite());
        res.setAddress(company.getAddress());
        res.setLogoUrl(company.getLogoUrl());
        res.setDescription(company.getDescription());

        res.setIndustry(company.getIndustry());
        res.setCompanySize(company.getCompanySize());
        res.setPhone(company.getPhone());

        res.setRepresentativeName(company.getRepresentativeName());
        res.setTaxCode(company.getTaxCode());

        res.setVerificationLevel(company.getVerificationLevel());
        res.setCompanyInfoUpdateStatus(company.getCompanyInfoUpdateStatus());

        res.setActive(company.getActive());

        return res;
    }
}