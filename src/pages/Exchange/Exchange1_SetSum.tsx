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
import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';

import { useTlgid } from '../../components/Tlgid';

// import vsaarrows from '../../img/vs_arrows.png';
// import { settingsButton } from '@telegram-apps/sdk';

import axios from '../../axios.ts';

import { Page } from '@/components/Page.tsx';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';
import { Icon28CloseAmbient } from '@telegram-apps/telegram-ui/dist/icons/28/close_ambient';

import { TEXTS } from './texts.ts';

import styles from './exchange.module.css';

export const Exchange1_SetSum: FC = () => {
  const tlgid = useTlgid();

  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const { choosedCoin, typeCoin, oppositeCoin } = location.state || {};

  //FIXME:
  // @ts-ignore
  const {wordMaximum,header1,youGetText,errorSumTooBig,errorMinSumBig,nextBtn,} = TEXTS[language];

  const [comissions, setComissions] = useState([]);
  const [coinFrom, setCoinFrom] = useState('TON');
  const [coinTo, setCoinTo] = useState('ETH');
  const [amount, setAmount] = useState(0);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [minAmount, setMinAmount] = useState(0);
  // const [showMinAmount, setShowMinAmount] = useState(false);
  const [nowpaymentComission, setNowpaymentComission] = useState(0);
  const [ourComission, setOurComission] = useState(0);
  const [maxAmount, setMaxAmount] = useState(0);
  const [isInputActive, setIsInputActive] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [showNextBtn, setShowNextBtn] = useState(false);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        // const responseCoins = await axios.get('/get_available_coins');
        // setCoins(responseCoins.data.selectedCurrencies);

        const responseComissions = await axios.get('/get_comissionExchange');
        setComissions(responseComissions.data.data);

        let fromForCalculate = coinFrom;

        if (choosedCoin) {
          if (typeCoin === 'from') {
            setCoinFrom(choosedCoin);
            setCoinTo(oppositeCoin);
            fromForCalculate = choosedCoin;

            console.log('FETCH 1 | выбрал монету From');
            console.log('coinFrom=', fromForCalculate);
            console.log('coinTo=', oppositeCoin);
          } else if (typeCoin === 'to') {
            setCoinTo(choosedCoin);
            setCoinFrom(oppositeCoin);
            fromForCalculate = oppositeCoin;

            console.log('FETCH 1 | выбрал монету To');
            console.log('coinFrom=', oppositeCoin);
            console.log('coinTo=', choosedCoin);
          }
        } else {
          console.log('FETCH 1 | пришел с главной страницы');
          console.log('coinFrom=', fromForCalculate);
          console.log('coinTo=', coinTo);
        }

        // @ts-ignore FIXME:
        responseComissions.data.data.map((item) => {
          if (item.coin === 'nowpayment') {
            setNowpaymentComission(item.qty);
            console.log('FETCH 1 | nowpayment comission=', item.qty);
          }

          if (
            item.coin === fromForCalculate.toLowerCase() ||
            item.coin === fromForCalculate
          ) {
            setOurComission(item.qty);
            console.log(
              'FETCH 1 | ourCommission для',
              fromForCalculate,
              '=',
              item.qty
            );
          }
        });

        const responseMinAmount = await axios.get('/get_minamount', {
          params: {
            coinFrom: fromForCalculate,
          },
        });

        setMinAmount(responseMinAmount.data.minAmount);
        console.log(
          'FETCH 1 | MinAmount для',
          fromForCalculate,
          '=',
          responseMinAmount.data.minAmount
        );

        // баланс в выбранной валюте
        const responseBalances = await axios.get('/get_balance_currentCoin', {
          params: {
            tlgid: tlgid,
            coin: fromForCalculate.toLowerCase(),
          },
        });

        setMaxAmount(responseBalances.data.balance);

        // // @ts-ignore
        // responseBalances.data.arrayOfUserBalanceWithUsdPrice.map((item) =>{
        //   if (item.currency === fromForCalculate.toLowerCase()){
        //     setMaxAmount(item.amount)
        //   } else {
        //     setMaxAmount(0)
        //   }
        // })

        console.log('BALANCES=', responseBalances.data);

        // setBalances(response.data.arrayOfUserBalanceWithUsdPrice);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoins();
  }, [isInputActive]);

  async function qtyHandler(e: React.ChangeEvent<HTMLInputElement>) {
    // const inputValue = Number(e.target.value);

    const inputValue = e.target.value;

    const normalizedValue = inputValue
      .replace(/,/g, '.')
      .replace(/[^\d.]/g, '')
      .replace(/^(\d*\.?\d*).*/, '$1'); // Удаляет всё после второй точки

    //@ts-ignore FIXME:
    setAmount(normalizedValue);

    setShowError(false);
    setShowNextBtn(false);

    const check = /^[\d.]*$/.test(inputValue);
    if (!check) {
      console.log('stop');
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
    //FIXME: сделать, чтобы только число можно вводить

    // const normalizedValue = inputValue
    // .replace(/,/g, '.')
    // .replace(/[^\d.]/g, '')
    // .replace(/^(\d*\.?\d*).*/, '$1'); // Удаляет всё после второй точки

    const responseConversion = await axios.get('/get_conversion_rate', {
      params: {
        amount: inputValue,
        coinFrom: coinFrom,
        coinTo: coinTo,
      },
    });

    const amountWithoutComission = responseConversion.data.convertedAmount;
    const npCom = amountWithoutComission * nowpaymentComission;
    const ourCom = amountWithoutComission * ourComission;

    const amountWithComission = amountWithoutComission - npCom - ourCom;

    setConvertedAmount(amountWithComission);
    console.log(
      'fullAmount=',
      amountWithoutComission,
      ' npCom=',
      npCom,
      ' ourCom = ',
      ourCom
    );
    setShowNextBtn(true);
  }

  async function maxBtnHandler() {
    setShowNextBtn(false);
    setAmount(maxAmount);

    // setShowMinAmount(false);

    if (maxAmount == 0) {
      setConvertedAmount(0);
      return;
    }

    if (maxAmount < minAmount) {
      setErrorText(errorMinSumBig);
      setShowError(true);
      setConvertedAmount(0);
      return;
    }

    const responseConversion = await axios.get('/get_conversion_rate', {
      params: {
        amount: maxAmount,
        coinFrom: coinFrom,
        coinTo: coinTo,
      },
    });

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
    const from = coinFrom;
    const to = coinTo;

    setCoinFrom(to);
    setCoinTo(from);

    setAmount(0);
    setConvertedAmount(0);
    setShowError(false);

    comissions.map((item) => {
      if (
        //@ts-ignore FIXME:
        item.coin === to.toLowerCase() ||
        //@ts-ignore FIXME:
        item.coin === to
      ) {
        //@ts-ignore FIXME:
        setOurComission(item.qty);
        console.log(
          'FETCH VS | ourCommission для',
          to,
          '=',
          //@ts-ignore FIXME:
          item.qty
        );
      }
    });

    const responseMinAmount = await axios.get('/get_minamount', {
      params: {
        coinFrom: to,
      },
    });

    setMinAmount(responseMinAmount.data.minAmount);

    // баланс в выбранной валюте
    const responseBalances = await axios.get('/get_balance_currentCoin', {
      params: {
        tlgid: tlgid,
        coin: to.toLowerCase(),
      },
    });

    setMaxAmount(responseBalances.data.balance);
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
      },
    });
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
            {/* <Cell>комиссия np = {nowpaymentComission}</Cell>
            <Cell>комиссия наша = {ourComission}</Cell>
            <Cell>мин сумма = {minAmount}</Cell> */}

            <Cell after={<Avatar acronym="↑↓" size={40} onClick={vsBtnHandler} />}>
              <div style = {{display:'flex'}}>
              <Tappable
                Component="span"
                style={{
                  display: 'flex',
                  color: '#168acd',
                  fontWeight: '600',
                }}
                onClick={maxBtnHandler}
              >
                {wordMaximum }{' '}
              </Tappable>{' '}
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
    </Page>
  );
};
