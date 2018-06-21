import getMessage from '../strings/messages';

const headingElement = document.getElementById('instructions');

function updateHeadingText(message) {
  headingElement.innerHTML = getMessage(message);
}

export default updateHeadingText;
