import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import { Page } from '@/components/Page.tsx';

export const Onboarding: FC = () => {
  return (
    <Page>
      <List>
        <Section header="This is onboarding">
          <Cell subtitle="User data, chat information, technical data">
            onboarding onboarding onboarding{' '}
          </Cell>
        </Section>
      </List>
    </Page>
  );
};
