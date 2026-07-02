import { Box, Stack, TextField, Button } from '@mui/material';
import { useState } from 'react';
import { IconError } from '@icons/index';
import { useAppTranslation, useFirebaseAuth } from '@hooks/index';
import { displayOnboardingFeedback } from '@services/states/app';
import useSignin from './useSignin';
import InfoMessage from '@components/info-message';
import PageHeader from '@features/app_start/shared/page_header';

const Signin = () => {
  const { t } = useAppTranslation();
  const { login } = useFirebaseAuth();
  const {
    handleReturnChooser,
    hideMessage,
    showMessage,
    message,
    title,
    variant,
  } = useSignin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = async () => {
    setIsProcessing(true);
    // login() reloads the page on success; a false return means it failed —
    // surface it (a silent failure reads as a frozen app).
    const ok = await login(username, password);
    setIsProcessing(false);
    if (!ok) {
      displayOnboardingFeedback({
        title: t('tr_loginFailed'),
        message: t('tr_loginFailedDesc'),
      });
      showMessage();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <PageHeader
        title={t('tr_login')}
        description={t('tr_signInDesc')}
        onClick={handleReturnChooser}
      />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <Stack spacing="24px" sx={{ mt: 4 }}>
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={isProcessing}
          >
            Sign In
          </Button>
        </Stack>

        <Box id="onboarding-error" sx={{ display: 'none' }}>
          <InfoMessage
            variant={variant}
            messageIcon={<IconError />}
            messageHeader={title}
            message={message}
            onClose={hideMessage}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Signin;
