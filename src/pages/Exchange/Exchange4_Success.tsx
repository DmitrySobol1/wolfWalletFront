import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';

import { LanguageContext } from '../../components/App.tsx';

import {
  Section,
  List,
  Button,
  Cell,
  Text,
  Subheadline,
  IconButton,
} from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page.tsx';
import { Icon20Select } from '@telegram-apps/telegram-ui/dist/icons/20/select';

import { TEXTS } from './texts.ts';

export const Exchange4_Success: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { convertedAmount, coinTo } = location.state || {};

  const { language } = useContext(LanguageContext);

  //  FIXME:
  // @ts-ignore
  const { success, exchangeTitle, exchangeText, openWalletBtn } = TEXTS[language];

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
          >
            <Text weight="1">{exchangeTitle} </Text>
          </Cell>

          <Cell multiline>
            <Subheadline level="1" weight="3">
              {convertedAmount} {coinTo} {exchangeText}
            </Subheadline>
          </Cell>

          <Cell>
            <Button mode="filled" size="m" stretched onClick={nextBtnHandler}>
              {openWalletBtn}
            </Button>
          </Cell>
        </Section>
      </List>
    </Page>
  );
};
