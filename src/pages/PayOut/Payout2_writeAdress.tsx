import {
  Section,
  List,
  Cell,
  Input,
  Tappable,
  Button,
  Spinner,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';

// import { settingsButton } from '@telegram-apps/sdk';

import axios from '../../axios';

import { Page } from '@/components/Page.tsx';
// import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

import { Icon28CloseAmbient } from '@telegram-apps/telegram-ui/dist/icons/28/close_ambient';
import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';
// import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
// import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';

import styles from './payout.module.css';
import { TEXTS } from './texts.ts';

export const Payout2_writeAdress: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { coin, amount } = location.state || {};

  const [adress, setAdress] = useState('');
  const [sum, setSum] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { language } = useContext(LanguageContext);
  //   const { balance } = useContext(TotalBalanceContext);

  //FIXME: если переносить на несколько строк, возникает ошибка!!!
  // @ts-ignore
  const {title2,balanceT,comissionT,adressT,adress_sub,sumT,sumT_sub,max,nextbtn,errorEmpty,errorNotValid,errorSumEpmty,errorSumTooBig,} = TEXTS[language];

  function adressHandler(e: any) {
    setAdress(e.target.value);
    setShowError(false);
  }

  function sumHandler(e: any) {
    setSum(e.target.value);
    setShowError(false);
  }

  async function nextBtnHandler() {
    setIsLoading(true)
    let checkAdress = false;
    let checkSum = false;

    try {
      if (adress === '') {
        setErrorText(errorEmpty);
        setShowError(true);
        return;
      }

      const response = await axios.post('/validate_adress', {
        adress: adress,
        coin: coin,
      });

      if (response.data === 'OK') {
        checkAdress = true;
        console.log('adress OKK');
      }
    } catch (error) {
      console.log('here');
      setErrorText(errorNotValid);
      setShowError(true);
      console.error('Ошибка при выполнении запроса:', error);
      return;
    } finally {
      setIsLoading(false)
    }

    // После окончания асинхронного запроса проверяем сумму
    if (sum === '' || sum === '0') {
      setErrorText(errorSumEpmty);
      setShowError(true);
      return;
    } else if (amount < sum) {
      setErrorText(errorSumTooBig);
      setShowError(true);
      return;
    } else if (amount >= sum) {
      checkSum = true;
    }

    // UQAw8-OzyeUWzkScZsHoFfjuzJD5xsSToteeqR3YPOU8f5uA

    if (checkAdress === false || checkSum === false) {
      setShowError(true);
    }

    if (checkAdress && checkSum) {
      navigate('/payout_3showcomission-page', {
        state: {
          coin,
          sum,
          adress,
        },
      });
    }

    // payout_3showcomission-page
  }

  //FIXME:

  //   const [balances, setBalances] = useState([]);
  //  interface CurrencyDetails {
  //             amount: number;
  //             pendingAmount: number;
  //             balanceTime: string;
  //             currency?:string;
  //         }

  //   const [balances, setBalances] = useState<CurrencyDetails[]>([]);

  // доступный баланс и монеты для вывода
  //FIXME: заменить на нужный ТЛГ id
  // const tlgid = 6;

  // useEffect(() => {
  //     const fetchCoins = async () => {
  //       try {
  //         const response = await axios.get('/get_balance_for_pay_out',{
  //           params : {
  //             tlgid : tlgid
  //           }
  //         });

  //         type Currencies = Record<string, CurrencyDetails>; // Определяем общий тип объекта
  //         const data:Currencies = response.data.result.balances

  //         const resultArray = Object.entries(data).map(([currency, details]) => ({
  //     currency,
  //     amount: details.amount,
  //     pendingAmount: details.pendingAmount,
  //     balanceTime: details.balanceTime
  // }));

  //         // coins = response.data
  //         setBalances(resultArray);
  //         console.log(resultArray)
  //       } catch (error) {
  //         console.error('Ошибка при выполнении запроса:', error);
  //       } finally {
  //         // setShowLoader(false);
  //         // setWolfButtonActive(true);
  //       }
  //     };

  //     fetchCoins();
  //   }, []);

  // function coinBtnHandler(coin:string){
  //   console.log('choosed coin=',coin)
  //   navigate('/payout_1writeadress-page', {
  //     state: {
  //       coin: coin
  //     }
  //   });
  // }

  //FIXME:
  // @ts-ignore
  //   const { title, text } = TEXTS[language];

  //   if (settingsButton.mount.isAvailable()) {
  //     settingsButton.mount();
  //     settingsButton.isMounted(); // true
  //     settingsButton.show();
  //   }

  //   if (settingsButton.onClick.isAvailable()) {
  //     function listener() {
  //       console.log('Clicked!');
  //       navigate('/setting-button-menu');
  //     }
  //     settingsButton.onClick(listener);
  //   }

  return (
    <Page back={true}>
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

      {!isLoading && (
        <List>
          <Section>
            <Cell
              subtitle={
                <span>
                  {amount}{' '}
                  <span className={styles.inputHeaderText}>{coin}</span>
                </span>
              }
            >
              {balanceT}
            </Cell>

            <Cell subtitle={'подтягивать из БД'}>{comissionT}</Cell>
          </Section>

          <Section header={title2}>
            <Input
              status="focused"
              header={adressT}
              placeholder={adress_sub}
              value={adress}
              onChange={(e) => adressHandler(e)}
              after={
                <Tappable
                  Component="div"
                  style={{
                    display: 'flex',
                  }}
                  onClick={() => setAdress('')}
                >
                  <Icon24Close />
                </Tappable>
              }
            />
            <Input
              status="focused"
              header={
                <span>
                  {sumT} <span className={styles.inputHeaderText}>{coin}</span>
                </span>
              }
              placeholder={`${sumT_sub} ${coin}`}
              value={sum}
              onChange={(e) => sumHandler(e)}
              after={
                <Tappable
                  Component="div"
                  style={{
                    display: 'flex',
                    color: '#168acd',
                    fontWeight: '600',
                  }}
                  onClick={() => setSum(amount)}
                >
                  {max}
                </Tappable>
              }
            />

            {showError && (
              <Cell before={<Icon28CloseAmbient />}>
                <span className={styles.errorText}>{errorText}</span>{' '}
              </Cell>
            )}

            <Cell>
              <Button mode="filled" size="m" onClick={nextBtnHandler}>
                {nextbtn}
              </Button>
            </Cell>
          </Section>
        </List>
      )}
    </Page>
  );
};
