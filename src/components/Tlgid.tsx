import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';

export const useTlgid = () => {
  const initDataState = useSignal(_initDataState);
  const tlgid = initDataState?.user?.id;
  return tlgid

};