import { Section, List, Spinner } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from '../../axios';

import { useTlgid } from '../../components/Tlgid';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

import {TryLater} from '../../components/TryLater/TryLater.tsx'

export const EnterPage: FC = () => {
  const navigate = useNavigate();

  const tlgid = useTlgid();

  const [showTryLater, setShowTryLater] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  // для рендера
  // useEffect(() => {
    

  //   axios
  //     .post('/enter', {tlgid: tlgid,})
  //     .then((response) => {
  //       if (response.data.userData.result === 'showOnboarding') {
  //         console.log('showOnboarding');

  //         const nowpaymentid = response.data.userData.nowpaymentid;
          
  //         navigate('/onboarding', {
  //           state: {
  //             nowpaymentid: nowpaymentid,
  //           },
  //         });
  //         // navigate('/onboarding');
  //       } else if (response.data.userData.result === 'showWalletPage') {
  //         console.log('showWalletPage');
  //         const nowpaymentid = response.data.userData.nowpaymentid;
  //         // console.log('!!!!!!!nowpaymentid=',nowpaymentid)
  //         navigate('/wallet-page', {
  //           state: {
  //             nowpaymentid: nowpaymentid,
  //           },
  //         });
  //         // navigate('/wallet-page');
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Ошибка при выполнении запроса:', error);
  //     })
  //     .finally(() => {
  //       // setShowLoader(false);
  //       // setWolfButtonActive(true);
  //     });
  // }, []);


  useEffect(() => {
    const fetchEnter = async () => {
      try {
        const response = await axios.post('/system/enter', {tlgid: tlgid,});
      
        if (!response || response.data.statusBE === 'notOk'){
          setShowTryLater(true);
          setIsLoading(false)
        }

        const { result, nowpaymentid  } = response.data.userData

        if (result === 'showOnboarding') {
          console.log('showOnboarding');

          // const nowpaymentid = response.data.userData.nowpaymentid;
          
          navigate('/onboarding', {
            state: {
              nowpaymentid,
            },
          });
        } else if (result === 'showWalletPage') {
          console.log('showWalletPage');
          // const nowpaymentid = response.data.userData.nowpaymentid;
          navigate('/wallet-page', {
            state: {
              nowpaymentid,
            },
          });
        }


      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        setShowTryLater(true);
        setIsLoading(false)
      } 
    };
    fetchEnter();
  }, []);

  return (
    <Page>
       {isLoading && (
               <div
                 style={{
                   textAlign: 'center',
                   justifyContent: 'center',
                   padding: '100px',
                 }}
               >
                 <Spinner size="m" />
               </div>
             )}

       {showTryLater && <TryLater/>}

      <List>
        <Section></Section>
      </List>
    </Page>
  );
};
