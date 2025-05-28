import {
  Section,
  Cell,
  List,
  Button,
  Tappable,
  SegmentedControl,
  Divider,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import axios from '../../axios';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../../components/App.tsx';
import { TotalBalanceContext } from '../../components/App.tsx';
import { ValuteContext } from '../../components/App.tsx';

import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

// import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
// import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
// import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';

import styles from './walletpage.module.css';
import { TEXTS } from './texts.ts';

export const WalletPage: FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useContext(LanguageContext);
  const { balance, setBalance } = useContext(TotalBalanceContext);
  const { valute, setValute } = useContext(ValuteContext);

  const [symbol, setSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  //FIXME:
  // @ts-ignore
  const { title, text } = TEXTS[language];

  if (settingsButton.mount.isAvailable()) {
    settingsButton.mount();
    settingsButton.isMounted(); // true
    settingsButton.show();
  }

  if (settingsButton.onClick.isAvailable()) {
    function listener() {
      console.log('Clicked!');
      navigate('/setting-button-menu');
    }
    settingsButton.onClick(listener);
  }

  // для вывода баланса, языка, валюты
  // useEffect(() => {
  //   //FIXME:
  //   const tlgid = 412697670;

  //   // TODO: можно пост на гет испправить, т.к. получаем инфо

  //   const fetchUserInfo = async () => {
  //     try {
  //       const response = await axios.post('/get_user_balance', {
  //         tlgid: tlgid,
  //       });

  //       setLanguage(response.data.language);
  //       setBalance(response.data.balance);
  //       setValute(response.data.valute);
  //       setSymbol(response.data.symbol);

  //       setIsLoading(false)
  //     } catch (error) {
  //       console.error('Ошибка при выполнении запроса:', error);
  //     } finally {
  //       // setShowLoader(false);
  //       // setWolfButtonActive(true);
  //     }
  //   };

  //   fetchUserInfo();
  // }, []);

  // для настройки фронта
  useEffect(() => {
    //FIXME:
    // const tlgid = 412697670;
    setLanguage('ru');
    setBalance(777);
    setValute('eu');
    setSymbol('р');
    setIsLoading(false);
  }, []);

  function payInBtnHandler() {
    navigate('/payin-page');
  }

  function openSettings() {
    navigate('/setting-button-menu');
  }

  function payOutBtnHandler() {
    if (balance === 0) {
      console.log('баланс = 0');
    } else {
      console.log('баланс норм');
      navigate('/payout_1availablelist-page');
    }
  }

  const [selectedTab, setSelectedTab] = useState('tab1');
  const options = [
    { id: 'tab1', label: 'Активы' },
    { id: 'tab2', label: 'Пополения' },
    { id: 'tab3', label: 'Выводы' },
  ];

  function segmentBtnHandler(id: string) {
    setSelectedTab(id);
  }

  type CurrencyDetails = {
  currency: string;
  currency2?: string;     // вместо string | undefined
  amount: number;
  price_usd: number;
  priceInChoosedValute: number;
  pendingAmount?: number; // сделайте поле опциональным
  balance?: number;       // сделайте поле опциональным
};

  const [balances,setBalances] = useState<CurrencyDetails[]>([]);

  // вывод активов
  //FIXME: заменить на нужный ТЛГ id
  const tlgid = 412697670;
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get('/get_balance_for_pay_out', {
          params: {
            tlgid: tlgid,
          },
        });

        // type Currencies = Record<string, CurrencyDetails>; // Определяем общий тип объекта

        console.log('aaa=', response);

  //       const data: Currencies = response.data.arrayOfUserBalanceWithUsdPrice;

  //       const resultArray = Object.entries(data).map(([currency, details]) => ({
  //         currency,
  //         currency2: details.currency,
  //         amount: details.amount,
  //         price_usd: details.price_usd,
  //         priceInChoosedValute: details.price_usd * response.data.fiatKoefficient,
  //           pendingAmount: 0,      
  // balance: 0,  
  //       }));

  //       // coins = response.data
        setBalances(response.data.arrayOfUserBalanceWithUsdPrice);
  //       console.log('result=', resultArray);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchCoins();
  }, []);

  return (
    <Page back={false}>
      {isLoading && <>Загрузка</>}

      {!isLoading && (
        <>
          <List>
            <Section header={title}>
              <Cell></Cell>

              <Cell>
                <div className={styles.balanceText}>
                  {symbol} {balance}
                </div>
                <div>
                  общий баланс в{' '}
                  <Tappable
                    Component="span"
                    className={styles.valuteText}
                    onClick={openSettings}
                  >
                    {valute}
                  </Tappable>
                </div>
              </Cell>

              <Cell>
                баланс={balance}, язык={language}, валюта={valute}
              </Cell>

              {/* <Link to="/init-data">
            <Cell subtitle={text}>
              lang={language} баланс={balance} валюта={valute}
            </Cell>
          </Link> */}

              <div className={styles.divWithButton}>
                <Button mode="filled" size="m" onClick={payInBtnHandler}>
                  Пополнить
                </Button>
                <Button mode="filled" size="m" onClick={payOutBtnHandler}>
                  Вывести
                </Button>
              </div>
            </Section>

            <Section>
              <SegmentedControl>
                {options.map((option) => (
                  <SegmentedControl.Item
                    key={option.id}
                    selected={selectedTab === option.id}
                    onClick={() => segmentBtnHandler(option.id)}
                  >
                    {option.label}
                  </SegmentedControl.Item>
                ))}
              </SegmentedControl>
            
          

          {selectedTab === 'tab1' && (
            <>
              
              {balances.map((coin: any) => (
                <>
                  <Cell
                    key={coin.currency}
                    subtitle={`${coin.amount}  ${coin.currency}`}
                    after={`${coin.priceAllCoinInUserFiat} ${coin.symbol}`}
                  >
                    {coin.currency}
                  </Cell>
                  <Divider />
                </>
              ))}
            </>
          )}

          {selectedTab === 'tab2' && <>страница 2</>}

          {selectedTab === 'tab3' && <>страница 3</>}

          </Section>
          </List>
          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
