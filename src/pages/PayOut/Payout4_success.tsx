import {
  Section,
  List,
  Button
  
 
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
// import { useEffect } from 'react';
// import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';

// import { settingsButton } from '@telegram-apps/sdk';

// import axios from '../../axios';

import { Page } from '@/components/Page.tsx';
// import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

// import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
// import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';
// import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
// import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';

// import { TEXTS } from './texts.ts';

export const Payout4_success: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toSend, coin} = location.state || {};

  // const [comission,setComission] = useState('')
  

  //   const { language } = useContext(LanguageContext);
  //   const { balance } = useContext(TotalBalanceContext);

  
   function nextBtnHandler(){
  navigate('/wallet-page')
  }

  //   useEffect(() => {
  //   const fetchComission = async () => {
  //     try {
  //       const response = await axios.get('/get_comission',{
  //         params : {
  //           coin : coin
  //         }
  //       });

        
  //       // setCoins(response.data.selectedCurrencies);
  //       console.log('comission=',response.data.comission.qty)
  //       setComission(response.data.comission.qty)

  //       setToSend(Number(sum)-Number(response.data.comission.qty))

  //     } catch (error) {
  //       console.error('Ошибка при выполнении запроса:', error);
  //     } finally {
  //       // setShowLoader(false);
  //       // setWolfButtonActive(true);
  //     }
  //   };

  //   fetchComission();
  // }, []);


//   async function nextBtnHandler() {
//     let checkAdress = false;
//     let checkSum = false;

//     try {
//       const response = await axios.post('/validate_adress', {
//         adress: adress,
//         coin: coin,
//       });

//       if (response.data === 'OK') {
//         checkAdress = true;
//       }
//     } catch (error) {
//       console.error('Ошибка при выполнении запроса:', error);
//     } finally {
//       // Логика после выполнения запроса
//       // setShowLoader(false);
//       // setWolfButtonActive(true);
//     }

//     // После окончания асинхронного запроса проверяем сумму
//     if (amount >= sum) {
//       checkSum = true;
//     }

//     if (checkAdress || checkSum) {
//       setShowError(true);
//     }
//     console.log('adress=', checkAdress, 'sum=', checkSum);
//   }

  //FIXME:

  //   const [balances, setBalances] = useState([]);
  //  interface CurrencyDetails {
  //             amount: number;
  //             pendingAmount: number;
  //             balanceTime: string;
  //             currency?:string;
  //         }

  //   const [balances, setBalances] = useState<CurrencyDetails[]>([]);

  

  return (
    <Page>
      <List>
        <Section header="Подтвердите данные">
          Ура, вывод!
          {toSend} {coin}
          в ближайшее время ждите
          
          <Button
            mode="filled"
            size="m"
            onClick = {nextBtnHandler}
          >
            Открыть кошелек
          </Button>
         
        
         
        </Section>
      </List>
    </Page>
  );
};
