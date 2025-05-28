import { Section, List,Cell,Divider} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {  useEffect,useState } from 'react';
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

export const Payout1_listOfAvailable: FC = () => {
    const navigate = useNavigate();
  //   const { language } = useContext(LanguageContext);
  //   const { balance } = useContext(TotalBalanceContext);

  //FIXME:

  

//   const [balances, setBalances] = useState([]);
 interface CurrencyDetails {
            amount: number;
            pendingAmount: number;
            balanceTime: string;
            currency?:string;
        }

  const [balances, setBalances] = useState<CurrencyDetails[]>([]);

// доступный баланс и монеты для вывода
//FIXME: заменить на нужный ТЛГ id
const tlgid = 412697670;
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get('/get_balance_for_pay_out',{
          params : {
            tlgid : tlgid
          }
        });

        
        
       
        
        type Currencies = Record<string, CurrencyDetails>; // Определяем общий тип объекта    
        
        const data:Currencies = response.data.result.balances

        const resultArray = Object.entries(data).map(([currency, details]) => ({
    currency,
    amount: details.amount,
    pendingAmount: details.pendingAmount,
    balanceTime: details.balanceTime
}));


        // coins = response.data
        setBalances(resultArray);
        console.log(resultArray)
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchCoins();
  }, []);


 function coinBtnHandler(coin:string,amount:number){
    console.log('choosed coin=',coin)
    navigate('/payout_2writeadress-page', {
      state: { 
        coin,
        amount
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
        <Section header="Вывод криптовалюты">
          {/* <Cell subtitle={text}>
              lang={language} баланс={balance}{' '}
            </Cell> */}

          {balances.map((coin:any) => (
            <>
              <Cell key={coin.currency} subtitle={`${coin.amount} ${coin.currency}`}  after={<Icon16Chevron />} onClick={()=>coinBtnHandler(coin.currency,coin.amount)}>
                {coin.currency} 
              </Cell>
              <Divider />
            </>
          ))}
        </Section>
      </List>
    </Page>
  );
};
