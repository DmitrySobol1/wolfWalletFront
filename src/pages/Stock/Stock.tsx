import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';

import axios from '../../axios.ts';
import { LanguageContext } from '../../components/App.tsx';

import { useTlgid } from '../../components/Tlgid';
import { settingsButton } from '@telegram-apps/sdk';

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
  Title,
} from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page.tsx';
import { Icon20ChevronDown } from '@telegram-apps/telegram-ui/dist/icons/20/chevron_down';
import { Icon28CloseAmbient } from '@telegram-apps/telegram-ui/dist/icons/28/close_ambient';

import { TryLater } from '../../components/TryLater/TryLater.tsx';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { TEXTS } from './texts.ts';
import styles from './stock.module.css';

export const Stock: FC = () => {
  const tlgid = useTlgid();

  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  

  const [loadingCenterSection, setLoadingCenterSection] = useState(false);
  const [showTryLater, setShowTryLater] = useState(false);
  const [price, setPrice] = useState(0);
  const [coin1, setCoin1] = useState('');
  const [coin2, setCoin2] = useState('');
  const [coin1fullName, setCoin1full] = useState('');
  const [coin2fullName, setCoin2full] = useState('');
  const [coin1qty, setCoin1qty] = useState(0);
  const [coin2qty, setCoin2qty] = useState(0);
  const [maxBuy, setMaxBuy] = useState(0);
  const [maxSell, setMaxSell] = useState(0);
  const [type, setType] = useState('buy');
  const [chain1, setChain1] = useState('');
  const [chain2, setChain2] = useState('');
  const [inputAmount, setInputAmount] = useState(0);
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [showActionBtn, setShowActionBtn] = useState(true);
  const [activeBtn, setActiveBtn] = useState(1);
  const [minOperationNumber, setMinOperationNumber] = useState(0);
  const [actionBtnLoading, setActionBtnLoading] = useState(false);
  const [isLimitOrder, setIsLimitOrder] = useState(false);
  const [valueSelectToggleMarketLimit, setValueSelectToggleMarketLimit] = useState('market');
  const [limitPrice, setLimitPrice] = useState(0);
  const [selectedTab, setSelectedTab] = useState('tab1');


  const {
    coin1New,
    coin1NewFull,
    coin1chainNew,
    coin2New,
    coin2NewFull,
    coin2chainNew,
  } = location.state || {};


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
  const {
    limitOrdertext,
    notEnoughText,
    zeroText,
    minSumText,
    maxBuyText,
    availableText,
    wordMaximum,
    priceLimitText,
    maxSellText,
    openOrder,
    historyOrder,
    tryLaterText,
    btnBuyText,
    btnSellText,
    marketOrdertext,
    stockPriceText,
    totalText,
    noOpenText,
    noHistoryText,
    //@ts-ignore
  } = TEXTS[language];

 
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
          const response = await axios.get('/stock/get_stock_pairs');
          if (response.data.statusBE === 'notOk') {
            setShowTryLater(true);
            setIsLoading(false);
          }
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

        // получаем цену по выбранной паре
        const priceResponse = await axios.get('/stock/get_ticker', {
          params: { pair: `${selectedCoin1}-${selectedCoin2}` },
        });

        if (priceResponse.data.statusBE === 'notOk') {
          setShowTryLater(true);
          setIsLoading(false);
        }

        setPrice(priceResponse.data.data.price);
        setLimitPrice(priceResponse.data.data.price);

        //получаем баланс в NP
        const amountResponse = await axios.get(
          '/wallet/get_balance_for_pay_out',
          {
            params: {
              tlgid: tlgid,
            },
          }
        );

        if (amountResponse.data.statusBE === 'notOk') {
          setShowTryLater(true);
          setIsLoading(false);
        }

        let Coin1qtyForCounting = 0;
        let Coin2qtyForCounting = 0;

        //@ts-ignore
        amountResponse.data.dataForFront.arrayOfUserBalanceWithUsdPrice.forEach((item) => {
            if (item.currency == selectedCoin1full.toLowerCase()) {
              setCoin1qty(item.amount);
              Coin1qtyForCounting = item.amount;
            }

            if (item.currency == selectedCoin2full.toLowerCase()) {
              setCoin2qty(item.amount);
              Coin2qtyForCounting = item.amount;
            }
          }
        );

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

        // получить комиссию сети за вывод мотеты
        let networkFeeResult = 0;
        if (type == 'buy') {
          networkFeeResult = await getNetworkFee(selectedCoin2full);
          if (!networkFeeResult) {
            setShowTryLater(true);
            setIsLoading(false);
          }
        }

        if (type == 'sell') {
          networkFeeResult = await getNetworkFee(selectedCoin1full);
          if (!networkFeeResult) {
            setShowTryLater(true);
            setIsLoading(false);
          }
        }

        //получить нашу комиссию
        const ourComissionResult = await getOurComission();

        if (!ourComissionResult) {
          setShowTryLater(true);
          setIsLoading(false);
        }

        // получаем минимальные суммы для withdraw/deposit
        if (type == 'buy') {
          const arrayMinimals1: number[] = [];
          const arrayMinimals2: number[] = [];

          const minWithdrawNpResult = await minWithdrawNp(selectedCoin2full);

          if (!minWithdrawNpResult) {
            setShowTryLater(true);
            setIsLoading(false);
          }

          arrayMinimals1.push(minWithdrawNpResult);

          const minDepositStockResult = await minDepositStock(
            selectedCoin2,
            selectedChain2
          );

          if (!minDepositStockResult) {
            setShowTryLater(true);
            setIsLoading(false);
          }

          arrayMinimals1.push(minDepositStockResult);

          const minDepositNpResult = await minDepositNp(selectedCoin1full);

          if (!minDepositNpResult) {
            setShowTryLater(true);
            setIsLoading(false);
          }

          arrayMinimals2.push(minDepositNpResult);

          const minWithdrawStockResult = await minWithdrawStock(
            selectedCoin1,
            selectedChain1
          );

          if (!minWithdrawStockResult) {
            setShowTryLater(true);
            setIsLoading(false);
          }

          arrayMinimals2.push(minWithdrawStockResult);

          //подсчет минимальной для операции сумму
          const maxFromMinimal1 = Math.max(...arrayMinimals1);
          const maxFromMinimal2 = Math.max(...arrayMinimals2);

          const minimalOne_step1 =
            (maxFromMinimal1 + networkFeeResult) / 1 - ourComissionResult / 100;
          const minimalOne_step2 = minimalOne_step1 + minimalOne_step1 * 0.2;
          const minimalOne = minimalOne_step2;

          const percentKoefficient = 5;
          const minimalTwo_step1 =
            maxFromMinimal2 / (1 - percentKoefficient / 100);
          const minimalTwo_step2 =
            minimalTwo_step1 * priceResponse.data.data.price;
          const minimalTwo_step3 =
            (minimalTwo_step2 + networkFeeResult) /
            (1 - ourComissionResult / 100);
          const minimalTwo_step4 = minimalTwo_step3 + minimalTwo_step3 * 0.2;
          const minimalTwo = minimalTwo_step4;

          if (minimalOne > minimalTwo) {
            setMinOperationNumber(minimalOne);
          } else {
            setMinOperationNumber(minimalTwo);
          }
        }

        if (type == 'sell') {
          const arrayMinimals1: number[] = [];
          const arrayMinimals2: number[] = [];

          const minWithdrawNpResult = await minWithdrawNp(selectedCoin1full);

          if (!minWithdrawNpResult) {
            setShowTryLater(true);
            setIsLoading(false);
          }

          arrayMinimals1.push(minWithdrawNpResult);

          const minDepositStockResult = await minDepositStock(
            selectedCoin1,
            selectedChain1
          );

          if (!minDepositStockResult) {
            setShowTryLater(true);
            setIsLoading(false);
          }

          arrayMinimals1.push(minDepositStockResult);

          const minDepositNpResult = await minDepositNp(selectedCoin2full);
          if (!minDepositNpResult) {
            setShowTryLater(true);
            setIsLoading(false);
          }

          arrayMinimals2.push(minDepositNpResult);

          const minWithdrawStockResult = await minWithdrawStock(
            selectedCoin2,
            selectedChain2
          );

          if (!minWithdrawStockResult) {
            setShowTryLater(true);
            setIsLoading(false);
          }

          arrayMinimals2.push(minWithdrawStockResult);

          //подсчет минимальной для операции сумму
          const maxFromMinimal1 = Math.max(...arrayMinimals1);
          const maxFromMinimal2 = Math.max(...arrayMinimals2);

          const minimalOne_step1 =
            (maxFromMinimal1 + networkFeeResult) / 1 - ourComissionResult / 100;
          const minimalOne_step2 = minimalOne_step1 + minimalOne_step1 * 0.2;

          const minimalOne = minimalOne_step2;

          const percentKoefficient = 5;
          const minimalTwo_step1 =
            maxFromMinimal2 / (1 - percentKoefficient / 100);
          const minimalTwo_step2 =
            minimalTwo_step1 / priceResponse.data.data.price;
          const minimalTwo_step3 =
            (minimalTwo_step2 + networkFeeResult) /
            (1 - ourComissionResult / 100);
          const minimalTwo_step4 = minimalTwo_step3 + minimalTwo_step3 * 0.2;
          const minimalTwo = minimalTwo_step4;

          if (minimalOne > minimalTwo) {
            setMinOperationNumber(minimalOne);
          } else {
            setMinOperationNumber(minimalTwo);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке пары или цены:', error);
        setShowTryLater(true);
      } finally {
        setIsLoading(false);
        setLoadingCenterSection(false);
      }
    };

    fetchPairAndPrice();
  }, [type]);

  // расчет минимальных суммы переводов
  async function minWithdrawNp(coin: string) {
    try {
      const response = await axios.get('/stock/get_minWithdrawNp', {
        params: {
          coin: coin,
        },
      });

      if (!response) {
        setShowTryLater(true);
        setIsLoading(false);
      }

      return response.data.result;
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      setShowTryLater(true);
      setIsLoading(false);
    }
  }

  async function minDepositStock(coin: string, chain: string) {
    try {
      const response = await axios.get('/stock/get_minDepositWithdrawStock', {
        params: {
          coin: coin,
          chain: chain,
        },
      });

      if (!response) {
        setShowTryLater(true);
        setIsLoading(false);
      }

      return response.data.deposit;
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      setShowTryLater(true);
      setIsLoading(false);
    }
  }

  async function minDepositNp(coin: string) {
    try {
      const response = await axios.get('/stock/get_minDepositNp', {
        params: {
          coin: coin,
        },
      });

      if (!response) {
        setShowTryLater(true);
        setIsLoading(false);
      }

      return response.data.result;
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      setShowTryLater(true);
      setIsLoading(false);
    }
  }

  async function minWithdrawStock(coin: string, chain: string) {
    try {
      const response = await axios.get('/stock/get_minDepositWithdrawStock', {
        params: {
          coin: coin,
          chain: chain,
        },
      });

      if (!response) {
        setShowTryLater(true);
        setIsLoading(false);
      }

      return response.data.withdrawal;
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      setShowTryLater(true);
      setIsLoading(false);
    }
  }

  // получить комиссию сети
  async function getNetworkFee(coin: string) {
    try {
      const response = await axios.get('/payout/get_withdrawal_fee', {
        params: {
          coin: coin,
          amount: 1,
        },
      });

      if (response.data.statusBE === 'notOk') {
        setShowTryLater(true);
        setIsLoading(false);
        return;
      }

      return response.data.networkFees;
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      setShowTryLater(true);
      setIsLoading(false);
    } finally {
    }
  }

  // ..получение нашей комиссии (число в )
  async function getOurComission() {
    try {
      const response = await axios.get('/stock/get_ourComissionStockMarket');

      if (response.data.statusBE === 'notOk') {
        setShowTryLater(true);
        setIsLoading(false);
      }

      //в БД число хранится в процентах
      const inPercent = response.data.comission;
      return inPercent;
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      setShowTryLater(true);
      setIsLoading(false);
    } finally {
    }
  }

  // получить открытые ордера
  const [openOrdersArray, setOpenOrdersArray] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/stock/get_myOpenOrders', {
          params: {
            tlgid: tlgid,
          },
        });

        if (response.data.statusBE === 'notOk') {
          setShowTryLater(true);
          setIsLoading(false);
        }

        if (response.data.statusFn == 'ok' && response.data.count >= 1) {
          setOpenOrdersArray(response.data.data);
        } else {
          const newItem = {
            type: {
              ru: '',
              en: '',
              de: '',
            },
            info: {
              ru: noOpenText,
              en: noOpenText,
              de: noOpenText,
            },
          };

          //@ts-ignore
          setOpenOrdersArray([newItem]);
        }
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        setShowTryLater(true);
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // получить закрытые ордера
  const [doneOrdersArray, setDoneOrdersArray] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/stock/get_myDoneOrders', {
          params: {
            tlgid: tlgid,
          },
        });

        if (response.data.statusBE === 'notOk') {
          setShowTryLater(true);
          setIsLoading(false);
        }

        if (response.data.statusFn == 'ok' && response.data.count >= 1) {
          setDoneOrdersArray(response.data.data);
        } else {
          const newItem = {
            type: {
              ru: '',
              en: '',
              de: '',
            },
            info: {
              ru: noHistoryText,
              en: noHistoryText,
              de: noHistoryText,
            },
          };

          //@ts-ignore
          setDoneOrdersArray([newItem]);
        }
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        setShowTryLater(true);
        setIsLoading(false);
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
    setLoadingCenterSection(true);
    setShowError(false);
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
        setInputAmount(coin2qty);
        console.log('достиг 100% | слайдер=', coin2qty);

        if (coin2qty < minOperationNumber) {
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
        setInputAmount(counting);

        if (counting < minOperationNumber) {
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
        setInputAmount(coin1qty);
        console.log('достиг 100% | слайдер=', coin1qty);

        if (coin1qty < minOperationNumber) {
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
        setInputAmount(counting);

        if (counting < minOperationNumber) {
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
    setInputAmount(normalizedValue);

    setShowError(false);
    setShowActionBtn(true);

    const check = /^[\d.]*$/.test(inputValue);
    if (!check) {
      console.log('stop');
      return;
    }

    //@ts-ignore FIXME:
    if (inputValue == 0) {
      setErrorText(zeroText);
      setShowError(true);
      setShowActionBtn(false);
      return;
    }

    if (
      Number(inputValue) < minOperationNumber &&
      (type == 'buy' || type == 'sell')
    ) {
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
      return;
    }
  }

  //function qtyHandler for limit price
  async function qtyHandlerLimitPrice(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    const normalizedValue = Number(
      inputValue
        .replace(/,/g, '.')
        .replace(/[^\d.]/g, '')
        .replace(/^(\d*\.?\d*).*/, '$1')
    ); // Удаляет всё после второй точки

    setLimitPrice(normalizedValue);

    setShowError(false);
    setShowActionBtn(true);

    const check = /^[\d.]*$/.test(inputValue);
    if (!check) {
      console.log('stop');
      return;
    }

    const countingBuy = Number(
      (Number(coin2qty) / Number(normalizedValue)).toFixed(6)
    );
    setMaxBuy(countingBuy);

    const countingSell = Number(
      (Number(normalizedValue) * Number(coin1qty)).toFixed(6)
    );
    setMaxSell(countingSell);

    if (Number(inputValue) == 0) {
      setErrorText(zeroText);
      setShowError(true);
      setShowActionBtn(false);
      return;
    }
  }

  //function actionBtnHandler
  function actionBtnHandler(type: string) {
    if (inputAmount == 0) {
      setErrorText(zeroText);
      setShowError(true);
      return;
    }

    setActionBtnLoading(true);
    let text = '';

    if (isLimitOrder) {
      if (type === 'buy') {
        text = `купить ${coin1fullName} на ${inputAmount} ${coin2fullName},  по цене 1 ${coin1fullName} = ${limitPrice} ${coin2fullName}`;
      }
      if (type === 'sell') {
        text = `продать ${inputAmount} ${coin1fullName}, по цене 1 ${coin1fullName} = ${limitPrice} ${coin2fullName}`;
      }
    }

    if (!isLimitOrder) {
      if (type === 'buy') {
        text = `купить ${coin1fullName} на ${inputAmount} ${coin2fullName}`;
      }
      if (type === 'sell') {
        text = `продать ${inputAmount} ${coin1fullName} за ${coin2fullName}`;
      }
    }

    //FIXME: добавить функцию для Limit

    //это функция для Market
    const fetchOrderMarket = async () => {
      let data = {};

      if (!isLimitOrder) {
        data = {
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
      }

      if (isLimitOrder) {
        data = {
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
          limitPrice: limitPrice,
        };
      }

      try {
        let response;

        if (!isLimitOrder) {
          response = await axios.post('/stock/new_stockorder_market', data);

          if (response.data.statusBE === 'notOk') {
            setShowTryLater(true);
            setIsLoading(false);
          }
        }

        if (isLimitOrder) {
          response = await axios.post('/stock/new_stockorder_limit', data);

          if (response.data.statusBE === 'notOk') {
            setShowTryLater(true);
            setIsLoading(false);
          }
        }

        if (response?.data?.statusFn == 'saved') {
          navigate('/stock_3success-page');
        } else {
          setErrorText(tryLaterText);
          setShowError(true);
          setActionBtnLoading(false);
        }
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        setShowTryLater(true);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderMarket();
  }

  //@ts-ignore
  const handleTogle = (value) => {
    setValueSelectToggleMarketLimit(value.target.value);

    if (value.target.value === 'market') {
      setIsLimitOrder(false);
    } else if (value.target.value === 'limit') {
      setIsLimitOrder(true);
    }
  };

  function limitPriceHndl(action: string) {
    let counting = 1;

    if (action == 'plus') {
      if (limitPrice == 0) {
        counting = Number(
          (Number(counting) + Number(counting * 0.05)).toFixed(6)
        );
        setLimitPrice(counting);
        return;
      }

      counting = Number(
        (Number(limitPrice) + Number(limitPrice * 0.05)).toFixed(6)
      );
      setLimitPrice(counting);
    }

    if (action == 'minus') {
      counting = Number(
        (Number(limitPrice) - Number(limitPrice * 0.05)).toFixed(6)
      );
      setLimitPrice(counting);
    }

    const countingBuy = Number(
      (Number(coin2qty) / Number(counting)).toFixed(6)
    );
    setMaxBuy(countingBuy);

    const countingSell = Number(
      (Number(counting) * Number(coin1qty)).toFixed(6)
    );
    setMaxSell(countingSell);
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
          <Section>
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

            <Select
              value={valueSelectToggleMarketLimit}
              //@ts-ignore
              onChange={(value) => handleTogle(value)}
            >
              <option value="market">{marketOrdertext}</option>
              <option value="limit">{limitOrdertext}</option>
            </Select>

            <Cell subhead={stockPriceText} multiline>
              1 {coin1} = {price} {coin2fullName}
            </Cell>
          </Section>

          {loadingCenterSection && (
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

          {!loadingCenterSection && (
            <Section>
              {type === 'buy' && (
                <>
                  {isLimitOrder && (
                    <div>
                      <Input
                        status="focused"
                        header={`${priceLimitText} (${coin2})`}
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*\.?[0-9]*"
                        onChange={(e) => qtyHandlerLimitPrice(e)}
                        value={limitPrice}
                        after={
                          <div className={styles.wrapperPriceDiv}>
                            <div>
                              <Tappable
                                Component="div"
                                style={{
                                  display: 'flex',
                                  color: '#168acd',
                                  fontWeight: '600',
                                }}
                                onClick={() => limitPriceHndl('plus')}
                              >
                                <Title level="1" weight="1">
                                  +
                                </Title>
                              </Tappable>
                            </div>
                            <div>
                              <Tappable
                                Component="div"
                                style={{
                                  display: 'flex',
                                  color: '#168acd',
                                  fontWeight: '600',
                                }}
                                onClick={() => limitPriceHndl('minus')}
                              >
                                <Title level="1" weight="1">
                                  -
                                </Title>
                              </Tappable>
                            </div>
                          </div>
                        }
                      />
                    </div>
                  )}

                  <Input
                    status="focused"
                    header={`${totalText} ${coin2fullName}:`}
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
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
                        loading={actionBtnLoading}
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
                  {isLimitOrder && (
                    <div>
                      <Input
                        status="focused"
                        header={`${priceLimitText} (${coin2})`}
                        type="text"
                        inputMode="decimal"
                        onChange={(e) => qtyHandlerLimitPrice(e)}
                        pattern="[0-9]*\.?[0-9]*"
                        value={limitPrice}
                        after={
                          <div className={styles.wrapperPriceDiv}>
                            <div>
                              <Tappable
                                Component="div"
                                style={{
                                  display: 'flex',
                                  color: '#168acd',
                                  fontWeight: '600',
                                }}
                                onClick={() => limitPriceHndl('plus')}
                              >
                                <Title level="1" weight="1">
                                  +
                                </Title>
                              </Tappable>
                            </div>
                            <div>
                              <Tappable
                                Component="div"
                                style={{
                                  display: 'flex',
                                  color: '#168acd',
                                  fontWeight: '600',
                                }}
                                onClick={() => limitPriceHndl('minus')}
                              >
                                <Title level="1" weight="1">
                                  -
                                </Title>
                              </Tappable>
                            </div>
                          </div>
                        }
                      />
                    </div>
                  )}

                  <Input
                    status="focused"
                    header={`${totalText} ${coin1fullName}:`}
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
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
                    {coin1qty} {coin1fullName}
                  </Cell>

                  <Cell subhead={maxSellText}>
                    {maxSell} {coin2fullName}
                  </Cell>

                  {showActionBtn && (
                    <div className={styles.wrapperActionBtn}>
                      <Button
                        loading={actionBtnLoading}
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
          )}

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
                    <Cell subtitle={order.info[language]}>
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
                      subtitle={order.info[language]}
                      className={styles.activiText}
                    >
                      {order.formattedDate} {order.type[language]}
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
