import type { FC } from 'react';
import { useEffect, useState, useContext} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import axios from '../../axios';

import { Page } from '@/components/Page.tsx';
import { Section, Text, Subheadline, Divider, Spinner} from '@telegram-apps/telegram-ui';

import styles from './stock.module.css';
import { TEXTS } from './texts.ts';
import { settingsButton } from '@telegram-apps/sdk';
  
import { LanguageContext } from '../../components/App.tsx';


export const OrderBook: FC = () => {
 const navigate = useNavigate();
  const location = useLocation();
   const { language } = useContext(LanguageContext);

  const { coin1, coin2 } = location.state || {};

  const [arrayBid, setArrayBid] = useState([]);
  const [arrayAsk, setArrayAsk] = useState([]);

  const [isLoading] = useState(true);
  

  //FIXME:
  // @ts-ignore
    const { dataLoadinOnlineT, priceT, amountT} = TEXTS[language];


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
    


  useEffect(() => {
    console.log('useEffect mounted');

    const getStockGlass = async () => {
      try {

        const pair = `${coin1}-${coin2}`

        const response = await axios.get('/stock/get_stock_glass', {
          params: {
            pair: pair,
          },
        });

        setArrayBid(response.data.bid);
        setArrayAsk(response.data.ask);

        // console.log('info about PAIR', response.data);
      } catch (error) {
        console.error('Ошибка при получении стакана:', error);
      }
    };

      const intervalId = setInterval(() => {
        getStockGlass();
      }, 5000);

    getStockGlass();

      return () => {
        console.log('useEffect cleanup');
        clearInterval(intervalId);
      };
  }, []);

  return (
    <Page back={true}>
      <Section>
        
        {isLoading && (
                <div
                  style={{
                    textAlign: 'left',
                    justifyContent: 'center',
                    padding: '20px',
                    color: '#168acd'
                  }}
                >
                  <Spinner size="s" /> 
                  <Subheadline level="1" weight="3">{dataLoadinOnlineT}</Subheadline>
                </div>
              )}


        {/* <Cell>Bid - покупка (зеленый)</Cell> */}

        <div className={styles.stockGlassWrapper}>
            <div className={`${styles.stockGlassLeftSpan} ${styles.grey}`}><Subheadline level="1" weight="3">{priceT} {coin1}</Subheadline></div> 
            <div className={styles.grey}><Subheadline level="1" weight="3">{amountT} {coin2}</Subheadline></div>
        </div>
       
        {arrayBid.map((item) => (
          <div className={`${styles.stockGlassWrapper} ${styles.green}`}>
            <div className={styles.stockGlassLeftSpan}><Text weight="2">{item[0]}</Text></div>
            <div><Text weight="2">{item[1]}</Text></div>
          </div>
        ))}

        <Divider/>
        <Divider/>
        <Divider/>
        <Divider/>
        <Divider/>
        <Divider/>
        <Divider/>
        
        {/* <Cell>Ask -  продажа (красный)</Cell> */}
        


        
        <div className={styles.stockGlassWrapper}>
            <div className={`${styles.stockGlassLeftSpan} ${styles.grey}`}><Subheadline level="1" weight="3">{priceT} {coin1}</Subheadline></div> 
            <div className={styles.grey}><Subheadline level="1" weight="3">{amountT} {coin2}</Subheadline></div>
        </div>
        {arrayAsk.map((item) => (
          <div className={`${styles.stockGlassWrapper} ${styles.red}`}>
            <div className={styles.stockGlassLeftSpan}><Text weight="2">{item[0]}</Text></div>
            <div className={styles.stockGlassLeftSpan}><Text weight="2">{item[1]}</Text></div>
          </div>
        ))}
      </Section>
      ;
    </Page>
  );
};
