package com.iting.jobportal.company.dto.mapper;

import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.Company;
import org.springframework.stereotype.Component;

@Component
public class CompanyMapper {

    public CompanyResponse toResponse(Company company) {

        CompanyResponse res = new CompanyResponse();

        res.setId(company.getId());
        res.setName(company.getName());
        res.setLogoUrl(company.getLogoUrl());
        res.setAddress(company.getAddress());
        res.setIndustry(company.getIndustry());
        res.setActive(company.getActive());

        return res;
    }

}