import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import jobService from "../../services/jobService";
import { buildJobDetailPath } from "../../utils/jobUrl";

const LegacyJobRedirect = () => {
  const { id } = useParams();
  const [redirectPath, setRedirectPath] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const resolveLegacyUrl = async () => {
      try {
        const job = await jobService.getJobDetailByLegacyId(id);
        if (isMounted) {
          setRedirectPath(buildJobDetailPath(job));
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Không tìm thấy công việc");
        }
      }
    };

    if (id) {
      resolveLegacyUrl();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (error) {
    return <div className="text-center py-20 font-bold text-red-500">{error}</div>;
  }

  return <div className="text-center py-20 font-bold text-gray-500">Đang chuyển hướng...</div>;
};

export default LegacyJobRedirect;
