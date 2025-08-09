import type { FC } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useEffect, useState, useContext } from 'react';
import { useEffect, useState } from 'react';
// import { LanguageContext } from '../../components/App.tsx';

import axios from '../../axios';

import { Page } from '@/components/Page.tsx';
import { Section, Cell } from '@telegram-apps/telegram-ui';

// import { Page } from '@/components/Page.tsx';
// import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

// import { TryLater } from '../../components/TryLater/TryLater.tsx';

// import { TEXTS } from './texts.ts';
// import styles from '../WalletPage/walletpage.module.css';

export const OrderBook: FC = () => {
  //   const navigate = useNavigate();

  const [arrayBid, setArrayBid] = useState([]);

  //   const [price, setPrice] = useState ('')
  //   const [time, setTime] = useState('')

  //   const { language } = useContext(LanguageContext);
  // FIXME: вернуть isLoading на true при открытии страницы
  //   const [isLoading, setIsLoading] = useState(false);
  //   const [showTryLater, setShowTryLater] = useState(false);
  //   const [coins, setCoins] = useState([]);

  //FIXME:
  // @ts-ignore
  //   const { title, tryLaterText} = TEXTS[language];

  useEffect(() => {
    console.log('useEffect mounted');

    const getStockGlass = async () => {
      try {
        const response = await axios.get('/stock/get_stock_glass', {
          params: {
            pair: 'BTC-USDT',
          },
        });

        setArrayBid(response.data);

        //   console.log(response.data)

        console.log('info about PAIR', response.data);
      } catch (error) {
        console.error('Ошибка при получении стакана:', error);
      }
    };

      const intervalId = setInterval(() => {
        getStockGlass();
      }, 5000);

    // getStockGlass();

      return () => {
        console.log('useEffect cleanup');
        clearInterval(intervalId);
      };
  }, []);

  return (
    <Page back={true}>
      <Section header="биржевой стакан">
        <Cell>test</Cell>
        <div>
            <span>цена</span> <span>объем</span>
        </div>
        {arrayBid.map((item) => (
          <div>
            <span>{item[0]}</span>
            <span> - - </span>
            <span>{item[1]}</span>
          </div>
        ))}
      </Section>
      ;
    </Page>
  );
};
