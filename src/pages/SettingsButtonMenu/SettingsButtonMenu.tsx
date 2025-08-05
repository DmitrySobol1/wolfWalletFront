import type { FC } from 'react';
import { useContext, useState, useEffect, useRef } from 'react';

import axios from '../../axios';

import {
  Section,
  Cell,
  List,
  Select,
  ButtonCell,
  Spinner,
  Tappable,
  Tooltip,
} from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page.tsx';
import { Icon32ProfileColoredSquare } from '@telegram-apps/telegram-ui/dist/icons/32/profile_colored_square';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';
import { Icon28AddCircle } from '@telegram-apps/telegram-ui/dist/icons/28/add_circle';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { useTlgid } from '../../components/Tlgid';

import { LanguageContext } from '../../components/App';
import { ValuteContext } from '../../components/App';

import { TryLater } from '../../components/TryLater/TryLater.tsx';

import { TEXTS } from './texts.ts';

export const SettingsButtonMenu: FC = () => {
  const tlgid = useTlgid();

  const { language, setLanguage } = useContext(LanguageContext);
  const { valute, setValute } = useContext(ValuteContext);

  const [isShowLanguageSelect, setShowLanguageSelect] = useState(false);
  const [isShowValuteSelect, setShowValuteSelect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userNPid, setUserNPid] = useState('');
  const [idNPexist, setIdNPexist] = useState(false);
  const [showTextCopied, setShowTextCopied] = useState(false);
  const [showLangValSet, setShowLangValSet] = useState(false);
  const [langValuteText, setLangValuteText] = useState('');
  const [showTryLater, setShowTryLater] = useState(false);
  const [selectedValute, setSelectedValute] = useState(valute);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const refDiv = useRef(null);
  const buttonRef = useRef(null);

  //FIXME:
  // @ts-ignore
  const {
    title,
    languageT,
    valuteT,
    languageTsubtitle,
    valuteTsubtitle,
    yourid,
    purposeid,
    copiedtext,
    noid,
    createid,
    valuteChangedT,
    languageChangedT,
    someError,
    // @ts-ignore
  } = TEXTS[language];

  // получить id юзера
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.post('/system/get_user_id', {
          tlgid: tlgid,
        });

        if (response.data.statusBE === 'notOk') {
          setShowTryLater(true);
          setIsLoading(false);
        }

        const { nowpaymentid } = response.data;

        if (nowpaymentid != 0) {
          setIdNPexist(true);
          setUserNPid(nowpaymentid);
        } else {
          setIdNPexist(false);
          setUserNPid(noid);
        }
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  function showLanguageSelect() {
    setShowValuteSelect(false);
    setShowLanguageSelect(!isShowLanguageSelect);
  }

  function showValuteSelect() {
    setShowLanguageSelect(false);
    setShowValuteSelect(!isShowValuteSelect);
  }

  async function selectLanguageHandler(event: any) {
    try {
      setLanguage(event.target.value);
      setSelectedLanguage(event.target.value);
      console.log('set language=', event.target.value);

      const response: any = await axios.post('/system/change_language', {
        tlgid: tlgid,
        language: event.target.value,
      });

      console.log('lang resp', response);

      if (!response) {
        throw new Error('error in /system/change_language');
      }

      if (response.data.status === 'changed') {
        setLangValuteText(languageChangedT);
        setShowLangValSet(true);
        setTimeout(() => setShowLangValSet(false), 2000);
      }
    } catch {
      setLangValuteText(someError);
      setShowLangValSet(true);
      setTimeout(() => setShowLangValSet(false), 2000);
    }
  }

  async function selectValuteHandler(event: any) {
    try {
      setValute(event.target.value);
      setSelectedValute(event.target.value);
      console.log('set valute=', event.target.value);

      const response: any = await axios.post('/system/change_valute', {
        tlgid: tlgid,
        valute: event.target.value,
      });

      if (!response) {
        throw new Error('error in /system/change_valute');
      }

      if (response.data.status === 'changed') {
        setLangValuteText(valuteChangedT);
        setShowLangValSet(true);
        setTimeout(() => setShowLangValSet(false), 2000);
      }
    } catch {
      setLangValuteText(someError);
      setShowLangValSet(true);
      setTimeout(() => setShowLangValSet(false), 2000);
    }
  }

  const copyAdress = async () => {
    try {
      await navigator.clipboard.writeText(userNPid);
      console.log('copied=', userNPid);
      setShowTextCopied(true);

      setTimeout(() => setShowTextCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка: ', err);
    }
  };

  async function create() {
    try {
      setIsLoading(true);
      console.log('start creatin...');

      const response: any = await axios.post('/system/create_user_NpId', {
        tlgid: tlgid,
      });

      if (response.data.statusBE === 'notOk') {
        setShowTryLater(true);
        setIsLoading(false);
      }

      console.log('created = ', response);
      setUserNPid(response.data.nowpaymentid);
      setIdNPexist(true);
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      setShowTryLater(true);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Page back={false}>
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
        <>
          <List>
            <Section>
              <Section>
                <Cell
                  before={<Icon32ProfileColoredSquare />}
                  interactiveAnimation="opacity"
                  subtitle={purposeid}
                  multiline
                >
                  {yourid}

                  {!idNPexist && (
                    <span
                      style={{
                        color: '#168acd',
                        fontWeight: '600',
                      }}
                    >
                      {' '}
                      {userNPid}
                    </span>
                  )}
                  {idNPexist && (
                    <Tappable
                      Component="span"
                      style={{
                        color: '#168acd',
                        fontWeight: '600',
                      }}
                      onClick={copyAdress}
                      ref={buttonRef}
                    >
                      {' '}
                      {userNPid}
                    </Tappable>
                  )}
                </Cell>

                {showTextCopied && (
                  <Tooltip mode="light" targetRef={buttonRef} withArrow={false}>
                    {copiedtext}
                  </Tooltip>
                )}

                {!idNPexist && (
                  <ButtonCell
                    before={<Icon28AddCircle />}
                    interactiveAnimation="background"
                    onClick={() => create()}
                  >
                    {createid}
                  </ButtonCell>
                )}
              </Section>
            </Section>

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
                <Select
                  header={languageTsubtitle}
                  onChange={selectLanguageHandler}
                  value={selectedLanguage}
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="de">Deutch</option>
                </Select>
              )}

              <div onClick={showValuteSelect}>
                <Cell
                  before={<Icon32ProfileColoredSquare />}
                  after={<Icon16Chevron />}
                  ref={refDiv}
                >
                  {valuteT}
                </Cell>
              </div>

              {isShowValuteSelect && (
                <Select
                  header={valuteTsubtitle}
                  onChange={selectValuteHandler}
                  value={selectedValute}
                >
                  <option value="rub">Рубль</option>
                  <option value="eur">Euro</option>
                  <option value="usd">US Dollar</option>
                </Select>
              )}
            </Section>
          </List>

          {showLangValSet && (
            <Tooltip mode="light" targetRef={refDiv} withArrow={false}>
              {langValuteText}
            </Tooltip>
          )}

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
