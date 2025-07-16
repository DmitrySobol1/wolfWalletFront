import { Tabbar } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate,useLocation} from 'react-router-dom';
import { useState,useEffect,useContext } from 'react';
import { LanguageContext } from '../App.tsx';

// import { settingsButton } from '@telegram-apps/sdk';


// import { Link } from '@/components/Link/Link.tsx';
// import { Page } from '@/components/Page.tsx';

// import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
// import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
// import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';
// import { Icon28Stats } from '@telegram-apps/telegram-ui/dist/icons/28/stats';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';



import { TEXTS } from './texts.ts'


export const TabbarMenu: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { language } = useContext(LanguageContext);
  
  //FIXME:
       // @ts-ignore
       const {firstTab,secondTab,thirdTab} = TEXTS[language]; 


  const tabs = [
    {
      id: 1,
      text: firstTab,
      Icon: AccountBalanceWalletIcon,
      path: '/wallet-page'
      
    },
    {
      id: 2,
      text: secondTab,
      Icon: ChangeCircleIcon,
      path: '/exchange_1setsum-page'
    },
    {
      id: 3,
      text: thirdTab,
      Icon: SignalCellularAltIcon,
      path: '/stock-page'
    },
  ];



  // Определяем активную вкладку по текущему пути
  const getInitialTab = () => {
    const currentTab = tabs.find(tab => tab.path === location.pathname);
    return currentTab ? currentTab.id : tabs[0].id;
  };

  const [currentTab, setCurrentTab] = useState(getInitialTab());

  // Синхронизируем состояние при изменении URL через навигацию вручную
  useEffect(() => {
    const currentTab = tabs.find(tab => tab.path === location.pathname);
    if (currentTab) {
      setCurrentTab(currentTab.id);
    }
  }, [location.pathname]);

  const changePage = (id: number) => {
    const tab = tabs.find(t => t.id === id);
    if (tab) {
      // Сначала обновляем состояние, затем навигация
      setCurrentTab(id);
      navigate(tab.path);
    }
  };

  return (
    <Tabbar>
      {tabs.map(({ id, text, Icon }) => (
        <Tabbar.Item
          key={id}
          text={text}
          selected={id === currentTab}
          onClick={() => changePage(id)}
        >
          <Icon />
        </Tabbar.Item>
      ))}
    </Tabbar>
  );
};