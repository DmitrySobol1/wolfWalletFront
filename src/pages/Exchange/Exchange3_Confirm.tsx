import {
  Section,
  List,
  Cell,
    Button,
  

} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
// import { useLocation } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
// import { useEffect, useState, useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';

// import { useTlgid } from '../../components/Tlgid';

// import vsaarrows from '../../img/vs_arrows.png';
// import { settingsButton } from '@telegram-apps/sdk';

// import axios from '../../axios.ts';

import { Page } from '@/components/Page.tsx';
// import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';
// import { Icon28CloseAmbient } from '@telegram-apps/telegram-ui/dist/icons/28/close_ambient';

import { TEXTS } from './texts.ts';

// import styles from './exchange.module.css';

export const Exchange3_Confirm: FC = () => {
//   const tlgid = useTlgid();

  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
//   const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const { amount, coinFrom, convertedAmount, coinTo } = location.state || {};

  //FIXME:
  // @ts-ignore
  const {header1,youGetText,cnfBtn} = TEXTS[language];


   function nextBtnHandler(){
    console.log('clicked')
    
    navigate('/exchange_4success-page', {
      state: {
        convertedAmount,
        coinTo
      },
    });
   } 

  return (
    <Page back={true}>
      {/* {isLoading && (
        <div
          style={{
            textAlign: 'center',
            justifyContent: 'center',
            padding: '100px',
          }}
        >
          <Spinner size="m" />
        </div>
      )} */}

      
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
      
    </Page>
  );
};
