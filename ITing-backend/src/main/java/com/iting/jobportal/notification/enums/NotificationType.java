package com.iting.jobportal.notification.enums;

/**
 * Types of notifications in the system
 */
public enum NotificationType {
    // Job-related notifications
    /**
     * New job posted that matches user's profile
     */
    JOB_NEW,
    
    /**
     * Job that matches user's skills and preferences
     */
    JOB_MATCH,
    
    /**
     * Job posting is about to expire
     */
    JOB_EXPIRING_SOON,
    
    /**
     * Job posting has expired
     */
    JOB_EXPIRED,
    
    // Application-related notifications
    /**
     * Application has been viewed by company
     */
    APPLICATION_VIEWED,
    
    /**
     * Application has been accepted
     */
    APPLICATION_ACCEPTED,
    
    /**
     * Application has been rejected
     */
    APPLICATION_REJECTED,
    
    /**
     * Application status changed
     */
    APPLICATION_STATUS_CHANGED,
    
    // Company-related notifications
    /**
     * Company profile was updated
     */
    COMPANY_UPDATE,
    
    /**
     * Company you follow posted a new job
     */
    COMPANY_NEW_JOB,
    
    /**
     * Someone followed your company
     */
    COMPANY_NEW_FOLLOWER,
    
    // Message notifications
    /**
     * New message received
     */
    MESSAGE_NEW,
    
    // System notifications
    /**
     * System announcement
     */
    SYSTEM_ANNOUNCEMENT,
    
    /**
     * Account-related notification
     */
    ACCOUNT_UPDATE,
    
    /**
     * Company has been suspended by admin
     */
    COMPANY_SUSPENDED,

    /**
     * Company suspension has been lifted by admin
     */
    COMPANY_UNSUSPENDED,

    SYSTEM,

    // Admin notifications
    ADMIN_COMPANY_REGISTERED,
    ADMIN_JOB_CREATED,
    ADMIN_REPORT_RECEIVED
}
