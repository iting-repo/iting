import { useState, useEffect } from 'react';

/**
 * Hook to handle fetching a presigned URL for an S3 resource.
 * @param {Function} fetchFn The service function to call (e.g. companyService.getLogoPresignedUrl)
 * @param {Array} params Array of parameters for the fetch function
 * @param {any} dependency Dependency to trigger re-fetch (e.g. s3Key)
 */
const usePresignedUrl = (fetchFn, params = [], dependency = null) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no dependency (like s3Key) and no data, don't fetch
    if (dependency === false || dependency === "") {
        setUrl(null);
        return;
    }

    const fetchUrl = async () => {
      try {
        setLoading(true);
        const res = await fetchFn(...params);
        setUrl(res?.url || res);
      } catch (err) {
        console.error("Error fetching presigned URL:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUrl();
  }, [dependency, ...params]);

  return { url, loading, error };
};

export default usePresignedUrl;
