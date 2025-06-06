import {
  Section,
  List,
  Button,
  Cell,
  Spinner,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';

import {useTlgid} from '../../components/Tlgid'


import axios from '../../axios';

import styles from './transfer.module.css';

import { Page } from '@/components/Page.tsx';

import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';
import { Icon20Select } from '@telegram-apps/telegram-ui/dist/icons/20/select';


import { TEXTS } from './texts.ts';

export const Transfer3_Confirm: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { coin, sum, adress, ourComission } = location.state || {};


  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  

  
  const tlgid = useTlgid();

  const { language } = useContext(LanguageContext);
  
  //  FIXME:
  // @ts-ignore
  const { title3, totalSum, comissionT, sendText, to, cnfBtn } = TEXTS[language];

  const qtyToSend = Number(((Number(sum) - Number(ourComission))).toFixed(6))
//   const qtyForApiRqst=Number(qtyToSend) 
 
  //вариант 1
//   const calcalutedTotalComission = Number(networkFees)+Number(ourComission)
    

  async function cnfBtnHandler() {
    setIsLoading(true);
    try {
      const response: any = await axios.post('/rqst_to_transfer', {
        coin,
        sum,
        tlgid,
        adress,
        ourComission,
        
      });

      console.log(response);

      if (response.data.status === 'OK') {
        
        
        navigate('/transfer_4success-page', {
          state: {
            qtyToSend,
            coin,
          },
        });
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function goToWalletHandler() {
    navigate('/wallet-page');
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
          {showError == false && (
            <Section header={title3}>
              <Cell
                subtitle={
                  <span>
                    {sum} <span className={styles.inputHeaderText}>{coin}</span>
                  </span>
                }
              >
                {totalSum}
              </Cell>

              <Cell
                subtitle={
                  <span>
                    {ourComission}{' '}
                    <span className={styles.inputHeaderText}>{coin}</span>
                  </span>
                }
                before={<Icon16Chevron />}
              >
                {comissionT}
              </Cell>

              <Cell
                subtitle={
                  <span>
                    {qtyToSend}{' '}
                    <span className={styles.inputHeaderText}>{coin}</span>
                  </span>
                }
                before={<Icon20Select />}
              >
                {sendText}
              </Cell>

              <Cell multiline subtitle={adress}>
                {to}
              </Cell>

              <Cell>
                <Button mode="filled" size="m" 
                onClick={cnfBtnHandler}
                >
                  {cnfBtn}
                </Button>
              </Cell>
            </Section>
          )}
          {showError && (
            <Section>
              <>
                <Cell subtitle="вернитесь в кошелек и повторите вывод">
                  Что-то пошло не так...{' '}
                </Cell>
                <Button mode="filled" size="m" onClick={goToWalletHandler}>
                  Вернуться в кошелек
                </Button>
              </>
            </Section>
          )}
        </List>
      )}
    </Page>
  );
};
