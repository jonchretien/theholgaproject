import getMessage from '../strings/messages';

const headingEl = document.getElementById('heading');

function updateHeadingText(message) {
  headingEl.innerHTML = getMessage(message);
}

const heading = {
  udpate: updateHeadingText,
};

export default heading;
