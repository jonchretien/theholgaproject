import getMessage from '../strings/messages';

const headingElement = document.getElementById('instructions');

const Heading = () => {
  return {
    update(message) {
      headingElement.innerHTML = getMessage(message);
    },
  };
};

export default Heading;
