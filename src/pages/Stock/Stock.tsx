import {
  Section,
  List,
  Cell,
  Spinner,
  Button,
  Slider,
  Text,
  Select,
  Input,
  Tappable,
  TabsList,
  Divider,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';

import { useTlgid } from '../../components/Tlgid';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

// import vsaarrows from '../../img/vs_arrows.png';

import { settingsButton } from '@telegram-apps/sdk';

import axios from '../../axios.ts';

import { Page } from '@/components/Page.tsx';
// import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';
import { Icon20ChevronDown } from '@telegram-apps/telegram-ui/dist/icons/20/chevron_down';
import { Icon28CloseAmbient } from '@telegram-apps/telegram-ui/dist/icons/28/close_ambient';

import CachedIcon from '@mui/icons-material/Cached';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { TEXTS } from './texts.ts';

import styles from './stock.module.css';

export const Stock: FC = () => {
  const tlgid = useTlgid();

  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();

  const {coin1New,coin1NewFull,coin1chainNew,coin2New,coin2NewFull,coin2chainNew} = location.state || {};

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
  const {notEnoughText,zeroText, minSumText,maxBuyText,availableText,wordMaximum,header1,youGetText,errorSumTooBig,errorMinSumBig,nextBtn,minSumToExchangeText,openOrder,historyOrder,tryLaterText,btnBuyText,btnSellText,marketOrdertext,stockPriceText,totalText } = TEXTS[language];

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
  // const [sliderAmount, setSliderAmount] = useState(0);
  const [type, setType] = useState('buy');
  const [chain1, setChain1] = useState('');
  const [chain2, setChain2] = useState('');

  const [inputAmount, setInputAmount] = useState(0);
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [showActionBtn, setShowActionBtn] = useState(true);
  const [activeBtn, setActiveBtn] = useState(1);

  const [minOperationNumber, setMinOperationNumber] = useState(0)
  const [actionBtnLoading, setActionBtnLoading]  = useState(false)
  


  //FIXME: добавить на все страницы
  const [showTryLater,setShowTryLater] = useState(false)

  const [selectedTab, setSelectedTab] = useState('tab1');
  const options = [
    { id: 'tab1', label: openOrder },
    { id: 'tab2', label: historyOrder },
  ];

  function segmentBtnHandler(id: string) {
    setSelectedTab(id);
  }

  // получить первую торговую пару, или выбранную юзером и цену торговли пары
  useEffect(() => {
    const fetchPairAndPrice = async () => {
      try {
        let selectedCoin1,
          selectedCoin2,
          selectedCoin1full,
          selectedCoin2full,
          selectedChain1,
          selectedChain2;

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
        setChain1(selectedChain1);
        setChain2(selectedChain2);

        // console.log('selectedCoin1=', selectedCoin1);
        // console.log('selectedCoin2=', selectedCoin2);
        // console.log('selectedCoin1=', selectedCoin1full);
        // console.log('selectedCoin2=', selectedCoin2full);

        // получаем цену по выбранной паре
        const priceResponse = await axios.get('/get_ticker', {
          params: { pair: `${selectedCoin1}-${selectedCoin2}` },
        });
        console.log('priceResponse=', priceResponse.data);
        setPrice(priceResponse.data.data.price);

        //получаем баланс в NP
        const amountResponse = await axios.get('/get_balance_for_pay_out', {
          params: {
            tlgid: tlgid,
          },
        });

        console.log('amountResponse', amountResponse.data);

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

        const countingSell = Number(
          (
            Number(priceResponse.data.data.price) * Number(Coin1qtyForCounting)
          ).toFixed(6)
        );
        setMaxSell(countingSell);

        console.log(
          'BALANCES',
          amountResponse.data.arrayOfUserBalanceWithUsdPrice
        );


        let networkFeeResult=0
        // получить комиссию сети за вывод мотеты
        if (type == 'buy'){
          networkFeeResult = await getNetworkFee(selectedCoin2full)
          console.log('FROM FIRST USEEFEFCT | network fee =', networkFeeResult, selectedCoin2full)
        }

        if (type == 'sell'){
          networkFeeResult = await getNetworkFee(selectedCoin1full)
          console.log('FROM FIRST USEEFEFCT | network fee =', networkFeeResult, selectedCoin1full)
        }

        //получить нашу комиссию
        const ourComissionResult = await getOurComission()
        console.log('FROM FIRST USEEFEFCT | our comission =', ourComissionResult, '%')


        // получаем минимальные суммы для withdraw/deposit
        if (type == 'buy'){

          const arrayMinimals1: number[] = []
          const arrayMinimals2: number[] = []

          const minWithdrawNpResult = await minWithdrawNp(selectedCoin2full)
          console.log('FROM FIRST USEEFEFCT | min sum minWithdrawNp=', minWithdrawNpResult, selectedCoin2full )
          arrayMinimals1.push(minWithdrawNpResult)

          const minDepositStockResult = await minDepositStock(selectedCoin2,selectedChain2)
          console.log('FROM FIRST USEEFEFCT | min sum minDepositStock=', minDepositStockResult, selectedCoin2, selectedChain2)
          arrayMinimals1.push(minDepositStockResult)
          

          const minDepositNpResult = await minDepositNp(selectedCoin1full)
          console.log('FROM FIRST USEEFEFCT | min sum minDepositNp=', minDepositNpResult, selectedCoin1full)
          arrayMinimals2.push(minDepositNpResult)
          
          const minWithdrawStockResult = await minWithdrawStock(selectedCoin1,selectedChain1)
          console.log('FROM FIRST USEEFEFCT | min sum minWithdrawStock=', minWithdrawStockResult, selectedCoin1, selectedChain1)
          arrayMinimals2.push(minWithdrawStockResult)


          //подсчет минимальной для операции сумму
          const maxFromMinimal1 = Math.max(...arrayMinimals1);
          const maxFromMinimal2 = Math.max(...arrayMinimals2);


          const minimalOne_step1 = (maxFromMinimal1 + networkFeeResult) / 1 - (ourComissionResult/100)
          const minimalOne_step2 = minimalOne_step1 + minimalOne_step1*0.2
          const minimalOne = minimalOne_step2
          console.log ('minimalOne=',minimalOne)

          const percentKoefficient = 5
          const minimalTwo_step1 = maxFromMinimal2 / (1 - (percentKoefficient/100))
          const minimalTwo_step2 = minimalTwo_step1 * priceResponse.data.data.price
          const minimalTwo_step3 = (minimalTwo_step2+networkFeeResult) / (1 - (ourComissionResult/100) )
          const minimalTwo_step4 = minimalTwo_step3 + minimalTwo_step3*0.2
          const minimalTwo = minimalTwo_step4
          console.log ('minimalTwo=',minimalTwo)

          if (minimalOne > minimalTwo ) {
            setMinOperationNumber(minimalOne)
          } else {
              setMinOperationNumber(minimalTwo)
          }
          

        } 

        if (type == 'sell'){

          const arrayMinimals1: number[] = []
          const arrayMinimals2: number[] = []

           const minWithdrawNpResult = await minWithdrawNp(selectedCoin1full)
           console.log('FROM FIRST USEEFEFCT | min sum minWithdrawNp =', minWithdrawNpResult, selectedCoin1full )
           arrayMinimals1.push(minWithdrawNpResult)

           const minDepositStockResult = await minDepositStock(selectedCoin1,selectedChain1)
           console.log('FROM FIRST USEEFEFCT | min sum minDepositStock=', minDepositStockResult, selectedCoin1,selectedChain1)
           arrayMinimals1.push(minDepositStockResult)

           const minDepositNpResult = await minDepositNp(selectedCoin2full)
           console.log('FROM FIRST USEEFEFCT | min sum minDepositNp=', minDepositNpResult, selectedCoin2full)
           arrayMinimals2.push(minDepositNpResult) 
           
           const minWithdrawStockResult = await minWithdrawStock(selectedCoin2,selectedChain2)
           console.log('FROM FIRST USEEFEFCT | min sum minWithdrawStock=', minWithdrawStockResult, selectedCoin2, selectedChain2)
           arrayMinimals2.push(minWithdrawStockResult) 



          //подсчет минимальной для операции сумму
          const maxFromMinimal1 = Math.max(...arrayMinimals1);
          const maxFromMinimal2 = Math.max(...arrayMinimals2);

          console.log('maxFromMinimal1',maxFromMinimal1)

          
          const minimalOne_step1 = (maxFromMinimal1 + networkFeeResult) / 1 - (ourComissionResult/100)
          const minimalOne_step2 = minimalOne_step1 + minimalOne_step1*0.2

          const minimalOne = minimalOne_step2
          console.log ('minimalOne=',minimalOne)

          const percentKoefficient = 5
          const minimalTwo_step1 = maxFromMinimal2 / (1 - (percentKoefficient/100))
          const minimalTwo_step2 = minimalTwo_step1 / priceResponse.data.data.price
          const minimalTwo_step3 = (minimalTwo_step2+networkFeeResult) / (1 - (ourComissionResult/100))
          const minimalTwo_step4 = minimalTwo_step3 + minimalTwo_step3*0.2
          const minimalTwo = minimalTwo_step4
          console.log ('minimalTwo=',minimalTwo)

          if (minimalOne > minimalTwo ) {
            setMinOperationNumber(minimalOne)
          } else {
            setMinOperationNumber(minimalTwo)
          }

        }


        





      } catch (error) {
        console.error('Ошибка при загрузке пары или цены:', error);
      } finally {
        setIsLoading(false);
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchPairAndPrice();
  }, [type]);



       
  
        // расчет минимальных суммы переводов
        async function minWithdrawNp(coin:string) {
          
          try {
            
            const response = await axios.get('/get_minWithdrawNp', {
              params: {
                coin: coin,
              },
            });

            if (response.data.statusFn == 'ok'){
              // setPlatformRestrictions1(prev => [...prev, response.data.result]);
              return response.data.result
            } else {
              setShowTryLater(true)
            }

          } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
          } finally {
            // setIsLoading(false)
            // setWolfButtonActive(true);
          }
        };


         async function minDepositStock(coin:string, chain:string) {
          // setIsLoading(true)
          try {
            
            const response = await axios.get('/get_minDepositWithdrawStock', {
              params: {
                coin: coin,
                chain: chain
              },
            });

            if (response.data.statusFn == 'ok'){
              // setPlatformRestrictions1(prev => [...prev, response.data.deposit]);
              return response.data.deposit
            } else {
              setShowTryLater(true)
            }

          } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
          } finally {
            // setIsLoading(false);
            // setWolfButtonActive(true);
          }
        };


        
          async function minDepositNp(coin:string) {
          try {
            const response = await axios.get('/get_minDepositNp', {
              params: {
                coin: coin,
              },
            });

            if (response.data.statusFn == 'ok'){
              return response.data.result
            } else {
              setShowTryLater(true)
            }

          } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
          } finally {
            // setIsLoading(false)
            // setWolfButtonActive(true);
          }
        };


        async function minWithdrawStock(coin:string, chain:string) {
          // setIsLoading(true)
          try {
            const response = await axios.get('/get_minDepositWithdrawStock', {
              params: {
                coin: coin,
                chain: chain
              },
            });

            if (response.data.statusFn == 'ok'){
              return response.data.withdrawal
            } else {
              setShowTryLater(true)
            }

          } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
          } finally {
            // setIsLoading(false);
            // setWolfButtonActive(true);
          }
        };


        // получить комиссию сети
        async function getNetworkFee(coin:string) {
          try {
            const response = await axios.get('/get_withdrawal_fee', {
              params: {
                coin: coin,
                amount: 1
              },
            });

            if (response.data.statusFn == 'ok'){
              return response.data.networkFees
            } else {
              setShowTryLater(true)
            }

          } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
          } finally {
            // setIsLoading(false)
            // setWolfButtonActive(true);
          }
        };


        
        // ..получение нашей комиссии (число в )
        async function getOurComission() {
          try {
            const response = await axios.get('/get_ourComissionStockMarket');

            if (response.data.statusFn == 'ok'){

              //в БД число хранится в процентах  
              const inPercent = response.data.comission
              // const inNum = Number(inPercent)/100

              return inPercent
            } else {
              setShowTryLater(true)
            }

          } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
          } finally {
            // setIsLoading(false)
            // setWolfButtonActive(true);
          }
        };



  
  // получить открытые ордера
  const [openOrdersArray, setOpenOrdersArray] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/get_myOpenOrders', {
          params: {
            tlgid: tlgid,
          },
        });

        if (response.data.statusFn == 'ok' && response.data.count >= 1) {
          setOpenOrdersArray(response.data.data);
          console.log('OPEN ORDERS', response.data);
        } else {
          // ..отдать на фронт инфо, что нет данных
        }
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchOrders();
  }, []);



// получить закрытые ордера
  const [doneOrdersArray, setDoneOrdersArray] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/get_myDoneOrders', {
          params: {
            tlgid: tlgid,
          },
        });

        if (response.data.statusFn == 'ok' && response.data.count >= 1) {
          setDoneOrdersArray(response.data.data);
          console.log('DONE ORDERS', response.data);
        } else {
          // ..отдать на фронт инфо, что нет данных
        }
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchOrders();
  }, []);





  //function choosePair
  function choosePair() {
    navigate('/stock_2showPairs-page');
  }

  //function buySellTypeChangerHandler
  function buySellTypeChangerHandler(choosenValue: string) {
    setShowError(false);
    // setIsLoading(true)
    if (choosenValue == 'buy') {
      setType('buy');
      setInputAmount(0);
      setActiveBtn(1);
    }

    if (choosenValue == 'sell') {
      setType('sell');
      setInputAmount(0);
      setActiveBtn(2);
    }
  }

  //function changeSlider
  function changeSlider(value: number, type: string) {
    console.log('slider=', value);
    setShowError(false);

    if (type === 'buy') {
      if (value == 100) {
        // setSliderAmount(coin2qty);
        setInputAmount(coin2qty);
        console.log('достиг 100% | слайдер=', coin2qty);

        if (coin2qty < minOperationNumber ){
            setErrorText(`${minSumText}=${minOperationNumber}`);
            setShowError(true);
            setShowActionBtn(false);
        } else {
          setShowError(false);
          setShowActionBtn(true);
        }

        
      } else if (value == 0) {
        setInputAmount(0);
        setErrorText(zeroText);
        setShowError(true);
        setShowActionBtn(false);
      } else {
        const counting = Number((coin2qty * (value / 100)).toFixed(6));
        // setSliderAmount(counting);
        setInputAmount(counting);

        if (counting < minOperationNumber ){
            setErrorText(`${minSumText}=${minOperationNumber}`);
            setShowError(true);
            setShowActionBtn(false);
            
        } else {
          setShowError(false);
          console.log('не достиг | слайдер=', counting);
          setShowActionBtn(true);
        }

        
      }
    }

    if (type === 'sell') {
      if (value == 100) {
        // setSliderAmount(coin1qty);
        setInputAmount(coin1qty);
        console.log('достиг 100% | слайдер=', coin1qty);

        if (coin1qty < minOperationNumber ){
            setErrorText(`${minSumText}=${minOperationNumber}`);
            setShowError(true);
            setShowActionBtn(false);
            
        } else {
          setShowError(false);
          setShowActionBtn(true);
        }

        
      } else if (value == 0) {
        setInputAmount(0);
        setErrorText(zeroText);
        setShowError(true);
        setShowActionBtn(false);
      } else {
        const counting = Number((coin1qty * (value / 100)).toFixed(6));
        // setSliderAmount(counting);
        setInputAmount(counting);


        if (counting < minOperationNumber ){
            setErrorText(`${minSumText}=${minOperationNumber}`);
            setShowError(true);
            setShowActionBtn(false);
            
        } else {

          setShowError(false);
          console.log('не достиг | слайдер=', counting);
          setShowActionBtn(true);

        }

        
      }
    }
  }

  // function maxBtnHandler
  function maxBtnHandler(typeValue: string) {
    // setIsInputActive(true)
    // setSum(amount);

    if (typeValue == 'buy') {

      if (coin2qty < minOperationNumber) {
        setInputAmount(coin2qty);
        setErrorText(`${minSumText}=${minOperationNumber}`);
        setShowError(true);
        setShowActionBtn(false);
        
      } else {
        setInputAmount(coin2qty);
        setShowError(false);
        setShowActionBtn(true);
      }

      
    }

    if (typeValue == 'sell') {
      if (coin1qty < minOperationNumber) {
        setInputAmount(coin1qty);
        setErrorText(`${minSumText}=${minOperationNumber}`);
        setShowError(true);
        setShowActionBtn(false);
        
      } else {
        setInputAmount(coin1qty);
        setShowError(false);
        setShowActionBtn(true);
      }
    }
  }

  //function qtyHandler
  async function qtyHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    const normalizedValue = inputValue
      .replace(/,/g, '.')
      .replace(/[^\d.]/g, '')
      .replace(/^(\d*\.?\d*).*/, '$1'); // Удаляет всё после второй точки

    //@ts-ignore FIXME:
    // setAmount(normalizedValue);
    setInputAmount(normalizedValue);

    setShowError(false);
    setShowActionBtn(true);
    // setShowNextBtn(false);
    // setShowMinSumValue(false);

    const check = /^[\d.]*$/.test(inputValue);
    if (!check) {
      console.log('stop');
      return;
    }

    //@ts-ignore FIXME:
    // if (inputValue == 0) {
    //   setConvertedAmount(0);
    //   return;
    // }

    //@ts-ignore FIXME:
    // if (inputValue < minAmount) {
    //   setErrorText(errorMinSumBig);
    //   setShowError(true);
    //   setShowMinSumValue(true);
    //   setConvertedAmount(0);
    //   return;
    // }

    if (inputValue == 0) {
      setErrorText(zeroText);
      setShowError(true);
      setShowActionBtn(false);
      return;
    }

    if ( Number(inputValue) < minOperationNumber && (type == 'buy' || type == 'sell') ){
        setErrorText(`${minSumText}=${minOperationNumber}`);
        setShowError(true);
        setShowActionBtn(false);
    }

    

    //@ts-ignore FIXME:
    if (
      (Number(inputValue) > Number(coin1qty) && type == 'sell') ||
      (Number(inputValue) > Number(coin2qty) && type == 'buy')
    ) {
      setErrorText(notEnoughText);
      setShowError(true);
      setShowActionBtn(false);
      // setConvertedAmount(0);
      return;
    }

    //TODO: добавить, что запрос на сервер не сразу отправлять, а задержкой, когда ввод окончен(как в видео про кросы)

    // const responseConversion = await axios.get('/get_conversion_rate', {
    //   params: {
    //     amount: inputValue,
    //     coinFrom: coinFrom,
    //     coinTo: coinTo,
    //   },
    // });

    // const amountWithoutComission = responseConversion.data.convertedAmount;

    //т.к. комиссия в БД - это число в %
    // const npCom = amountWithoutComission * (nowpaymentComission / 100);
    // const ourCom = amountWithoutComission * (ourComission / 100);

    // console.log('npCom=', npCom);
    // console.log('ourCom=', ourCom);

    // const amountWithComission = Number(
    //   (amountWithoutComission - npCom - ourCom).toFixed(6)
    // );

    // setConvertedAmount(amountWithComission);
    // console.log(
    //   'fullAmount=',
    //   amountWithoutComission,
    //   ' npCom=',
    //   npCom,
    //   ' ourCom = ',
    //   ourCom
    // );
    // setShowNextBtn(true);
  }

  //function actionBtnHandler
  function actionBtnHandler(type: string) {
    if (inputAmount == 0) {
      setErrorText(zeroText);
      setShowError(true);
      return;
    }

    setActionBtnLoading(true)

    let text = '';
    if (type === 'buy') {
      text = `купить ${coin1fullName} на ${inputAmount} ${coin2fullName}`;
    }
    if (type === 'sell') {
      text = `продать ${inputAmount} ${coin1fullName} за ${coin2fullName}`;
    }

    const fetchOrder = async () => {
      const data = {
        tlgid: tlgid,
        type: type,
        coin1short: coin1,
        coin1full: coin1fullName,
        coin1chain: chain1,
        coin2short: coin2,
        coin2full: coin2fullName,
        coin2chain: chain2,
        amount: inputAmount,
        helptext: text,
      };

      console.log('DATA=', data);

      try {
        const response = await axios.post('/new_stockorder_market', data);

        console.log(response.data);

        if (response.data.statusFn == 'saved') {
          navigate(
            '/stock_3success-page'
            // {
            // state: {
            //   qtyToSend,
            //   coin,
            // },
            // }
          );
        } else {
          setErrorText(tryLaterText);
          setShowError(true);
          setActionBtnLoading(false)
        }
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

      {/* если пришла ошибка с бека */}
      {showTryLater &&
          <Cell 
          before={<Icon28CloseAmbient />}
          multiline
          >
                <span className={styles.errorText}>{tryLaterText}</span>{' '}
          </Cell>
      }

      {(!isLoading && !showTryLater ) && (
        <List>
          <Section
          // header={title}
          >
            <Cell after=<Icon20ChevronDown /> onClick={() => choosePair()}>
              <Text weight="1">
                {coin1fullName} / {coin2fullName}
              </Text>
            </Cell>
            <Cell>
              <div className={styles.wrapperButtons}>
                <div>
                  <Button
                    onClick={() => buySellTypeChangerHandler('buy')}
                    className={`${styles.buyBtn} ${
                      activeBtn === 1 ? styles.activeBtn : ''
                    }`}
                  >
                    {btnBuyText}
                  </Button>
                </div>

                <div>
                  <Button
                    onClick={() => buySellTypeChangerHandler('sell')}
                    className={`${styles.sellBtn} ${
                      activeBtn === 2 ? styles.activeBtn : ''
                    }`}
                  >
                    {btnSellText}
                  </Button>
                </div>
              </div>
            </Cell>

            {/* <Cell>Маркет ордер - {type}</Cell> */}

            <Select>
              <option>{marketOrdertext}</option>
            </Select>

            <Cell 
            subhead={stockPriceText}
            multiline
            >
              1 {coin1} = {price} {coin2fullName}
            </Cell>
          </Section>

          <Section>
            {type === 'buy' && (
              <>
                {/* <Input
                status="focused"
                header={header1}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                // placeholder='{`${sumT_sub} ${coin}`}'
                value={amount}
                onChange={(e) => qtyHandler(e)}
                onFocus={() => setIsInputActive(true)}
                onBlur={() => setIsInputActive(false)}
              /> */}

                <Input
                  status="focused"
                  header={`${totalText} ${coin2fullName}:`}
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                  // placeholder="I am focused input, are u focused on me?"
                  // value={sliderAmount}
                  value={inputAmount}
                  onChange={(e) => qtyHandler(e)}
                  after={
                    <Tappable
                      Component="div"
                      style={{
                        display: 'flex',
                        color: '#168acd',
                        fontWeight: '600',
                      }}
                      onClick={() => maxBtnHandler(type)}
                    >
                      {wordMaximum}
                    </Tappable>
                  }
                />

                <Slider
                  step={1}
                  onChange={(value) => changeSlider(value, type)}
                />

                {showError && (
                  <Cell before={<Icon28CloseAmbient />}>
                    <span className={styles.errorText}>{errorText}</span>{' '}
                  </Cell>
                )}

                <Cell subhead={availableText}>
                  {coin2qty} {coin2fullName}
                </Cell>

                <Cell subhead={maxBuyText}>
                  {maxBuy} {coin1fullName}
                </Cell>

                {showActionBtn && (
                  <div className={styles.wrapperActionBtn}>
                    <Button
                      loading = {actionBtnLoading}
                      onClick={() => actionBtnHandler('buy')}
                      stretched
                      className={styles.buyActionBtn}
                    >
                      {btnBuyText} {coin1fullName}
                    </Button>
                  </div>
                )}
              </>
            )}

            {type === 'sell' && (
              <>
                <Input
                  status="focused"
                  header={`Всего ${coin1fullName}:`}
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                  // placeholder="I am focused input, are u focused on me?"
                  value={inputAmount}
                  onChange={(e) => qtyHandler(e)}
                  after={
                    <Tappable
                      Component="div"
                      style={{
                        display: 'flex',
                        color: '#168acd',
                        fontWeight: '600',
                      }}
                      onClick={() => maxBtnHandler(type)}
                    >
                      Макс
                    </Tappable>
                  }
                />

                <Slider
                  step={1}
                  onChange={(value) => changeSlider(value, type)}
                />

                {showError && (
                  <Cell before={<Icon28CloseAmbient />}>
                    <span className={styles.errorText}>{errorText}</span>{' '}
                  </Cell>
                )}

                <Cell subhead="Доступно:">
                  {coin1qty} {coin1fullName}
                </Cell>

                <Cell subhead="Макс. продажа:">
                  {maxSell} {coin2fullName}
                </Cell>

                {showActionBtn && (
                  <div className={styles.wrapperActionBtn}>
                    <Button
                      onClick={() => actionBtnHandler('sell')}
                      className={styles.sellActionBtn}
                      stretched
                    >
                      {btnSellText} {coin1fullName}
                    </Button>
                  </div>
                )}
              </>
            )}
          </Section>
          <Section style={{ marginBottom: 100 }}>
            <TabsList>
              {options.map((option) => (
                <TabsList.Item
                  key={option.id}
                  selected={selectedTab === option.id}
                  onClick={() => segmentBtnHandler(option.id)}
                >
                  {option.label}
                </TabsList.Item>
              ))}
            </TabsList>

            {selectedTab === 'tab1' && (
              <>
                {openOrdersArray.map((order: any) => (
                  <>
                    <Cell
                      // key={coin.currency}
                      subtitle={order.info[language]}
                      // after={<Cell>{order.status[language]}</Cell>}
                      after={<Cell><CachedIcon/></Cell>}
                      // className={styles.activiText}
                    >
                      {order.type[language]}
                    </Cell>
                    <Divider />
                  </>
                ))}
              </>
            )}

            {selectedTab === 'tab2' && (
              <>
                {doneOrdersArray.map((order: any) => (
                  <>
                    <Cell
                      // key={coin.currency}
                      subtitle={order.info[language]}
                      // after={<Cell>{order.formattedDate}</Cell>}
                      after={<Cell><CheckCircleIcon/></Cell>}
                      className={styles.activiText}
                    >
                     {order.formattedDate} | {order.type[language]} 
                    </Cell>
                    <Divider />
                  </>
                ))}
              </>
            )}
          </Section>
        </List>
      )}
      <TabbarMenu />
    </Page>
  );
};
