import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useContext } from 'react';
// import { LanguageContext } from '../../components/App.tsx';

import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';


import { Page } from '@/components/Page.tsx';


// import { TEXTS } from './texts.ts';

export const ExchangePage: FC = () => {
  const navigate = useNavigate();
//   const { language } = useContext(LanguageContext);

  //FIXME:
  // @ts-ignore
//   const { title, text } = TEXTS[language];

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

  

  return (
    <Page back={false}>
      <List>
        <Section header="Обмен">
          
            <Cell subtitle='обмен'>обмен обмен </Cell>
          
        </Section>
      </List>


      <TabbarMenu />
    </Page>
  );
};
