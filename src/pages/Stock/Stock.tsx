import {
  Section,
  List,
  Cell,
  Spinner,
  Button,
  Slider,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
// import { LanguageContext } from '../../components/App.tsx';

import { useTlgid } from '../../components/Tlgid';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

// import vsaarrows from '../../img/vs_arrows.png';

import { settingsButton } from '@telegram-apps/sdk';

import axios from '../../axios.ts';

import { Page } from '@/components/Page.tsx';
// import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';
import { Icon20ChevronDown } from '@telegram-apps/telegram-ui/dist/icons/20/chevron_down';

// import { TEXTS } from './texts.ts';

// import styles from './stock.module.css';

export const Stock: FC = () => {
  const tlgid = useTlgid();

  const navigate = useNavigate();
  // const { language } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();

  const { coin1New,coin1NewFull,coin1chainNew,coin2New,coin2NewFull,coin2chainNew } = location.state || {};

  // console.log('coin1',coin1short,coin1full,coin1chain)
  // console.log('coin2',coin2short,coin2full,coin2chain)

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

  //FIXME:
  // @ts-ignore
  // const {
  //   wordMaximum,
  //   header1,
  //   youGetText,
  //   errorSumTooBig,
  //   errorMinSumBig,
  //   nextBtn,
  //   minSumToExchangeText,
  //   // @ts-ignore
  // } = TEXTS[language];

  const [price, setPrice] = useState(0);
  // const [balances, setBalances] = useState([]);
  const [coin1, setCoin1] = useState('');
  const [coin2, setCoin2] = useState('');
  const [coin1fullName, setCoin1full] = useState('');
  const [coin2fullName, setCoin2full] = useState('');
  const [coin1qty, setCoin1qty] = useState(0);
  const [coin2qty, setCoin2qty] = useState(0);
  const [maxBuy, setMaxBuy] = useState(0);
  const [maxSell, setMaxSell] = useState(0);
  const [sliderAmount,setSliderAmount]=useState(0)
  const [type,setType]=useState('buy')
  const [chain1,setChain1]=useState('')
  const [chain2,setChain2]=useState('')

  // получить первую торговую пару, или выбранную юзером и цену торговли пары
  useEffect(() => {
    const fetchPairAndPrice = async () => {
      try {
        let selectedCoin1, selectedCoin2,selectedCoin1full,selectedCoin2full,selectedChain1,selectedChain2


        //если юзер выбрал пару
        if (coin1New && coin2New) {
          // пользователь выбрал новую пару
          selectedCoin1 = coin1New;
          selectedCoin2 = coin2New;
          selectedCoin1full = coin1NewFull;
          selectedCoin2full = coin2NewFull;
          selectedChain1 = coin1chainNew;
          selectedChain2 = coin2chainNew;
        } else {
          // загрузка первой пары с сервера
          const response = await axios.get('/get_stock_pairs');
          const firstPair = response.data.data[0];
          selectedCoin1 = firstPair.coin1short;
          selectedCoin2 = firstPair.coin2short;
          selectedCoin1full = firstPair.coin1full;
          selectedCoin2full = firstPair.coin2full;
          selectedChain1 = firstPair.coin1chain;
          selectedChain2 = firstPair.coin2chain;
        }
        
                
          setCoin1(selectedCoin1);
          setCoin2(selectedCoin2);
          setCoin1full(selectedCoin1full);
          setCoin2full(selectedCoin2full);
          setChain1(selectedChain1)
          setChain2(selectedChain2)

          // console.log('selectedCoin1=', selectedCoin1);
          // console.log('selectedCoin2=', selectedCoin2);
          // console.log('selectedCoin1=', selectedCoin1full);
          // console.log('selectedCoin2=', selectedCoin2full);


        // получаем цену по выбранной паре
        const priceResponse = await axios.get('/get_ticker', {
          params: { pair: `${selectedCoin1}-${selectedCoin2}` },
        });
        console.log('priceResponse=',priceResponse.data)
        setPrice(priceResponse.data.data.price);

        
        //получаем баланс в NP
        const amountResponse = await axios.get('/get_balance_for_pay_out', {
          params: {
            tlgid: tlgid,
          },
        });

        console.log("amountResponse", amountResponse.data)
        
        let Coin1qtyForCounting = 0;
        let Coin2qtyForCounting = 0;

        //@ts-ignore
        amountResponse.data.arrayOfUserBalanceWithUsdPrice.forEach((item) => {
          if (item.currency == selectedCoin1full.toLowerCase()) {
            setCoin1qty(item.amount);
            Coin1qtyForCounting = item.amount;
          }

          if (item.currency == selectedCoin2full.toLowerCase()) {
            setCoin2qty(item.amount);
            Coin2qtyForCounting = item.amount;
          }
        });

        const countingBuy = Number(
          (
            Number(Coin2qtyForCounting) / Number(priceResponse.data.data.price)
          ).toFixed(6)
        );
        setMaxBuy(countingBuy);

        const countingSell = Number((Number(priceResponse.data.data.price) * Number(Coin1qtyForCounting)).toFixed(6))
        setMaxSell(countingSell); 

        console.log(
          'BALANCES',
          amountResponse.data.arrayOfUserBalanceWithUsdPrice
        );
      } catch (error) {
        console.error('Ошибка при загрузке пары или цены:', error);
      } finally {
        setIsLoading(false);
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchPairAndPrice();
  }, []);


  function choosePair() {
    navigate('/stock_2showPairs-page'
    );
  }

  function changeSlider(value:number,type:string){
    console.log('slider=',value)

    if (type === 'buy'){
    const counting=Number((coin2qty*(value/100)).toFixed(6))
    setSliderAmount(counting)
      }

      if (type === 'sell'){
    const counting=Number((coin1qty*(value/100)).toFixed(6))
    setSliderAmount(counting)
      }
  }


  function actionBtnHandler(type:string){

    let text=''
    if (type === 'buy'){
      text = `купить ${coin1fullName} на ${sliderAmount} ${coin2fullName}`
    }
    if (type === 'sell'){
      text = `продать ${sliderAmount} ${coin1fullName} за ${coin2fullName}`
    }


    //FIXME: check variables
    const fetchOrder= async () => {
      try {
        const response = await axios.post('/new_stockorder_market', {
          tlgid: tlgid,
          type : type,
          coin1short: coin1,
          coin1full: coin1fullName,
          coin1chain:chain1,
          coin2short: coin2,
          coin2full: coin2fullName,
          coin2chain:chain2,
          amount: sliderAmount,
          helptext: text
        });
        
        console.log(response.data);
        
        
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();


  }


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
          // header={title}
          >
            <Cell after=<Icon20ChevronDown /> onClick={() => choosePair()}>
              {coin1fullName} / {coin2fullName}
            </Cell>
            <Button
            onClick={()=>setType('buy')}
            >Купить</Button>
            <Button
            onClick={()=>setType('sell')}
            >Продать</Button>
            <Cell>Маркет ордер - {type}</Cell>
            <Cell>Рыночная цена: 1 {coin1}={price} {coin2fullName}</Cell>
            
            {type==='buy'&& 
            <>
            <Cell>Всего {coin2fullName}: {sliderAmount} </Cell>
            <Slider 
            step={1}
            onChange={(value)=>changeSlider(value,type)}
            />
            <Cell>
              Доступно: {coin2qty} {coin2fullName}
            </Cell>
            <Cell>
              Макс. покупка: {maxBuy} {coin1fullName}
            </Cell>
            <Button
            onClick={()=>actionBtnHandler('buy')}
            >Купить {coin1fullName}</Button>    
            

            </>
          }

          {type==='sell' &&
           <>
            <Cell>Всего {coin1fullName}: {sliderAmount} </Cell>
            <Slider 
            step={1}
            onChange={(value)=>changeSlider(value,type)}
            />
            <Cell>
              Доступно: {coin1qty} {coin1fullName}
            </Cell>
            <Cell>
              Макс. продажа: {maxSell} {coin2fullName}
            </Cell>
            <Button
            onClick={()=>actionBtnHandler('sell')}
            >Продать {coin1fullName}</Button>
           
            
            </>
          
          }
          
          </Section>
        </List>
      )}
      <TabbarMenu />
    </Page>
  );
};
