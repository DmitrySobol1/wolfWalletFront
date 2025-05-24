import { Tabbar } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate,useLocation} from 'react-router-dom';
import { useState,useEffect } from 'react';
// import { LanguageContext } from '../App.tsx';

// import { settingsButton } from '@telegram-apps/sdk';


// import { Link } from '@/components/Link/Link.tsx';
// import { Page } from '@/components/Page.tsx';

import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';

// import { TEXTS } from './texts.ts'


// export const TabbarMenu: FC = () => {

//     const navigate = useNavigate();
// // const { language } = useContext(LanguageContext);

// //FIXME:
// // @ts-ignore
//   // const { title, text} = TEXTS[language];

// // if (settingsButton.mount.isAvailable()) {
// //   settingsButton.mount();
// //   settingsButton.isMounted(); // true
// //   settingsButton.show();
// // }

// // if (settingsButton.onClick.isAvailable()) {
// //   function listener() {
// //     console.log('Clicked!');
// //     navigate('/setting-button-menu');
    
// //   }
// //   settingsButton.onClick(listener);
// // }

//   const tabs = [
//     {
//       id: 1,
//       text: 'Кошелек',
//       Icon: Icon28Heart,
//     },
//     {
//       id: 2,
//       text: 'Обмен',
//       Icon: Icon28Devices,
//     },
//     {
//       id: 3,
//       text: 'Биржа',
//       Icon: Icon28Archive,
//     },
//   ];

//   const [currentTab, setCurrentTab] = useState(tabs[0].id);

//   function changePage(id: number) {
//     console.log('page=',id)
//     // setCurrentTab(id);
//     if (id === 1) {
//       navigate('/wallet-page');
//     } else if (id === 2) {
//       navigate('/exchange-page');
//     } else if (id === 3) {
//       // navigate('/templates');
//       navigate('/onboarding');
//     }
//   }


//   useEffect(() => {
//   // Обновляем текущую вкладку при изменении URL
//   const path = window.location.pathname;
//   if (path === '/wallet-page') setCurrentTab(1);
//   else if (path === '/exchange-page') setCurrentTab(2);
//   else if (path === '/onboarding') setCurrentTab(3);
// }, []);
  

//   return (

    
    
    

// <Tabbar>
//           {tabs.map(({ id, text, Icon }) => (
//             <Tabbar.Item
//               key={id}
//               text={text}
//               selected={id === currentTab}
//               onClick={() => changePage(id)}
//             >
//               <Icon />
//             </Tabbar.Item>
//           ))}
//         </Tabbar>


  
//   );
// };


export const TabbarMenu: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      id: 1,
      text: 'Кошелек',
      Icon: Icon28Heart,
      path: '/wallet-page'
      // path: '/wallet-page'
    },
    {
      id: 2,
      text: 'Обмен',
      Icon: Icon28Devices,
      path: '/exchange-page'
    },
    {
      id: 3,
      text: 'Биржа',
      Icon: Icon28Archive,
      path: '/onboarding'
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