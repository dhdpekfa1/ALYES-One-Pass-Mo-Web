import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ORG_ID_REGEX } from '@/shared/model';

export const useOrgId = (): string | undefined => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const urlOrgId = params.get('orgId');
  const storedOrgId = sessionStorage.getItem('orgId');

  useEffect(() => {
    const validUrl = ORG_ID_REGEX.test(urlOrgId ?? '');
    const validStored = ORG_ID_REGEX.test(storedOrgId ?? '');

    // URL에 있으면 스토리지에 캐시
    if (validUrl) {
      if (storedOrgId !== urlOrgId) {
        sessionStorage.setItem('orgId', urlOrgId!);
      }
      return;
    }

    // URL에 없고 스토리지에만 있으면 URL 정규화
    if (validStored) {
      navigate(`/?orgId=${storedOrgId}`, { replace: true });
    }
  }, [urlOrgId, storedOrgId, navigate]);

  return useMemo(() => {
    const validUrl = ORG_ID_REGEX.test(urlOrgId ?? '');
    const validStored = ORG_ID_REGEX.test(storedOrgId ?? '');
    if (validUrl) return urlOrgId!;
    if (validStored) return storedOrgId!;
    return undefined;
  }, [urlOrgId, storedOrgId]);
};
