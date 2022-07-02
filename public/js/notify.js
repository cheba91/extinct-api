/* eslint-disable*/

// type: 'success' or 'error'
const hideNotif = () => {
  const el = document.querySelector('.notify');
  if (el) el.parentElement.removeChild(el);
};

export const notify = (msg, type) => {
  if (!msg) msg = 'An error occured, please try again later';
  if (!type) type = 'error';
  hideNotif();
  const markup = `<div class="notify notify--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  setTimeout(hideNotif, 4000);
};

/*CSS
.notify {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 99;
  color: #fff;
  font-size: 1.8rem;
  font-weight: 400;
  text-align: center;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  padding: 1.6rem 2rem;
  box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.25);
}
.notify--success {
  background-color: #20bf6b;
}
.notify--error {
  background-color: #eb4d4b;
}

*/
