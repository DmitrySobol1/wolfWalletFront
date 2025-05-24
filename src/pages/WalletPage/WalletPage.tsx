import {
  Section,
  Cell,
  List,
  Button,
  Tappable,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import axios from '../../axios';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../../components/App.tsx';
import { TotalBalanceContext } from '../../components/App.tsx';
import { ValuteContext } from '../../components/App.tsx';

import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

// import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
// import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
// import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';

import styles from './walletpage.module.css';
import { TEXTS } from './texts.ts';

export const WalletPage: FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useContext(LanguageContext);
  const { balance, setBalance } = useContext(TotalBalanceContext);
  const { valute, setValute } = useContext(ValuteContext);

  const [symbol, setSymbol] = useState('');
  const [isLoading,setIsLoading] = useState (true)

  //FIXME:
  // @ts-ignore
  const { title, text } = TEXTS[language];

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

  // для вывода баланса, языка, валюты
  useEffect(() => {
    //FIXME:
    const tlgid = 12345;

    // TODO: можно пост на гет испправить, т.к. получаем инфо

    const fetchUserInfo = async () => {
      try {
        const response = await axios.post('/get_user_balance', {
          tlgid: tlgid,
        });


        setLanguage(response.data.language);
        setBalance(response.data.balance);
        setValute(response.data.valute);
        setSymbol(response.data.symbol);

        setIsLoading(false)
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchUserInfo();
  }, []);

  function payInBtnHandler() {
    navigate('/payin-page');
  }

  function openSettings() {
    navigate('/setting-button-menu');
  }

  function payOutBtnHandler() {
    if (balance === 0) {
      console.log('баланс = 0');
    } else {
      console.log('баланс норм');
      navigate('/payout_1availablelist-page');
    }
  }

  return (
    <Page back={false}>

    {isLoading &&
    <>Загрузка</>}

    {!isLoading &&
<>
      <List>
        <Section header={title}>
          <Cell></Cell>

          <Cell>
            <div className={styles.balanceText}>
              {symbol} {balance}
            </div>
            <div>
              общий баланс в{' '}
              <Tappable
                Component="span"
                className={styles.valuteText}
                onClick={openSettings}
              >
                {valute}
              </Tappable>
            </div>
          </Cell>

          <Cell>
            баланс={balance}, язык={language}, валюта={valute}
          </Cell>

          {/* <Link to="/init-data">
            <Cell subtitle={text}>
              lang={language} баланс={balance} валюта={valute}
            </Cell>
          </Link> */}

          <div className={styles.divWithButton}>
            <Button mode="filled" size="m" onClick={payInBtnHandler}>
              Пополнить
            </Button>
            <Button mode="filled" size="m" onClick={payOutBtnHandler}>
              Вывести
            </Button>
          </div>
        </Section>
      </List>

      <TabbarMenu />
      </>}
    </Page>
  );
};
