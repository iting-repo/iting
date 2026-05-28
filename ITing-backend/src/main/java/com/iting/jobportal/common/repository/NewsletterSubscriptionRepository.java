package com.iting.jobportal.common.repository;

import com.iting.jobportal.common.entity.NewsletterSubscription;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsletterSubscriptionRepository
    extends JpaRepository<NewsletterSubscription, Long> {

  Optional<NewsletterSubscription> findByEmail(String email);

  Optional<NewsletterSubscription> findByUnsubscribeToken(String token);

  long countByUnsubscribedAtIsNull();
}
