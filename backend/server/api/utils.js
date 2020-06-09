export const validate = (userData, req) => {
  if (/^[a-zA-Z0-9]{1,15}$/.test(userData.username) && /^[a-zA-Z0-9]{1,15}$/.test(userData.password)) {
    userData.isValid = true;
    req.body.username = req.body.username.trim();
    req.body.password = req.body.password.trim();
  } else {
    userData.isValid = false;
    userData.usernameFeedback = 'Alphanumeric and 1-15 characters only.';
    userData.passwordFeedback = 'Alphanumeric and 1-15 characters only.';
  }

  return userData;
};