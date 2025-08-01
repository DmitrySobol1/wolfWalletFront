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
  Divider,
  Spinner,
  Input,
  Tappable,
  Button,
  Avatar,
} from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page.tsx';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';
import { Icon28CloseAmbient } from '@telegram-apps/telegram-ui/dist/icons/28/close_ambient';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { TryLater } from '../../components/TryLater/TryLater.tsx';

import { TEXTS } from './texts.ts';
import styles from './exchange.module.css';

export const Exchange1_SetSum: FC = () => {
  const tlgid = useTlgid();

  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { choosedCoin, typeCoin, oppositeCoin } = location.state || {};

  const [comissions, setComissions] = useState([]);
  const [coinFrom, setCoinFrom] = useState('TON');
  const [coinTo, setCoinTo] = useState('BTC');
  const [amount, setAmount] = useState(0);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [minAmount, setMinAmount] = useState(0);
  const [nowpaymentComission, setNowpaymentComission] = useState(0);
  const [ourComission, setOurComission] = useState(0);
  const [maxAmount, setMaxAmount] = useState(0);
  const [isInputActive, setIsInputActive] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [showNextBtn, setShowNextBtn] = useState(false);
  const [showMinSumValue, setShowMinSumValue] = useState(false);
  const [showTryLater, setShowTryLater] = useState(false);

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
    wordMaximum,
    header1,
    youGetText,
    errorSumTooBig,
    errorMinSumBig,
    nextBtn,
    minSumToExchangeText,
    // @ts-ignore
  } = TEXTS[language];

  

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const responseComissions = await axios.get(
          '/exchange/get_comissionExchange'
        );
        if (responseComissions.data.statusBE === 'notOk') {
          setShowTryLater(true);
          setIsLoading(false);
        }

        setComissions(responseComissions.data.data);

        let fromForCalculate = coinFrom;

        if (choosedCoin) {
          if (typeCoin === 'from') {
            setCoinFrom(choosedCoin);
            setCoinTo(oppositeCoin);
            fromForCalculate = choosedCoin;
          } else if (typeCoin === 'to') {
            setCoinTo(choosedCoin);
            setCoinFrom(oppositeCoin);
            fromForCalculate = oppositeCoin;
          }
        } else {
          // console.log('FETCH 1 | пришел с главной страницы');
          // console.log('coinFrom=', fromForCalculate);
          // console.log('coinTo=', coinTo);
        }

        // @ts-ignore FIXME:
        responseComissions.data.data.map((item) => {
          if (item.coin === 'nowpayment') {
            setNowpaymentComission(item.qty);
          }

          if (item.coin === 'ourcomission') {
            setOurComission(item.qty);
          }
        });

        const responseMinAmount = await axios.get('/exchange/get_minamount', {
          params: {
            coinFrom: fromForCalculate,
          },
        });
        if (responseMinAmount.data.statusBE === 'notOk') {
          setShowTryLater(true);
          setIsLoading(false);
        }

        setMinAmount(responseMinAmount.data.minAmount);

        // баланс в выбранной валюте
        const responseBalances = await axios.get(
          '/exchange/get_balance_currentCoin',
          {
            params: {
              tlgid: tlgid,
              coin: fromForCalculate.toLowerCase(),
            },
          }
        );
        if (responseBalances.data.statusBE === 'notOk') {
          setShowTryLater(true);
          setIsLoading(false);
        }

        setMaxAmount(responseBalances.data.balance);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        setShowTryLater(true);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoins();
  }, [isInputActive]);

  async function qtyHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;

    const normalizedValue = inputValue
      .replace(/,/g, '.')
      .replace(/[^\d.]/g, '')
      .replace(/^(\d*\.?\d*).*/, '$1'); // Удаляет всё после второй точки

    //@ts-ignore FIXME:
    setAmount(normalizedValue);

    setShowError(false);
    setShowNextBtn(false);
    setShowMinSumValue(false);

    const check = /^[\d.]*$/.test(inputValue);
    if (!check) {
      // console.log('stop');
      return;
    }

    //@ts-ignore FIXME:
    if (inputValue == 0) {
      setConvertedAmount(0);
      return;
    }

    //@ts-ignore FIXME:
    if (inputValue < minAmount) {
      setErrorText(errorMinSumBig);
      setShowError(true);
      setShowMinSumValue(true);
      setConvertedAmount(0);
      return;
    }

    //@ts-ignore FIXME:
    if (inputValue > maxAmount) {
      setErrorText(errorSumTooBig);
      setShowError(true);
      setConvertedAmount(0);
      return;
    }

    //TODO: добавить, что запрос на сервер не сразу отправлять, а задержкой, когда ввод окончен(как в видео про кросы)

    const responseConversion = await axios.get(
      '/exchange/get_conversion_rate',
      {
        params: {
          amount: inputValue,
          coinFrom: coinFrom,
          coinTo: coinTo,
        },
      }
    );

    if (responseConversion.data.statusBE === 'notOk') {
      setShowTryLater(true);
      setIsLoading(false);
    }

    const amountWithoutComission = responseConversion.data.convertedAmount;

    //т.к. комиссия в БД - это число в %
    const npCom = amountWithoutComission * (nowpaymentComission / 100);
    const ourCom = amountWithoutComission * (ourComission / 100);
    const amountWithComission = Number(
      (amountWithoutComission - npCom - ourCom).toFixed(6)
    );

    setConvertedAmount(amountWithComission);
    setShowNextBtn(true);
  }

  async function maxBtnHandler() {
    setShowNextBtn(false);
    setAmount(maxAmount);
    setShowError(false);
    setShowMinSumValue(false);

    if (maxAmount == 0) {
      setConvertedAmount(0);
      return;
    }

    if (maxAmount < minAmount) {
      setErrorText(errorMinSumBig);
      setShowError(true);
      setShowMinSumValue(true);
      setConvertedAmount(0);
      return;
    }

    const responseConversion = await axios.get(
      '/exchange/get_conversion_rate',
      {
        params: {
          amount: maxAmount,
          coinFrom: coinFrom,
          coinTo: coinTo,
        },
      }
    );

    if (responseConversion.data.statusBE === 'notOk') {
      setShowTryLater(true);
      setIsLoading(false);
    }

    const amountWithoutComission = responseConversion.data.convertedAmount;
    const npCom = amountWithoutComission * nowpaymentComission;
    const ourCom = amountWithoutComission * ourComission;

    const amountWithComission = (
      Number(amountWithoutComission) -
      Number(npCom) -
      Number(ourCom)
    ).toFixed(6);

    // @ts-ignore FIXME:
    setConvertedAmount(amountWithComission);
    setShowNextBtn(true);
  }

  async function vsBtnHandler() {
    try {
      setIsLoading(true);
      setShowNextBtn(false);

      const from = coinFrom;
      const to = coinTo;

      setCoinFrom(to);
      setCoinTo(from);

      setAmount(0);
      setConvertedAmount(0);
      setShowError(false);
      setShowMinSumValue(false);

      comissions.map((item) => {
        if (
          //@ts-ignore FIXME:
          item.coin === to.toLowerCase() ||
          //@ts-ignore FIXME:
          item.coin === to
        ) {
          //@ts-ignore FIXME:
          setOurComission(item.qty);
        }
      });

      const responseMinAmount = await axios.get('/exchange/get_minamount', {
        params: {
          coinFrom: to,
        },
      });

      if (responseMinAmount.data.statusBE === 'notOk') {
        setShowTryLater(true);
        setIsLoading(false);
      }

      setMinAmount(responseMinAmount.data.minAmount);

      // баланс в выбранной валюте
      const responseBalances = await axios.get(
        '/exchange/get_balance_currentCoin',
        {
          params: {
            tlgid: tlgid,
            coin: to.toLowerCase(),
          },
        }
      );

      if (responseMinAmount.data.statusBE === 'notOk') {
        setShowTryLater(true);
        setIsLoading(false);
      }

      setMaxAmount(responseBalances.data.balance);
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      setShowTryLater(true);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }

  function coinChooseBtnHandler(type: string, oppositeCoin: string) {
    navigate('/exchange_2showavailable-page', {
      state: {
        type,
        oppositeCoin,
      },
    });
  }

  function nextBtnHandler() {
    navigate('/exchange_3confirm-page', {
      state: {
        amount,
        coinFrom,
        convertedAmount,
        coinTo,
        nowpaymentComission,
        ourComission,
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
          // header={title}
          >
            <div className={styles.inputDiv}>
              <Input
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
              />

              <span>
                <Tappable
                  Component="div"
                  style={{
                    display: 'flex',
                    color: '#168acd',
                    fontWeight: '600',
                  }}
                  onClick={() => coinChooseBtnHandler('from', coinTo)}
                >
                  {coinFrom}
                  <Icon16Chevron />
                </Tappable>
              </span>
            </div>

            {showError && (
              <Cell before={<Icon28CloseAmbient />}>
                <span className={styles.errorText}>{errorText}</span>{' '}
              </Cell>
            )}

            {/* для отладки */}
            {/* <Cell>комиссия np = {nowpaymentComission}</Cell> */}
            {/* <Cell>комиссия наша = {ourComission}</Cell> */}
            {showMinSumValue && (
              <Cell>
                {minSumToExchangeText} = {minAmount} {coinFrom}
              </Cell>
            )}

            <Cell
              after={<Avatar acronym="↑↓" size={40} onClick={vsBtnHandler} />}
            >
              <div style={{ display: 'flex', gap: '5px' }}>
                <Tappable
                  Component="span"
                  style={{
                    display: 'flex',
                    color: '#168acd',
                    fontWeight: '600',
                  }}
                  onClick={maxBtnHandler}
                >
                  {wordMaximum}
                </Tappable>
                {maxAmount} {coinFrom}
                {/* <Tappable
                // Component="span"
                onClick={vsBtnHandler}
                style={{
                  // display: 'flex',
                  color: '#168acd',
                  fontWeight: '600',
                  paddingLeft: '50px',
                  fontSize: '200',
                }}
              ></Tappable> */}
              </div>
            </Cell>

            {/* <img src={vsaarrows} className={styles.vsImg} /> */}
            <Divider />
            <Divider />
            <Divider />
            <Divider />
            <Divider />

            <div className={styles.inputDiv}>
              <Input
                disabled
                header={youGetText}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                value={convertedAmount}
                onChange={(e) => qtyHandler(e)}
              />
              <span>
                <Tappable
                  Component="div"
                  style={{
                    display: 'flex',
                    color: '#168acd',
                    fontWeight: '600',
                  }}
                  onClick={() => coinChooseBtnHandler('to', coinFrom)}
                >
                  {coinTo}
                  <Icon16Chevron />
                </Tappable>
              </span>
            </div>

            {showNextBtn && (
              <Button mode="filled" size="m" stretched onClick={nextBtnHandler}>
                {nextBtn}
              </Button>
            )}
          </Section>
        </List>
      )}
      <TabbarMenu />
    </Page>
  );
};
