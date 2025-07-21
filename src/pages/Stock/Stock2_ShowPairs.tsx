import {
  Section,
  List,
  Cell,
  Divider,
  Spinner,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';

// import { settingsButton } from '@telegram-apps/sdk';

// import styles from './exchange.module.css'

import axios from '../../axios';

import { Page } from '@/components/Page.tsx';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

// import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
// import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
// import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';

import { TEXTS } from './texts.ts';

export const Stock2_ShowPairs: FC = () => {
  
    const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(true);
  //   const { balance } = useContext(TotalBalanceContext);

// const location = useLocation();
    // const { type,oppositeCoin } = location.state || {};
    // console.log('TYPE=',type)

  //FIXME:
  // @ts-ignore
  const { title } = TEXTS[language];

  const [pairs, setPairs] = useState([]);

  // доступные торговые пары
  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const response = await axios.get('/get_stock_pairs');

        console.log(response.data)
        // coins = response.data
        setPairs(response.data.data);
        setIsLoading(false);
        // console.log(coins)
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchPairs();
  }, []);

  
  // function pairBtnHandler(coin1: string, coin2:string) {
    
  //   navigate('/stock-page', {
  //     state: {
  //       coin1short: coin1,
  //       coin2New: coin2
  //     },
  //   });
  // }
 
 

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
          <Section 
          header= {title}
          style={{ marginBottom: 100 }}

          >
           

            {pairs.map((pair:any) => (
              <>
                <Cell
                  key={pair}
                  after={<Icon16Chevron />}
                 //@ts-ignore
                  // onClick={() => pairBtnHandler(pair.coin1, pair.coin2)}
                  onClick={() => navigate('/stock-page', {
                    state: {
                      //@ts-ignore
                      coin1New: pair.coin1short,
                      //@ts-ignore
                      coin1NewFull: pair.coin1full,
                      //@ts-ignore
                      coin1chainNew: pair.coin1chain,
                      //@ts-ignore
                      coin2New: pair.coin2short,
                      //@ts-ignore
                      coin2NewFull: pair.coin2full,
                      //@ts-ignore
                      coin2chainNew: pair.coin2chain,
      },
    })}
                  //@ts-ignore
                  subtitle={`${pair.coin1full} / ${pair.coin2full}`}
                >
                    
                  {pair.coin1short} / {pair.coin2short}
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
