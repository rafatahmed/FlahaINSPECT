/// Wireframe 01 locked copy.
const productName = 'FlahaINSPECT';
const loginButtonLabel = 'Log in';
const emailLabel = 'Email';
const passwordLabel = 'Password';
const genericLoginFailure = 'Email or password is incorrect.';
const accountLockedCopy = 'Try again in 15 minutes';
const minAppVersionTitle = 'Update required';
const minAppVersionBody =
    'This app version is no longer supported. Install the latest build from the store or MDM.';
const noAssignedProjects = 'You have no assigned projects. Ask a manager.';

String loginErrorMessage({String? code}) {
  if (code == 'ACCOUNT_LOCKED') return accountLockedCopy;
  return genericLoginFailure;
}
