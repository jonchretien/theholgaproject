import getMessage from '../strings/messages';

const headingEl = document.getElementById('instructions');

function updateHeadingText(message) {
  headingEl.innerHTML = getMessage(message);
}

export default updateHeadingText;
