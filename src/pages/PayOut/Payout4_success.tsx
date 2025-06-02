import {
  Section,
  List,
  Button,
  Cell,
  Text,
  Subheadline,
  IconButton,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';


import { Page } from '@/components/Page.tsx';

import { Icon20Select } from '@telegram-apps/telegram-ui/dist/icons/20/select';


import { TEXTS } from './texts.ts';

export const Payout4_success: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { qtyToSend, coin } = location.state || {};

    const { language } = useContext(LanguageContext);
  

  //  FIXME:
  // @ts-ignore
  const { success, withdrawTitle, withdrawText, openWalletBtn } = TEXTS[language];

  function nextBtnHandler() {
    navigate('/wallet-page');
  }

  
  return (
    <Page>
      <List>
        <Section header={success}>
          <Cell
            before={
              <IconButton mode="bezeled" size="m">
                <Icon20Select />
              </IconButton>
            }
            multiline
            after={
              <Text weight="1" caps>
                {qtyToSend} {coin}
              </Text>
            }
          >
            <Text weight="1">{withdrawTitle}</Text>
          </Cell>

          <Cell multiline>
            <Subheadline level="1" weight="3">
              {withdrawText}
            </Subheadline>
          </Cell>

          <Cell>
            <Button mode="filled" size="m" onClick={nextBtnHandler}>
              {openWalletBtn}
            </Button>
          </Cell>
        </Section>
      </List>
    </Page>
  );
};
