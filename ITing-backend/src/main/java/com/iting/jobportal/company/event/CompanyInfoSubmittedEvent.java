package com.iting.jobportal.company.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CompanyInfoSubmittedEvent extends ApplicationEvent {

    private final Long companyId;
    private final String companyName;

    public CompanyInfoSubmittedEvent(Object source, Long companyId, String companyName) {
        super(source);
        this.companyId = companyId;
        this.companyName = companyName;
    }
}
