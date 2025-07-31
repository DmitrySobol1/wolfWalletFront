import type { FC } from 'react';
import { LanguageContext } from '../App.tsx';
import { useContext } from 'react';

import { Cell } from '@telegram-apps/telegram-ui';
import { Icon28CloseAmbient } from '@telegram-apps/telegram-ui/dist/icons/28/close_ambient';

import { TEXTS } from './texts.ts';

export const TryLater: FC = () => {
  const { language } = useContext(LanguageContext);

  // @ts-ignore
  const { tryLaterText } = TEXTS[language];

  return (
    <Cell before={<Icon28CloseAmbient />} multiline>
      <span>{tryLaterText}</span>{' '}
    </Cell>
  );
};
