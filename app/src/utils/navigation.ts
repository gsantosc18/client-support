export const navigateTo = (url: string) => {
  if (typeof window !== 'undefined' && window.location) {
    window.location.assign(url);
  }
};
