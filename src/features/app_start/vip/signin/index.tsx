import { Box, Stack, TextField, Button } from '@mui/material';
import { useState } from 'react';
import { IconError } from '@icons/index';
import { useAppTranslation, useFirebaseAuth } from '@hooks/index';
import useSignin from './useSignin';
import InfoMessage from '@components/info-message';
import PageHeader from '@features/app_start/shared/page_header';

const Signin = () => {
  const { t } = useAppTranslation();
  const { login } = useFirebaseAuth();
  const { handleReturnChooser, hideMessage, message, title, variant } = useSignin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    await login(username, password);
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
          <Button variant="contained" size="large" onClick={handleLogin}>
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
