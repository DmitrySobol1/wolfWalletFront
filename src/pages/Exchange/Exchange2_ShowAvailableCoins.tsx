import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';

import axios from '../../axios';
import { LanguageContext } from '../../components/App.tsx';

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

import { TEXTS } from './texts.ts';

export const Exchange2_ShowAvailableCoins: FC = () => {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const location = useLocation();
  const { type, oppositeCoin } = location.state || {};

  const [isLoading, setIsLoading] = useState(true);
  const [showTryLater, setShowTryLater] = useState(false);
  const [coins, setCoins] = useState([]);

  //FIXME:
  // @ts-ignore
  const { title2From, title2To } = TEXTS[language];

  // доступные монеты (Get available checked currencies)
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get('/payin/get_available_coins');

        if (response.data.statusBE === 'notOk') {
          setShowTryLater(true);
          setIsLoading(false);
        }

        setCoins(response.data.selectedCurrencies);
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        setShowTryLater(true);
        setIsLoading(false);
      } finally {
      }
    };

    fetchCoins();
  }, []);

  function coinBtnHandler(coin: string) {
    navigate('/exchange_1setsum-page', {
      state: {
        choosedCoin: coin,
        typeCoin: type,
        oppositeCoin: oppositeCoin,
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
          <Section
            //   header={title2}
            header={type === 'from' ? title2From : title2To}
          >
            {coins.map((coin) => (
              <>
                <Cell
                  key={coin}
                  after={<Icon16Chevron />}
                  onClick={() => coinBtnHandler(coin)}
                >
                  {coin}
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
