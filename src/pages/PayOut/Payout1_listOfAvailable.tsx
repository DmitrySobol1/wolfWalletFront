import { Section, List, Cell, Divider,Spinner } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState,useContext} from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';

// import { settingsButton } from '@telegram-apps/sdk';

import axios from '../../axios';

import styles from './payout.module.css'

import { Page } from '@/components/Page.tsx';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

// import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
// import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
// import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';

import { TEXTS } from './texts.ts';

export const Payout1_listOfAvailable: FC = () => {
  const navigate = useNavigate();
    const { language } = useContext(LanguageContext);
    const [isLoading, setIsLoading] = useState(true);
  //   const { balance } = useContext(TotalBalanceContext);

 //FIXME:
   // @ts-ignore
   const {title} = TEXTS[language];

  
  // interface CurrencyDetails {
  //   amount: number;
  //   pendingAmount: number;
  //   balanceTime: string;
  //   currency?: string;
  // }

  const [balances, setBalances] = useState([]);

  // доступный баланс и монеты для вывода
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

    
        setBalances(response.data.arrayOfUserBalanceWithUsdPrice);
        setIsLoading(false)
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchCoins();
  }, []);

  function coinBtnHandler(coin: string, amount: number) {
    console.log('choosed coin=', coin);
    navigate('/payout_2writeadress-page', {
      state: {
        coin,
        amount,
      },
    });
  }

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
        <Section header={title}>
          {/* <Cell subtitle={text}>
              lang={language} баланс={balance}{' '}
            </Cell> */}

          {balances.map((coin: any) => (
            <>
              <Cell
                key={coin.currency}
                subtitle={`${coin.amount} ${coin.currency}`}
                after={<Icon16Chevron />}
                onClick={() => coinBtnHandler(coin.currency, coin.amount)}
              >
                <div className={styles.text}>{coin.currency}</div>
              </Cell>
              <Divider />
            </>
          ))}
        </Section>
      </List>
      }
    </Page>
  );
};
