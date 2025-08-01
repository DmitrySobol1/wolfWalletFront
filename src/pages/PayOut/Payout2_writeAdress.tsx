import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';

import axios from '../../axios';
import { LanguageContext } from '../../components/App.tsx';

import {
  Section,
  List,
  Cell,
  Input,
  Tappable,
  Button,
  Spinner,
} from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page.tsx';
import { Icon28CloseAmbient } from '@telegram-apps/telegram-ui/dist/icons/28/close_ambient';
import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';

import { TryLater } from '../../components/TryLater/TryLater.tsx';

import styles from './payout.module.css';
import { TEXTS } from './texts.ts';

export const Payout2_writeAdress: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { coin, amount } = location.state || {};
  const { language } = useContext(LanguageContext);

  const [adress, setAdress] = useState('');
  const [sum, setSum] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [minSumToWithdraw, setMinSumToWithdraw] = useState(0);
  const [ourComission, setOurComission] = useState(0);
  const [isInputActive, setIsInputActive] = useState(false);
  const [networkFees, setNetworkFees] = useState(0);
  const [showTryLater, setShowTryLater] = useState(false);
  const [totalComissionNum, setTotalComissionNum] = useState(0);
  const [extraVar, setExtraVar] = useState(true)

  //FIXME: если переносить на несколько строк, возникает ошибка!!!
  // @ts-ignore
  const {title2,balanceT,comissionT,adressT,adress_sub,sumT,sumT_sub,max,nextbtn,errorEmpty, errorNotValid, errorSumEpmty, errorSumTooBig, errrorBalanceLow, errorSumLow,errorMinSumBig,minSumT,commisionTextWhenLoad, errorEnterBiggerSum} = TEXTS[language];

  const [totalComissionText, setTotalComissionText] = useState(
    commisionTextWhenLoad
  );

  // получаем мин сумму и our comission
  useEffect(() => {
    const fetchMinSumAndComission = async () => {
      try {
        const response = await axios.get('/payout/get_info_for_payout', {
          params: {
            coin: coin,
          },
        });

        if (response.data.statusBE === 'notOk') {
          setShowTryLater(true);
          setIsLoading(false);
        }

        if (response.data.status === true) {
          setMinSumToWithdraw(response.data.minSumToWithdraw);
          setOurComission(response.data.ourComission);
        } else {
          setShowTryLater(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMinSumAndComission();
  }, []);

  //получаем network fees
  useEffect(() => {
    const fetchNetworkComission = async () => {
      const sumToBeChargedByNetworkFees = Number(sum) - Number(ourComission);
      if (sumToBeChargedByNetworkFees <= 0 ){
        setExtraVar(true)
        return
      }

      if (!isInputActive || !sum) return;
      try {

        setExtraVar(false)

        console.log('sum before FN',sum)
        console.log('amount to be charged before FN',sumToBeChargedByNetworkFees)

        const response = await axios.get('/payout/get_withdrawal_fee', {
          params: {
            coin: coin,
            amount: sumToBeChargedByNetworkFees,
          },
        });

        if (response.data.statusBE === 'notOk') {
          setShowTryLater(true);
          setIsLoading(false);
        } else {
          setNetworkFees(response.data.networkFees);
          const countingComission = response.data.networkFees + ourComission;
          setTotalComissionNum(countingComission);

          const coinUp = coin.toUpperCase();
          const textToDisplay = `${countingComission} ${coinUp}`;
          setTotalComissionText(textToDisplay);
        }
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
      }
    };

    fetchNetworkComission();
  }, [sum]);

  
  function adressHandler(e: any) {
    setAdress(e.target.value);
    setShowError(false);
  }

  //заменить запятую на точку в inputе суммы

  const sumHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    const normalizedValue = inputValue
      .replace(/,/g, '.')
      .replace(/[^\d.]/g, '')
      .replace(/^(\d*\.?\d*).*/, '$1'); // Удаляет всё после второй точки

    setSum(normalizedValue);

    if (e.target.value === '') {
      setTotalComissionText(commisionTextWhenLoad);
    }

    setShowError(false);
  };

  function maxBtnHandler() {
    setIsInputActive(true);

    console.log('sum=', sum)
    console.log('amount=', amount)

    setSum(amount);
  }

//   function maxBtnHandler() {
//   setIsInputActive(true);
//   setSum(''); // сброс — чтобы следующий setSum гарантированно вызвал useEffect
//   setTimeout(() => {
//     setSum(amount);
//   }, 0); // ставим в следующую итерацию event loop
// }


  async function nextBtnHandler() {
    setIsLoading(true);
    let checkAdress = false;
    let checkSum = false;

    try {
      if (adress === '') {
        setErrorText(errorEmpty);
        setShowError(true);
        return;
      }

      const response = await axios.post('/payout/validate_adress', {
        adress: adress,
        coin: coin,
      });

      if (response.data.statusBE === 'notOk') {
        setShowTryLater(true);
        setIsLoading(false);
      }

      if (response.data === 'OK') {
        checkAdress = true;
      }
    } catch (error) {
      setErrorText(errorNotValid);
      setShowError(true);
      console.error('Ошибка при выполнении запроса:', error);
      return;
    } finally {
      setIsLoading(false);
    }

    // После окончания асинхронного запроса проверяем сумму
    if (sum === '' || sum === '0') {
      setErrorText(errorSumEpmty);
      setShowError(true);
      return;
    } else if (amount < sum) {
      setErrorText(errorSumTooBig);
      setShowError(true);
      return;
    } else if (totalComissionNum >= amount) {
      //text = ваш баланс должен быть больше комиссии
      setErrorText(errrorBalanceLow);
      setShowError(true);
    } else if (totalComissionNum >= Number(sum)) {
      //text = сумма должна быть больше комисии, иначе вы получите 0
      setErrorText(errorSumLow);
      setShowError(true);
    } else if (minSumToWithdraw > Number(sum)) {
      //text = введенная сумма меньше мин суммы для вывода
      setErrorText(errorMinSumBig);
      setShowError(true);
    } else if (extraVar == true) {
        setErrorText(errorEnterBiggerSum);
        setShowError(true);
    } else if (amount >= sum) {
      checkSum = true;
    }

    if (checkAdress === false || checkSum === false) {
      setShowError(true);
    }

    if (checkAdress && checkSum) {
      navigate('/payout_3showcomission-page', {
        state: {
          coin,
          sum,
          adress,
          ourComission,
          networkFees,
        },
      });
    }
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
            <Cell
              subtitle={
                <span>
                  {amount}{' '}
                  <span className={styles.inputHeaderText}>{coin}</span>
                </span>
              }
            >
              {balanceT}
            </Cell>

            <Cell
              subtitle={
                <span>
                  {minSumToWithdraw}{' '}
                  <span className={styles.inputHeaderText}>{coin}</span>
                </span>
              }
            >
              {minSumT}
            </Cell>

            <Cell subtitle={totalComissionText}>{comissionT}</Cell>
          </Section>

          <Section header={title2}>
            <Input
              // status="focused"
              header={adressT}
              placeholder={adress_sub}
              value={adress}
              onChange={(e) => adressHandler(e)}
              after={
                <Tappable
                  Component="div"
                  style={{
                    display: 'flex',
                  }}
                  onClick={() => setAdress('')}
                >
                  <Icon24Close />
                </Tappable>
              }
            />
            <Input
              // status="focused"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              header={
                <span>
                  {sumT} <span className={styles.inputHeaderText}>{coin}</span>
                </span>
              }
              placeholder={`${sumT_sub} ${coin}`}
              value={sum}
              onChange={(e) => sumHandler(e)}
              onFocus={() => setIsInputActive(true)}
              onBlur={() => setIsInputActive(false)}
              after={
                <Tappable
                  Component="div"
                  style={{
                    display: 'flex',
                    color: '#168acd',
                    fontWeight: '600',
                  }}
                  onClick={maxBtnHandler}
                >
                  {max}
                </Tappable>
              }
            />

            {showError && (
              <Cell before={<Icon28CloseAmbient />}>
                <span className={styles.errorText}>{errorText}</span>{' '}
              </Cell>
            )}

            {/* <Cell>
              <Button mode="filled" size="m" onClick={nextBtnHandler} stretched>
                {nextbtn}
              </Button>
            </Cell> */}

            <div className={styles.wrapperActionBtn}>
                      <Button
                        // loading={actionBtnLoading}
                        onClick={nextBtnHandler}
                        stretched 
                        className={styles.actionBtn}
                      >
                        {nextbtn}
                      </Button>
              </div>

          </Section>
        </List>
      )}
    </Page>
  );
};
