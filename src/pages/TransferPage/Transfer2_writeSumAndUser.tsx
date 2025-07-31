import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';

import { LanguageContext } from '../../components/App.tsx';

import axios from '../../axios.ts';
import { useTlgid } from '../../components/Tlgid';

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

import styles from './transfer.module.css';
import { TEXTS } from './texts.ts';

export const Transfer2_writeSumAndUser: FC = () => {
  const tlgid = useTlgid();

  const navigate = useNavigate();
  const location = useLocation();
  const { coin, amount } = location.state || {};
  const { language } = useContext(LanguageContext);

  const [adress, setAdress] = useState('');
  const [sum, setSum] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTryLater, setShowTryLater] = useState(false);
  const [ourComission, setOurComission] = useState(0);
  const [totalComissionText, setTotalComissionText] = useState('');
  const [selfNowpaymentid, setSelfNowpaymentid] = useState('');

  //FIXME: если переносить на несколько строк, возникает ошибка!!!
  // @ts-ignore
  const {title2,balanceT,comissionT,adressT,adress_sub,sumT,sumT_sub,max,nextbtn,errorEmpty,userNoExist,errorSumEpmty, errorBalanceLow, errorUser, errorSumLow, errorSelfAdress} = TEXTS[language];

  //получаем transfer комиссию
  useEffect(() => {
    const fetchTransferComission = async () => {
      try {
        // FIXME: any
        const response: any = await axios.get('/transfer/get_transfer_fee', {
          params: {
            coin: coin,
            tlgid: tlgid,
          },
        });

        if (response.data.statusBE === 'notOk' || !response.data.status) {
          setShowTryLater(true);
          setIsLoading(false);
        }

        if (response.data.status == 'ok') {
          setSelfNowpaymentid(response.data.selfNowpaymentid);
          setOurComission(response.data.qty);
          const coinUp = coin.toUpperCase();
          const textToDisplay = `${response.data.qty} ${coinUp}`;
          setTotalComissionText(textToDisplay);
        }
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
      }
    };

    fetchTransferComission();
  }, []);

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

    setShowError(false);
  };

  function maxBtnHandler() {
    setShowError(false);
    setSum(amount);
  }

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

      if (adress == selfNowpaymentid) {
        setErrorText(errorSelfAdress);
        setShowError(true);
        return;
      }

      const response = await axios.post('/transfer/get_user', {
        adress: adress,
      });

      if (response.data.statusBE === 'notOk') {
        setShowTryLater(true);
        setIsLoading(false);
      }

      if (response.data.count == 1) {
        checkAdress = true;
        console.log('user существует');
      } else {
        setErrorText(userNoExist);
        setShowError(true);
        console.log('user не существует');
      }
    } catch (error) {
      setErrorText(errorUser);
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
    } else if (ourComission >= Number(sum)) {
      //text = сумма должна быть больше комисии, иначе вы получите 0
      setErrorText(errorSumLow);
      setShowError(true);
      return;
    } else if (Number(amount) < Number(sum)) {
      setErrorText(errorBalanceLow);
      setShowError(true);
      return;
    } else {
      console.log(
        'amount=',
        amount,
        ' comission=',
        ourComission,
        ' sum=',
        sum,
        'sum+ourComission=',
        Number(sum) + Number(ourComission)
      );
      checkSum = true;
    }

    if (checkAdress && checkSum) {
      console.log('all datas Ok');
      navigate('/transfer_3confirm-page', {
        state: {
          coin,
          sum,
          adress,
          ourComission,
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

            <Cell subtitle={totalComissionText}>{comissionT}</Cell>
          </Section>

          <Section header={title2}>
            <Input
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
              <Cell before={<Icon28CloseAmbient />} multiline>
                <span className={styles.errorText}>{errorText}</span>{' '}
              </Cell>
            )}

            <Cell>
              <Button mode="filled" size="m" onClick={nextBtnHandler}>
                {nextbtn}
              </Button>
            </Cell>
          </Section>
        </List>
      )}
    </Page>
  );
};
