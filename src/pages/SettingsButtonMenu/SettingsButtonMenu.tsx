import { Section, Cell, List, Select } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useContext, useState } from 'react';

import axios from '../../axios';

import { LanguageContext } from '../../components/App';
import { ValuteContext } from '../../components/App';

import { Page } from '@/components/Page.tsx';

import { TEXTS } from './texts.ts';

import { Icon32ProfileColoredSquare } from '@telegram-apps/telegram-ui/dist/icons/32/profile_colored_square';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

export const SettingsButtonMenu: FC = () => {
  const [isShowLanguageSelect, setShowLanguageSelect] = useState(false);
  const [isShowValuteSelect, setShowValuteSelect] = useState(false);
  
//FIXME:
    const tlgid = 412697670;

  const { language,setLanguage } = useContext(LanguageContext);
  const { valute,setValute } = useContext(ValuteContext);

  const [selectedValute,setSelectedValute] = useState(valute)
  const [selectedLanguage,setSelectedLanguage] = useState(language)

  //FIXME:
     // @ts-ignore
     const {title,languageT,valuteT,languageTsubtitle,valuteTsubtitle} = TEXTS[language];

  
  

  function showLanguageSelect() {
    setShowValuteSelect(false);
    setShowLanguageSelect(!isShowLanguageSelect);
  }

  function showValuteSelect() {
    setShowLanguageSelect(false);
    setShowValuteSelect(!isShowValuteSelect);
  }

  function selectLanguageHandler(event: any) {
    setLanguage(event.target.value);
    setSelectedLanguage(event.target.value)
    console.log('set language=', event.target.value);

    
    axios.post('/change_language', {
      tlgid: tlgid,
      language: event.target.value,
    });

  }

  function selectValuteHandler(event: any) {
    setValute(event.target.value);
    setSelectedValute(event.target.value)
    console.log('set valute=', event.target.value);

   
    axios.post('/change_valute', {
      tlgid: tlgid,
      valute: event.target.value,
    });
  }

  return (
    <Page>
      <List>
        <Section header={title}>
          <div onClick={showLanguageSelect}>
            <Cell
              before={<Icon32ProfileColoredSquare />}
              after={<Icon16Chevron />}
            >
              {languageT}
            </Cell>
          </div>

          {isShowLanguageSelect && (
            <Select header={languageTsubtitle} onChange={selectLanguageHandler} value={selectedLanguage}>
              <option value="ru">Русский</option>
              <option value="en" >English</option>
              <option value="de">Deutch</option>
            </Select>
          )}

          <div onClick={showValuteSelect}>
            <Cell
              before={<Icon32ProfileColoredSquare />}
              after={<Icon16Chevron />}
            >
              {valuteT}
            </Cell>
          </div>

          {isShowValuteSelect && (
            <Select header={valuteTsubtitle} onChange={selectValuteHandler} value={selectedValute}>
              <option value="rub">Рубль</option>
              <option value="eur">Euro</option>
              <option value="usd">US Dollar</option>
            </Select>
          )}
        </Section>
      </List>
    </Page>
  );
};
