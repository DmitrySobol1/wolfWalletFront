import type { ComponentType, JSX } from 'react';

import { WalletPage } from '@/pages/WalletPage/WalletPage';
import { PayIn } from '@/pages/PayIn/PayIn';
import { PayInAdress } from '@/pages/PayIn/PayInAdress';
import { Payout1_listOfAvailable } from '@/pages/PayOut/Payout1_listOfAvailable';
import { Payout2_writeAdress } from '@/pages/PayOut/Payout2_writeAdress';
import { Payout3_showComission } from '@/pages/PayOut/Payout3_showComission';
import { Payout4_success } from '@/pages/PayOut/Payout4_success';
import { Transfer1_listOfAvailable } from '@/pages/TransferPage/Transfer1_listOfAvailable';
import { Transfer2_writeSumAndUser } from '@/pages/TransferPage/Transfer2_writeSumAndUser';
import { Transfer3_Confirm } from '@/pages/TransferPage/Transfer3_Confirm';
import { Transfer4_success } from '@/pages/TransferPage/Transfer4_success';
import { Exchange1_SetSum } from '@/pages/Exchange/Exchange1_SetSum';
import { Exchange2_ShowAvailableCoins } from '@/pages/Exchange/Exchange2_ShowAvailableCoins';
import { Exchange3_Confirm } from '@/pages/Exchange/Exchange3_Confirm';
import { Exchange4_Success} from '@/pages/Exchange/Exchange4_Success';
import { EnterPage } from '@/pages/EnterPage/EnterPage.tsx';
import { Stock } from '@/pages/Stock/Stock.tsx';
import { Stock2_ShowPairs } from '@/pages/Stock/Stock2_ShowPairs';

import { InitDataPage } from '@/pages/InitDataPage.tsx';
import { LaunchParamsPage } from '@/pages/LaunchParamsPage.tsx';
import { ThemeParamsPage } from '@/pages/ThemeParamsPage.tsx';
import { TONConnectPage } from '@/pages/TONConnectPage/TONConnectPage';
import { Onboarding } from '@/pages/Onboarding/Onboarding';
import { SettingsButtonMenu } from '@/pages/SettingsButtonMenu/SettingsButtonMenu';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: EnterPage },
  // { path: '/enter-page', Component: EnterPage },
  { path: '/onboarding', Component: Onboarding, title: 'Onboarding' },
  { path: '/wallet-page', Component: WalletPage },
  { path: '/payin-page', Component: PayIn },
  { path: '/payin_adress-page', Component: PayInAdress },
  { path: '/payout_1availablelist-page', Component: Payout1_listOfAvailable },
  { path: '/payout_2writeadress-page', Component: Payout2_writeAdress },
  { path: '/payout_3showcomission-page', Component: Payout3_showComission },
  { path: '/payout_4success-page', Component: Payout4_success },
  { path: '/transfer_1availablelist-page', Component: Transfer1_listOfAvailable },
  { path: '/transfer_2writetrtinfo-page', Component: Transfer2_writeSumAndUser},
  { path: '/transfer_3confirm-page', Component: Transfer3_Confirm},
  { path: '/transfer_4success-page', Component: Transfer4_success},
  { path: '/exchange_1setsum-page', Component: Exchange1_SetSum},
  { path: '/exchange_2showavailable-page', Component: Exchange2_ShowAvailableCoins},
  { path: '/exchange_3confirm-page', Component: Exchange3_Confirm},
  { path: '/exchange_4success-page', Component: Exchange4_Success},
  { path: '/stock-page', Component: Stock},
  { path: '/stock_2showPairs-page', Component: Stock2_ShowPairs},


  { path: '/init-data', Component: InitDataPage, title: 'Init Data' },
  { path: '/theme-params', Component: ThemeParamsPage, title: 'Theme Params' },
  { path: '/launch-params', Component: LaunchParamsPage, title: 'Launch Params' },
  { path: '/setting-button-menu', Component: SettingsButtonMenu, title: 'Settings Button Menu' },

  {
    path: '/ton-connect',
    Component: TONConnectPage,
    title: 'TON Connect',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 56 56"
        fill="none"
      >
        <path
          d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z"
          fill="#0098EA"
        />
        <path
          d="M37.5603 15.6277H18.4386C14.9228 15.6277 12.6944 19.4202 14.4632 22.4861L26.2644 42.9409C27.0345 44.2765 28.9644 44.2765 29.7345 42.9409L41.5381 22.4861C43.3045 19.4251 41.0761 15.6277 37.5627 15.6277H37.5603ZM26.2548 36.8068L23.6847 31.8327L17.4833 20.7414C17.0742 20.0315 17.5795 19.1218 18.4362 19.1218H26.2524V36.8092L26.2548 36.8068ZM38.5108 20.739L32.3118 31.8351L29.7417 36.8068V19.1194H37.5579C38.4146 19.1194 38.9199 20.0291 38.5108 20.739Z"
          fill="white"
        />
      </svg>
    ),
  },
];
