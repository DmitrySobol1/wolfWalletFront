import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { LanguageContext } from '../../components/App.tsx';
import { TotalBalanceContext } from '../../components/App.tsx';
import { ValuteContext } from '../../components/App.tsx';

import axios from '../../axios';

import {
  Section,
  Cell,
  List,
  Tappable,
  Divider,
  TabsList,
  Spinner,
  Tooltip,
} from '@telegram-apps/telegram-ui';
import { settingsButton } from '@telegram-apps/sdk-react';
import { Page } from '@/components/Page.tsx';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import {TryLater} from '../../components/TryLater/TryLater.tsx'

import styles from './walletpage.module.css';
import { TEXTS } from './texts.ts';

import { useTlgid } from '../../components/Tlgid';

import payin from '../../img/payin.png';
import payout from '../../img/payout.png';
import changebetweenusers from '../../img/changebetweenusers.png';

export const WalletPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { language, setLanguage } = useContext(LanguageContext);
  const { balance, setBalance } = useContext(TotalBalanceContext);
  const { valute, setValute } = useContext(ValuteContext);

  const [symbol, setSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTextBalanceZero, setShowTextBalanceZero] = useState(false);
  const [balances, setBalances] = useState([]);
  const [myPayIns, setMyPayIns] = useState([]);
  const [myPayOuts, setMyPayOuts] = useState([]);
  const [showTryLater, setShowTryLater] = useState(false);

  const tlgid = useTlgid();
  const buttonRef = useRef(null);
  const { nowpaymentid } = location.state || {};

  //FIXME:
  //  @ts-ignore
  const {
    under_balance,
    pay_in,
    pay_out,
    transfer,
    my_actives,
    payin_history,
    payout_history,
    one_payin,
    one_transfer,
    one_payout,
    one_exchange,
    textBalanceZero,
    noPay,
    stockMarket,
    stockLimit
    //  @ts-ignore
  } = TEXTS[language];

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

  function openSettings() {
    navigate('/setting-button-menu');
  }

  // вывод активов + баланса, языка, валюты
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await axios.get('/wallet/get_balance_for_pay_out', {
          params: {
            tlgid: tlgid,
          },
        });
       
      
        if (!response || response.data.statusBE === 'notOk'){
          setShowTryLater(true);
          setIsLoading(false)
        }

        console.log(response)

        setLanguage(response.data.dataForFront.language);
        setBalance(response.data.dataForFront.balance);
        setValute(response.data.dataForFront.valute);
        setSymbol(response.data.dataForFront.symbol);
        setBalances(response.data.dataForFront.arrayOfUserBalanceWithUsdPrice);

        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
      }
    };
    fetchBalances();
  }, []);

  function payInBtnHandler() {
    navigate('/payin-page');
  }

  function payOutBtnHandler() {
    if (balance === 0) {
      setShowTextBalanceZero(true);
      setTimeout(() => setShowTextBalanceZero(false), 2000);
    } else {
      navigate('/payout_1availablelist-page');
    }
  }

  function transferBtnHandler() {
    if (balance === 0) {
      setShowTextBalanceZero(true);
      setTimeout(() => setShowTextBalanceZero(false), 2000);
    } else {
      navigate('/transfer_1availablelist-page');
    }
  }

  const [selectedTab, setSelectedTab] = useState('tab1');
  const options = [
    { id: 'tab1', label: my_actives },
    { id: 'tab2', label: payin_history },
    { id: 'tab3', label: payout_history },
  ];

  function segmentBtnHandler(id: string) {
    setSelectedTab(id);
  }

  
  // FIXME: объединить на беке оба запроса - это уменьшит скорость загрузки страницы
  // вывод "мои пополнения" + "мои выводы"
  if (nowpaymentid != 0) {
    useEffect(() => {
      const fetchGetMyPayOuts = async () => {
        try {
          const responseIn = await axios.get('/wallet/get_my_payin', {
            params: {
              tlgid: tlgid,
            },
          });
          console.log('payin=', responseIn.data);

          if (!responseIn || responseIn.data.statusBE === 'notOk'){
            setShowTryLater(true);
            setIsLoading(false)
          }



          if (responseIn.data.status === 'ok') {
            setMyPayIns(responseIn.data.data);
          } else if (responseIn.data.status === 'no') {
            const newItem = { type: 'no' };
            //FIXME:
            //  @ts-ignore
            setMyPayIns([newItem]);
          }

          const responseOut = await axios.get('/wallet/get_my_payout', {
            params: {
              tlgid: tlgid,
            },
          });

          if (!responseOut || responseOut.data.statusBE === 'notOk'){
            setShowTryLater(true);
            setIsLoading(false)
          }


          console.log('payout=', responseOut.data);
          if (responseOut.data.status === 'ok') {
            setMyPayOuts(responseOut.data.data);
          } else if (responseOut.data.status === 'no') {
            const newItem = { type: 'no' };
            //FIXME:
            //  @ts-ignore
            setMyPayOuts([newItem]);
          }
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        } finally {
        }
      };

      fetchGetMyPayOuts();
    }, []);
  }

  const typeMap = {
    payin: one_payin,
    payout: one_payout,
    transfer: one_transfer,
    no: noPay,
    exchange: one_exchange,
    stockMarket: stockMarket,
    stockLimit: stockLimit,
  } as const;

  return (
    <Page back={false}>

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
        <>
          <List>
            <Section>
              <Cell className={styles.cell}>
                <div className={styles.balancePartWrapper}>
                  <div className={styles.textBalanceWrapper}>
                    <div className={styles.balanceText}>
                      <span className={styles.symbol}>{symbol}</span> {balance}
                    </div>
                  </div>

                  <div className={styles.textBalanceWrapper}>
                    <div className={styles.textUnderBalance}>
                      {under_balance}{' '}
                      <Tappable
                        Component="span"
                        className={styles.valuteText}
                        onClick={openSettings}
                      >
                        {valute}
                      </Tappable>
                    </div>
                  </div>
                </div>
              </Cell>

              <Cell className={styles.cell}>
                <div className={styles.wrapperAllButtons}>
                  {/* пополнить */}
                  <Tappable Component="span" onClick={payInBtnHandler}>
                    <div className={styles.wrapperOneButton}>
                      <img src={payin} className={styles.imgBtn} />
                      <div className={styles.textForButton}>{pay_in}</div>
                    </div>
                  </Tappable>

                  {/* вывести */}
                  <Tappable
                    Component="span"
                    onClick={payOutBtnHandler}
                    ref={buttonRef}
                  >
                    <div className={styles.wrapperOneButton}>
                      <img src={payout} className={styles.imgBtn} />
                      <div className={styles.textForButton}>{pay_out}</div>
                    </div>
                  </Tappable>

                  {/* трансфер  */}
                  <Tappable Component="span" onClick={transferBtnHandler}>
                    <div className={styles.wrapperOneButton}>
                      <img src={changebetweenusers} className={styles.imgBtn} />
                      <div className={styles.textForButton}>{transfer}</div>
                    </div>
                  </Tappable>
                </div>
              </Cell>

              {showTextBalanceZero && (
                <Tooltip mode="light" targetRef={buttonRef} withArrow={false}>
                  {textBalanceZero}
                </Tooltip>
              )}
            </Section>

            <Section style={{ marginBottom: 100 }}>
              <TabsList>
                {options.map((option) => (
                  <TabsList.Item
                    key={option.id}
                    selected={selectedTab === option.id}
                    onClick={() => segmentBtnHandler(option.id)}
                  >
                    {option.label}
                  </TabsList.Item>
                ))}
              </TabsList>

              {selectedTab === 'tab1' && (
                <>
                  {balances.map((coin: any) => (
                    <>
                      <Cell
                        key={coin.currency}
                        subtitle={`${coin.amount}  ${coin.currency}`}
                        after={
                          <Cell>
                            {coin.priceAllCoinInUserFiat} {coin.symbol}
                          </Cell>
                        }
                        className={styles.activiText}
                      >
                        {coin.currency}
                      </Cell>
                      <Divider />
                    </>
                  ))}
                </>
              )}

              {selectedTab === 'tab2' && (
                <>
                  {myPayIns.map((item: any) => (
                    <>
                      <Cell
                        key={item.currency}
                        subtitle={item.formattedDate}
                        after={
                          <Cell className={styles.payinText}>
                            {item.type != 'no' && '+'} {item.qty} {item.coin}
                          </Cell>
                        }
                      >
                        {typeMap[item.type as keyof typeof typeMap]}
                      </Cell>
                      <Divider />
                    </>
                  ))}
                </>
              )}

              {selectedTab === 'tab3' && (
                <>
                  {myPayOuts.map((item: any) => (
                    <>
                      <Cell
                        key={item.currency}
                        subtitle={item.formattedDate}
                        after={
                          <Cell className={styles.payoutText}>
                            {item.type != 'no' && '-'} {item.qty} {item.coin}
                          </Cell>
                        }
                      >
                        {typeMap[item.type as keyof typeof typeMap]}
                      </Cell>
                      <Divider />
                    </>
                  ))}
                </>
              )}
            </Section>
          </List>

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
