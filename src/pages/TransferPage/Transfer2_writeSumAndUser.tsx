import {
  Section,
  List,
  Cell,
  Input,
  Tappable,
  Button,
  Spinner,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';

import { useState, useContext, useEffect } from 'react';
import { LanguageContext } from '../../components/App.tsx';

import axios from '../../axios.ts';

import { Page } from '@/components/Page.tsx';

import { Icon28CloseAmbient } from '@telegram-apps/telegram-ui/dist/icons/28/close_ambient';
import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';

import styles from './transfer.module.css';
import { TEXTS } from './texts.ts';

export const Transfer2_writeSumAndUser: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { coin, amount } = location.state || {};

  const [adress, setAdress] = useState('');
  const [sum, setSum] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ourComission, setOurComission] = useState(0);
  const [totalComissionText, setTotalComissionText] = useState('');

  const { language } = useContext(LanguageContext);

  //FIXME: если переносить на несколько строк, возникает ошибка!!!
  // @ts-ignore
  const {title2,balanceT,comissionT,adressT,adress_sub,sumT,sumT_sub,max,nextbtn,errorEmpty,userNoExist,errorSumEpmty,errorSumTooBig,errorUser,errorSumLow } = TEXTS[language];



  //получаем transfer комиссию
  useEffect(() => {
    const fetchTransferComission = async () => {
      try {
        // FIXME: any
        const response: any = await axios.get('/get_transfer_fee', {
          params: {
            coin: coin,
          },
        });

        if (response.data.status == 'ok') {
          console.log('TRT COMISSON=', response);
          setOurComission(response.data.qty);
          const coinUp = coin.toUpperCase();
          const textToDisplay = `${response.data.qty} ${coinUp}`;
          setTotalComissionText(textToDisplay);
        }

        //FIXME:
        // если с сервера вернется ошибка или статус 'coin not found', то вывести объект oops
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
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
    // setIsInputActive(true)
    setShowError(false);
    const counting = String(Number(amount) - Number(ourComission));
    setSum(counting);
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

      const response = await axios.post('/get_user', {
        adress: adress,
      });

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
    } else if (Number(amount) < Number(sum) + Number(ourComission)) {
      setErrorText(errorSumTooBig);
      setShowError(true);
      return;
    } else if (ourComission >= Number(sum)) {
      //text = сумма должна быть больше комисии, иначе вы получите 0
      setErrorText(errorSumLow);
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

            {/* <Cell
              subtitle={
                <span>
                  {minSumToWithdraw}{' '}
                  <span className={styles.inputHeaderText}>{coin}</span>
                </span>
              }
            >
              {minSumT}
            </Cell> */}

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
              // onFocus={() => setIsInputActive(true)}
              // onBlur={() => setIsInputActive(false)}
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
