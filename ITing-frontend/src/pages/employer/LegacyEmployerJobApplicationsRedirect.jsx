import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import jobService from "../../services/jobService";
import { buildEmployerJobApplicationsPath } from "../../utils/jobUrl";

const LegacyEmployerJobApplicationsRedirect = () => {
  const { id } = useParams();
  const [redirectPath, setRedirectPath] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const resolveLegacyUrl = async () => {
      try {
        const job = await jobService.getJobDetailByLegacyId(id);
        if (isMounted) {
          setRedirectPath(buildEmployerJobApplicationsPath(job));
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Không tìm thấy tin tuyển dụng");
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

export default LegacyEmployerJobApplicationsRedirect;
