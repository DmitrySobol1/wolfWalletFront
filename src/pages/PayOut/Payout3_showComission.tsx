import { Section, List, Button, Cell } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
// import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';

// import { settingsButton } from '@telegram-apps/sdk';

import axios from '../../axios';

import { Page } from '@/components/Page.tsx';
// import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

// import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
// import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';
// import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
// import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';

// import { TEXTS } from './texts.ts';

export const Payout3_showComission: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { coin, sum, adress } = location.state || {};

  const [comission, setComission] = useState('');
  const [toSend, setToSend] = useState(0);
  const [showError,setShowError] = useState(false);

  //  FIXME:
  const tlgid = 12345;

  //   const { language } = useContext(LanguageContext);
  //   const { balance } = useContext(TotalBalanceContext);

  useEffect(() => {
    const fetchComission = async () => {
      try {
        const response = await axios.get('/get_comission', {
          params: {
            coin: coin,
          },
        });

        // setCoins(response.data.selectedCurrencies);
        console.log('comission=', response.data.comission.qty);
        setComission(response.data.comission.qty);

        setToSend(Number(sum) - Number(response.data.comission.qty));
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchComission();
  }, []);

  async function cnfBtnHandler() {
    try {
      const response:any = await axios.post('/rqst_to_payout', {
        coin,
        toSend,
        tlgid,
        adress
      });
        
      console.log(response)

      if (response.data.status === 'OK') {
        navigate('/payout_4success-page', {
          state: {
            toSend,
            coin,
          },
        });
      } else {
        setShowError(true)
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    } finally {
      // setShowLoader(false);
      // setWolfButtonActive(true);
    }
  }

  function goToWalletHandler() {
    navigate('/wallet-page');
  }

  //   async function nextBtnHandler() {
  //     let checkAdress = false;
  //     let checkSum = false;

  //     try {
  //       const response = await axios.post('/validate_adress', {
  //         adress: adress,
  //         coin: coin,
  //       });

  //       if (response.data === 'OK') {
  //         checkAdress = true;
  //       }
  //     } catch (error) {
  //       console.error('Ошибка при выполнении запроса:', error);
  //     } finally {
  //       // Логика после выполнения запроса
  //       // setShowLoader(false);
  //       // setWolfButtonActive(true);
  //     }

  //     // После окончания асинхронного запроса проверяем сумму
  //     if (amount >= sum) {
  //       checkSum = true;
  //     }

  //     if (checkAdress || checkSum) {
  //       setShowError(true);
  //     }
  //     console.log('adress=', checkAdress, 'sum=', checkSum);
  //   }

  //FIXME:

  //   const [balances, setBalances] = useState([]);
  //  interface CurrencyDetails {
  //             amount: number;
  //             pendingAmount: number;
  //             balanceTime: string;
  //             currency?:string;
  //         }

  //   const [balances, setBalances] = useState<CurrencyDetails[]>([]);

  return (
    <Page>
      <List>
        {showError == false && 
        <Section header="Подтвердите данные">
          Общая сумма = {sum} {coin}
          Комиссия = {comission} {coin}
          Отправка = {toSend}
          Кому = {adress}
          <Button mode="filled" size="m" onClick={cnfBtnHandler}>
            Подтвердить
          </Button>
        </Section>
        }
        {showError && (
          <Section>
            <>
              <Cell subtitle="вернитесь в кошелек и повторите вывод">
                Что-то пошло не так...{' '}
              </Cell>
              <Button mode="filled" size="m" onClick={goToWalletHandler}>
                Вернуться в кошелек
              </Button>
            </>
          </Section>
        )}
      </List>
    </Page>
  );
};
