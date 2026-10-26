import { useEffect, useState } from "react";
import { dashboardApi } from "../api/dashboardApi";

export function useDashboardKpis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    dashboardApi
      .getKpis()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}