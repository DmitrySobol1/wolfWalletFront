import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';

import axios from '../../axios.ts';
import { LanguageContext } from '../../components/App.tsx';
import { useTlgid } from '../../components/Tlgid';

import {
  Section,
  List,
  Cell,
  Button,
  Spinner,
} from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page.tsx';

import { TryLater } from '../../components/TryLater/TryLater.tsx';

import { TEXTS } from './texts.ts';

export const Exchange3_Confirm: FC = () => {
  const tlgid = useTlgid();

  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showTryLater, setShowTryLater] = useState(false);

  const location = useLocation();
  const {
    amount,
    coinFrom,
    convertedAmount,
    coinTo,
    nowpaymentComission,
    ourComission,
  } = location.state || {};

  //FIXME:
  // @ts-ignore
  const { header1, youGetText, cnfBtn } = TEXTS[language];

  async function nextBtnHandler() {
    setIsLoading(true);
    try {
      const response: any = await axios.post(
        '/exchange/rqst_fromUser_toMaster',
        {
          tlgid,
          amount,
          coinFrom,
          convertedAmount,
          coinTo,
          nowpaymentComission,
          ourComission,
        }
      );

      console.log(response.data);

      if (response.data.statusBE === 'notOk') {
        setShowTryLater(true);
        setIsLoading(false);
      }

      if (response.data.status === 'OK') {
        navigate('/exchange_4success-page', {
          state: {
            convertedAmount,
            coinTo,
          },
        });
      } else {
        setShowTryLater(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      setShowTryLater(true);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
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
            <Cell subhead={header1}>
              {amount} {coinFrom}
            </Cell>
            <Cell subhead={youGetText}>
              {convertedAmount} {coinTo}
            </Cell>
            <Button mode="filled" size="m" stretched onClick={nextBtnHandler}>
              {cnfBtn}
            </Button>
          </Section>
        </List>
      )}
    </Page>
  );
};
