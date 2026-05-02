-- Fix legacy values for education_summary
UPDATE candidate_profiles 
SET education_summary = CASE 
    WHEN education_summary LIKE '%Trung học%' THEN 'HIGH_SCHOOL'
    WHEN education_summary LIKE '%Cao đẳng%' THEN 'ASSOCIATE'
    WHEN education_summary LIKE '%Đại học%' THEN 'BACHELOR'
    WHEN education_summary LIKE '%Thạc sĩ%' THEN 'MASTER'
    WHEN education_summary LIKE '%Tiến sĩ%' THEN 'DOCTORATE'
    ELSE 'OTHER'
END
WHERE education_summary IS NOT NULL;
