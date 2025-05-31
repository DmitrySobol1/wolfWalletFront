import {
  Section,
  List,
  Cell,
  ButtonCell,
  Tooltip,
  Spinner,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef, useContext } from 'react';

import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';

// import { settingsButton } from '@telegram-apps/sdk';

import axios from '../../axios';

import { Page } from '@/components/Page.tsx';
// import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
import { Icon28Stats } from '@telegram-apps/telegram-ui/dist/icons/28/stats';
import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
// import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';

import { TEXTS } from './texts.ts';

export const PayInAdress: FC = () => {
  //   const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(true);
  //   const { balance } = useContext(TotalBalanceContext);

  //FIXME:

  //   const [coins, setCoins] = useState([]);
  const location = useLocation();
  const { coin } = location.state || {};

  const [minAmount, setMinAmount] = useState('');
  const [payAdress, setPayAdress] = useState('');
  const [showTextCopied, setShowTextCopied] = useState(false);

  //FIXME:
  // @ts-ignore
  const { minsum, adress, copyit, copiedtet } = TEXTS[language];

  //FIXME: заменить на реальный ТЛГ
  const tlgid: number = 412697670;

  useEffect(() => {
    const fetchPayInAdress = async () => {
      try {
        const response = await axios.post('/get_info_for_payinadress', {
          tlgid: tlgid,
          coin: coin,
        });

        // // coins = response.data
        // setCoins(response.data.selectedCurrencies);
        console.log(response);
        setMinAmount(response.data.minAmount);
        setPayAdress(response.data.payAdress);
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchPayInAdress();
  }, []);

  const copyAdress = async () => {
    //  const [copied, setCopied] = useState(false);
    try {
      await navigator.clipboard.writeText(payAdress);
      console.log('copied=', payAdress);
      setShowTextCopied(true);

      setTimeout(() => setShowTextCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка: ', err);
    }
  };

  const buttonRef = useRef(null);

  //FIXME:
  // @ts-ignore
  //   const { title, text } = TEXTS[language];

  //   if (settingsButton.mount.isAvailable()) {
  //     settingsButton.mount();
  //     settingsButton.isMounted(); // true
  //     settingsButton.show();
  //   }

  //   if (settingsButton.onClick.isAvailable()) {
  //     function listener() {
  //       console.log('Clicked!');
  //       navigate('/setting-button-menu');
  //     }
  //     settingsButton.onClick(listener);
  //   }

  return (
    <Page>
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

            {/* <Button
       
        onClick={handleClick}
        style={{ width: 100 }}
      >
        Hide
      </Button> */}

            {showTextCopied && (
              <Tooltip mode="light" targetRef={buttonRef} withArrow={false}>
                {copiedtet}
              </Tooltip>
            )}
          </Section>
        </List>
      )}
    </Page>
  );
};
