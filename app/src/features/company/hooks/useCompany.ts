import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setCompany } from '@/state/authStore';
import { companyService } from '../services/company.service';

export const useCompany = () => {
  const dispatch = useDispatch();
  const companyName = useSelector((state: RootState) => state.auth.companyName);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchCompany = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await companyService.getCompany();
        if (active && data && data.name) {
          dispatch(setCompany({ companyName: data.name }));
        }
      } catch (err: any) {
        if (active) {
          setError(err.response?.data?.error || 'Erro ao carregar empresa');
          console.error('Failed to fetch company details', err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (isAuthenticated && !companyName) {
      fetchCompany();
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated, companyName, dispatch]);

  return {
    companyName,
    loading,
    error,
  };
};
