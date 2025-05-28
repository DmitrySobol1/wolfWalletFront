import { Section, Cell, List,Button } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { TotalBalanceContext } from '../../components/App.tsx';

import axios from '../../axios';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

export const EnterPage: FC = () => {
  const navigate = useNavigate();

  // const { setBalance } = useContext(TotalBalanceContext);

 




  // для рендера
  useEffect(() => {
     // FIXME:
  const tlgid = 412697670;
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

          // if (response.data.userData.nowpaymentid != 0){
          //   // FIXME: здесь вставить запрос в nowpayment на получение баланса > перенести запрос на walletPage ?
          //   setBalance(600)
          // }

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

  async function getHndl(){
   const response = await axios
      .get('/gettest')
      console.log(response.data)
  }
  
  async function postHndl(){
   const response = await axios
      .post('/posttest')
      console.log(response.data)
  }

  return (
    <Page>
      <List>
        <Section header="Enter Page" footer="Enter Page footer">
          <Cell subtitle="User data, chat information, technical data">
            enter page cell{' '}
          </Cell>
          <Button onClick={getHndl}>get btn</Button>
          <Button onClick={postHndl}>post btn</Button>
        </Section>
      </List>
    </Page>
  );
};



