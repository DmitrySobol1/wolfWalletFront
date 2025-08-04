import {
  Section,
  List,
  Button,
  Cell,
  Text,
  IconButton,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import {  useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';


import { Page } from '@/components/Page.tsx';

import { Icon20Select } from '@telegram-apps/telegram-ui/dist/icons/20/select';


import { TEXTS } from './texts.ts';
import styles from './stock.module.css';
    

export const Stock3_success: FC = () => {
  const navigate = useNavigate();
//   const location = useLocation();
//   const { qtyToSend, coin } = location.state || {};

    const { language } = useContext(LanguageContext);
  

  //  FIXME:
  // @ts-ignore
  const { success, stockTitle, stockText, openStockBtn } = TEXTS[language];

  function nextBtnHandler() {
    navigate('/stock-page');
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
            // after={
            //   <Text weight="1" caps>
            //     {qtyToSend} {coin}
            //   </Text>
            // }
          >
            <Text weight="2">{stockTitle}</Text>
          </Cell>

          {/* <Cell multiline>
            <Subheadline level="1" weight="3">
              {stockText}
            </Subheadline>
          </Cell> */}

          {/* <Cell>
            <Button mode="filled" size="m" onClick={nextBtnHandler} stretched>
              {openStockBtn}
            </Button>
          </Cell> */}

          <div className={styles.wrapperActionBtn}>
            <Button
              onClick={nextBtnHandler}
              stretched
              className={styles.actionBtn}
            >
              {openStockBtn}
            </Button>
          </div>  

        </Section>
      </List>
    </Page>
  );
};
