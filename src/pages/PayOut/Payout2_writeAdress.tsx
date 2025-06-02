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
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext,useEffect } from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';



import axios from '../../axios';

import { Page } from '@/components/Page.tsx';


import { Icon28CloseAmbient } from '@telegram-apps/telegram-ui/dist/icons/28/close_ambient';
import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';


import styles from './payout.module.css';
import { TEXTS } from './texts.ts';

export const Payout2_writeAdress: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { coin, amount } = location.state || {};

  const [adress, setAdress] = useState('');
  const [sum, setSum] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [minSumToWithdraw,setMinSumToWithdraw] = useState(0)
  const [ourComission,setOurComission] = useState(0)
  const [isInputActive, setIsInputActive] = useState(false);
  const [networkFees,setNetworkFees] = useState(0)
  
  const { language } = useContext(LanguageContext);
  
  
  //FIXME: если переносить на несколько строк, возникает ошибка!!!
  // @ts-ignore
  const {title2,balanceT,comissionT,adressT,adress_sub,sumT,sumT_sub,max,nextbtn,errorEmpty,errorNotValid,errorSumEpmty,errorSumTooBig,errrorBalanceLow,errorSumLow,errorMinSumBig,minSumT,commisionTextWhenLoad} = TEXTS[language];
  

  const [totalComissionNum,setTotalComissionNum]=useState(0)
  const [totalComissionText,setTotalComissionText] = useState(commisionTextWhenLoad)


  // получаем мин сумму и our comission
  useEffect(() => {
      const fetchMinSumAndComission = async () => {
        try {
          const response = await axios.get('/get_info_for_payout', {
            params: {
              coin: coin,
            },
          });
  
          // FIXME: если с сервера придет статус = false, то показать компонент oops
          if (response.data.status === true){
            setMinSumToWithdraw(response.data.minSumToWithdraw)
            setOurComission(response.data.ourComission)
          }
      
          
          console.log(response.data)
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        } finally {
          setIsLoading(false)
        }
      };
  
      fetchMinSumAndComission();
    }, []);



//получаем network fees
    useEffect(() => {
      const fetchNetworkComission = async () => {

        const sumToBeChargedByNetworkFees = Number(sum) - Number(ourComission)
        
        if (!isInputActive || !sum) return;
        try {
          const response = await axios.get('/get_withdrawal_fee', {
            params: {
              coin: coin,
              amount:sumToBeChargedByNetworkFees
            },
          });
          
          setNetworkFees(response.data.networkFees)
          const countingComission = response.data.networkFees + ourComission
          setTotalComissionNum(countingComission)

          const coinUp = coin.toUpperCase()
          const textToDisplay = `${countingComission} ${coinUp}`
          setTotalComissionText(textToDisplay)

          
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        } finally {
          // setShowLoader(false);
          // setWolfButtonActive(true);
        }
      };
  
      fetchNetworkComission();
    }, [sum]);





  function adressHandler(e: any) {
    setAdress(e.target.value);
    setShowError(false);
  }

  function sumHandler(e: any) {

    if (e.target.value === ''){
      setTotalComissionText(commisionTextWhenLoad)
    }

    setSum(e.target.value);
    setShowError(false);
  }

  async function nextBtnHandler() {
    setIsLoading(true)
    let checkAdress = false;
    let checkSum = false;

    try {
      if (adress === '') {
        setErrorText(errorEmpty);
        setShowError(true);
        return;
      }

      const response = await axios.post('/validate_adress', {
        adress: adress,
        coin: coin,
      });

      if (response.data === 'OK') {
        checkAdress = true;
        console.log('adress OKK');
      }
    } catch (error) {
      
      setErrorText(errorNotValid);
      setShowError(true);
      console.error('Ошибка при выполнении запроса:', error);
      return;
    } finally {
      setIsLoading(false)
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
    } else if (totalComissionNum>=amount){
      //text = ваш баланс должен быть больше комиссии
      setErrorText(errrorBalanceLow);
      setShowError(true);
    } else if (totalComissionNum>=Number(sum)){
      //text = сумма должна быть больше комисии, иначе вы получите 0
      setErrorText(errorSumLow);
      setShowError(true);

    } else if (minSumToWithdraw>Number(sum)){
      //text = введенная сумма меньше мин суммы для вывода
      setErrorText(errorMinSumBig);
      setShowError(true);
    }
    else if (amount >= sum) {
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
          networkFees
        },
      });
    }

    // payout_3showcomission-page
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
              status="focused"
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
              status="focused"
              header={
                <span>
                  {sumT} <span className={styles.inputHeaderText}>{coin}</span>
                </span>
              }
              placeholder={`${sumT_sub} ${coin}`}
              value={sum}
              onChange={(e) => sumHandler(e)}
              onFocus={() => setIsInputActive(true)}
              after={
                <Tappable
                  Component="div"
                  style={{
                    display: 'flex',
                    color: '#168acd',
                    fontWeight: '600',
                  }}
                  onClick={() => setSum(amount)}
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
