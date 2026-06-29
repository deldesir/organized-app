import { ReactElement } from 'react';

export type OAuthButtonBaseProps = {
  logo: ReactElement;
  text: string;
  provider?: unknown;
};

export type NextStepType = {
  createCongregation?: boolean;
  unauthorized?: boolean;
  encryption?: boolean;
  isVerifyMFA?: boolean;
};
