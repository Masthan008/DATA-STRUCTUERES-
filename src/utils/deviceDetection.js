export const detectDevice = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)
  ) {
    return 'mobile';
  }
  return 'desktop';
};

export const isDeviceAllowed = (currentDevice, allowedSetting) => {
  if (allowedSetting === 'both') return true;
  return currentDevice === allowedSetting;
};
