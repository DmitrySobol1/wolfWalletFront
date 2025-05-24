import { Section, List, Cell, Divider } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
// import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';

// import { settingsButton } from '@telegram-apps/sdk';

import axios from '../../axios';

import { Page } from '@/components/Page.tsx';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

// import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
// import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
// import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';

// import { TEXTS } from './texts.ts';

export const PayIn: FC = () => {
    const navigate = useNavigate();
  //   const { language } = useContext(LanguageContext);
  //   const { balance } = useContext(TotalBalanceContext);





  const [coins, setCoins] = useState([]);

  
  // доступные монеты (Get available checked currencies)
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get('/get_available_coins');

        // coins = response.data
        setCoins(response.data.selectedCurrencies);
        // console.log(coins)
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchCoins();
  }, []);


  function coinBtnHandler(coin:string){
    // console.log('choosed coin=',coin)
    navigate('/payin_adress-page', {
      state: { 
        coin: coin
      }
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
      <List>
        <Section header="Пополнение криптовалюты">
          {/* <Cell subtitle={text}>
              lang={language} баланс={balance}{' '}
            </Cell> */}

          {coins.map((coin) => (
            <>
              <Cell key={coin} subtitle={coin} after={<Icon16Chevron />} onClick={()=>coinBtnHandler(coin)}>
                {coin}
              </Cell>
              <Divider />
            </>
          ))}
        </Section>
      </List>
    </Page>
  );
};
