-- Featured/Boosted job fields — paid promotion to top of search results.
ALTER TABLE Job
    ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP,
    ADD COLUMN IF NOT EXISTS featured_tier  VARCHAR(20);  -- BOOST_7D | BOOST_14D | BOOST_30D

-- Index for sort-by-featured queries (partial: only indexed when active)
CREATE INDEX IF NOT EXISTS idx_job_featured_until
    ON Job (featured_until DESC)
    WHERE featured_until IS NOT NULL;
