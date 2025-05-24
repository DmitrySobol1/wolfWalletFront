import {
  Section,
  List,
  Cell,
  Input,
  Tappable,
  Button,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import { useState } from 'react';
// import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';

// import { settingsButton } from '@telegram-apps/sdk';

import axios from '../../axios';

import { Page } from '@/components/Page.tsx';
// import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

// import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';
// import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
// import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';

// import { TEXTS } from './texts.ts';

export const Payout2_writeAdress: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { coin, amount } = location.state || {};

  const [adress, setAdress] = useState('');
  const [sum, setSum] = useState('');
  const [showError, setShowError] = useState(false);

  //   const { language } = useContext(LanguageContext);
  //   const { balance } = useContext(TotalBalanceContext);

  function adressHandler(e: any) {
    setAdress(e.target.value);
    setShowError(false);
  }

  function sumHandler(e: any) {
    setSum(e.target.value);
    setShowError(false);
  }

  async function nextBtnHandler() {
    let checkAdress = false;
    let checkSum = false;

    try {
      const response = await axios.post('/validate_adress', {
        adress: adress,
        coin: coin,
      });

      if (response.data === 'OK') {
        checkAdress = true;
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    } finally {
      // Логика после выполнения запроса
      // setShowLoader(false);
      // setWolfButtonActive(true);
    }

    // После окончания асинхронного запроса проверяем сумму
    if (amount >= sum) {
      checkSum = true;
    }

    if (checkAdress===false || checkSum===false) {
      setShowError(true);
    }
    
    if (checkAdress && checkSum) {
      navigate('/payout_3showcomission-page', {
      state: { 
        coin,
        sum,
        adress
      }
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
    <Page>
      <List>
        <Section header="Уважите адрес и сумму для вывода">
          coin = {coin}
          amount={amount}
          {/* <Cell subtitle={text}>
              lang={language} баланс={balance}{' '}
            </Cell> */}
          <Cell>
            <Input
              status="focused"
              header="Адрес"
              placeholder="Укажите адрес"
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
              header={`Сумма ${coin}`}
              placeholder={`Укажите сумму в ${coin}`}
              value={sum}
              onChange={(e) => sumHandler(e)}
              after={
                <Tappable
                  Component="div"
                  style={{
                    display: 'flex',
                    color: '#168acd',
                  }}
                  onClick={() => setSum(amount)}
                >
                  Макс
                </Tappable>
              }
            />
          </Cell>
           {showError && <Cell>Ошибка! </Cell>}
          <Cell>
            <Button mode="filled" size="m" onClick={nextBtnHandler}>
              Продолжить
            </Button>
          </Cell>
         
        </Section>
      </List>
    </Page>
  );
};
