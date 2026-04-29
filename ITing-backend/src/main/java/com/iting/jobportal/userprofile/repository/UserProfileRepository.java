package com.iting.jobportal.userprofile.repository;

import com.iting.jobportal.userprofile.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    @Query("""
        select distinct p from UserProfile p
            join fetch p.user u
            join fetch u.account a
            left join fetch p.skills s
        where a.role in (com.iting.jobportal.auth.entity.Enum.Role.CANDIDATE, com.iting.jobportal.auth.entity.Enum.Role.USER)
            and (:onlyAvailable = false or p.openToWork = true)
            and (:location is null or :location = '' or lower(p.location) like lower(concat('%', :location, '%')))
            and (:position is null or :position = '' or lower(p.headline) like lower(concat('%', :position, '%')))
            and (:minExp is null or p.totalExperienceYears >= :minExp)
            and (:maxExp is null or p.totalExperienceYears <= :maxExp)
            and (
                :keyword is null or :keyword = ''
                or lower(u.fullName) like lower(concat('%', :keyword, '%'))
                or lower(a.email) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(p.headline, '')) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(p.shortBio, '')) like lower(concat('%', :keyword, '%'))
                or exists (
                    select 1 from Skill sk
                    where sk.profile = p and lower(sk.name) like lower(concat('%', :keyword, '%'))
                )
            )
            and (
                :skillsEmpty = true
                or exists (
                    select 1 from Skill sk2
                    where sk2.profile = p and sk2.name in :skills
                )
            )
            and (
                :degree is null or :degree = ''
                or exists (
                    select 1 from Education ed
                    where ed.profile = p and lower(coalesce(ed.degree, '')) like lower(concat('%', :degree, '%'))
                )
            )
        """)
    List<UserProfile> employerSearchCandidates(
            @Param("keyword") String keyword,
            @Param("position") String position,
            @Param("location") String location,
            @Param("onlyAvailable") boolean onlyAvailable,
            @Param("minExp") Integer minExp,
            @Param("maxExp") Integer maxExp,
            @Param("degree") String degree,
            @Param("skillsEmpty") boolean skillsEmpty,
            @Param("skills") List<String> skills
    );
}
