import type { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef, useContext } from 'react';

import axios from '../../axios';

import { LanguageContext } from '../../components/App.tsx';
import { useTlgid } from '../../components/Tlgid';

import { TEXTS } from './texts.ts';

import {
  Section,
  List,
  Cell,
  ButtonCell,
  Tooltip,
  Spinner,
} from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page.tsx';
import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
import { Icon28Stats } from '@telegram-apps/telegram-ui/dist/icons/28/stats';
import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';

import {TryLater} from '../../components/TryLater/TryLater.tsx'

export const PayInAdress: FC = () => {
  const tlgid = useTlgid();

  const { language } = useContext(LanguageContext);
  const location = useLocation();
  const { coin } = location.state || {};

  const [isLoading, setIsLoading] = useState(true);
  const [showTryLater, setShowTryLater] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [payAdress, setPayAdress] = useState('');
  const [showTextCopied, setShowTextCopied] = useState(false);

  //FIXME:
  // @ts-ignore
  const { minsum, adress, copyit, copiedtext, tryLaterText } = TEXTS[language];

  useEffect(() => {
    const fetchPayInAdress = async () => {
      try {
        const response = await axios.post('/payin/get_info_for_payinadress', {
          tlgid: tlgid,
          coin: coin,
        });

        if (response.data.statusBE === 'notOk') {
          setShowTryLater(true);
          setIsLoading(false);
        }

        setMinAmount(response.data.minAmount);
        setPayAdress(response.data.payAdress);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayInAdress();
  }, []);

  const copyAdress = async () => {
    try {
      await navigator.clipboard.writeText(payAdress);

      setShowTextCopied(true);

      setTimeout(() => setShowTextCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка: ', err);
    }
  };

  const buttonRef = useRef(null);

  return (
    <Page back={true}>
     
     {showTryLater && <TryLater/>}

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
              Component="div"
              before={<Icon28Stats />}
              subtitle={`${minAmount} ${coin}`}
            >
              {minsum}
            </Cell>

            <Cell before={<Icon28Devices />} subtitle={payAdress} multiline>
              {adress}
            </Cell>
            <ButtonCell
              before={<Icon28Archive />}
              interactiveAnimation="background"
              onClick={copyAdress}
              ref={buttonRef}
            >
              {copyit}
            </ButtonCell>

            {showTextCopied && (
              <Tooltip mode="light" targetRef={buttonRef} withArrow={false}>
                {copiedtext}
              </Tooltip>
            )}
          </Section>
        </List>
      )}
    </Page>
  );
};
