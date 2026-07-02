import { dbAppSettingsUpdate } from '@services/dexie/settings';
import { setIsAccountChoose } from '@services/states/app';
import useFeedback from '@features/app_start/shared/hooks/useFeedback';

const useSignin = () => {
  const { message, title, hideMessage, showMessage, variant } = useFeedback();

  const handleReturnChooser = async () => {
    await dbAppSettingsUpdate({ 'user_settings.account_type': '' });
    setIsAccountChoose(true);
  };

  return {
    handleReturnChooser,
    hideMessage,
    showMessage,
    title,
    message,
    variant,
  };
};

export default useSignin;
