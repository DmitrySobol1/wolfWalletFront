import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';

import { LanguageContext } from '../../components/App.tsx';

import axios from '../../axios';
import { useTlgid } from '../../components/Tlgid';

import {
  Section,
  List,
  Cell,
  Divider,
  Spinner,
} from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page.tsx';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

import { TryLater } from '../../components/TryLater/TryLater.tsx';

import styles from './transfer.module.css';
import { TEXTS } from './texts.ts';

export const Transfer1_listOfAvailable: FC = () => {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(true);
  const [showTryLater, setShowTryLater] = useState(false);

  //FIXME:
  // @ts-ignore
  const { title } = TEXTS[language];

  const [balances, setBalances] = useState([]);

  const tlgid = useTlgid();

  // доступный баланс и монеты для вывода
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get('/wallet/get_balance_for_pay_out', {
          params: {
            tlgid: tlgid,
          },
        });

        if (response.data.statusBE === 'notOk') {
          setShowTryLater(true);
          setIsLoading(false);
        }

        setBalances(response.data.dataForFront.arrayOfUserBalanceWithUsdPrice);
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
      }
    };

    fetchCoins();
  }, []);

  function coinBtnHandler(coin: string, amount: number) {
    navigate('/transfer_2writetrtinfo-page', {
      state: {
        coin,
        amount,
      },
    });
  }

  return (
    <Page back={true}>
      {showTryLater && <TryLater />}

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

      {!isLoading && !showTryLater && (
        <List>
          <Section header={title}>
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
      )}
    </Page>
  );
};
