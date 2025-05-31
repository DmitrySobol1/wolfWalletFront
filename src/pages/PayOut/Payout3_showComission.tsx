import { Section, List, Button, Cell,Spinner } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState,useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';

// import { settingsButton } from '@telegram-apps/sdk';

import axios from '../../axios';

import styles from './payout.module.css';

import { Page } from '@/components/Page.tsx';
// import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

// import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';
import { Icon20Select } from '@telegram-apps/telegram-ui/dist/icons/20/select';
// import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';

import { TEXTS } from './texts.ts';

export const Payout3_showComission: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { coin, sum, adress } = location.state || {};

  const [comission, setComission] = useState('');
  const [toSend, setToSend] = useState(0);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  //  FIXME:
  const tlgid = 412697670;

    const { language } = useContext(LanguageContext);
  //   const { balance } = useContext(TotalBalanceContext);

    //  FIXME:
  // @ts-ignore
  const {title3,totalSum,comissionT,sendText,to,cnfBtn} = TEXTS[language];


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
        setIsLoading(false)
      }
    };

    fetchComission();
  }, []);

  async function cnfBtnHandler() {
    setIsLoading(true)
    try {
      const response: any = await axios.post('/rqst_to_payout', {
        coin,
        toSend,
        tlgid,
        adress,
      });

      console.log(response);

      if (response.data.status === 'OK') {
        navigate('/payout_4success-page', {
          state: {
            toSend,
            coin,
          },
        });
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    } finally {
      setIsLoading(false)
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

          {!isLoading &&
          


      <List>
        {showError == false && (
          <Section header={title3}>
            <Cell
              subtitle={
                <span>
                  {sum} <span className={styles.inputHeaderText}>{coin}</span>
                </span>
              }
            >
              {totalSum}
            </Cell>

            
            <Cell subtitle={
                <span>
                  {comission} <span className={styles.inputHeaderText}>{coin}</span>
                </span>
              }
              before={<Icon16Chevron/>}
              >{comissionT}</Cell>

            
            <Cell subtitle={
                <span>
                  {toSend} <span className={styles.inputHeaderText}>{coin}</span>
                </span>
              }
              before={<Icon20Select/>}>{sendText}</Cell>

            <Cell multiline subtitle={adress}>
              {to}
            </Cell>

            <Cell>
              <Button mode="filled" size="m" onClick={cnfBtnHandler}>
                {cnfBtn}
              </Button>
            </Cell>
          </Section>
        )}
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
      }
    </Page>
  );
};
