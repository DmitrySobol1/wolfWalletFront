import { Section, List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';

import axios from '../../axios';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

export const EnterPage: FC = () => {
  const navigate = useNavigate();

  
  // для рендера
  useEffect(() => {

  const initDataState = useSignal(_initDataState);
  const tlgid = initDataState?.user?.id

  // TODO: для тестов
  // const tlgid = 412697670;
  
    axios
      .post('/enter', {
        tlgid: tlgid,
      })
      .then((response) => {
        if (response.data.userData.result === 'showOnboarding') {
          console.log('showOnboarding');
          navigate('/onboarding');
        } else if (response.data.userData.result === 'showWalletPage') {
          console.log('showWalletPage');

          
          navigate('/wallet-page');
        }
      })
      .catch((error) => {
        console.error('Ошибка при выполнении запроса:', error);
      })
      .finally(() => {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      });
  }, []);

 

  return (
    <Page>
      <List>
        <Section>
          
        </Section>
      </List>
    </Page>
  );
};



