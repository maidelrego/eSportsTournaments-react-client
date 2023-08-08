export const setAvatarStyle = (name) => {
  switch (name) {
  case 'W':
    return { backgroundColor: '#16a757', color: '#ffffff',cursor:'pointer' };
  case 'L':
    return { backgroundColor: '#ea5455', color: '#ffffff',cursor:'pointer' };
  default:
    return { backgroundColor: '#9AA0A6', color: '#ffffff',cursor:'pointer' };
  }
}