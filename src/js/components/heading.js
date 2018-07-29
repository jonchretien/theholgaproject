import { $ } from '../utils';
import getMessage from '../strings/messages';

const headingElement = $('#instructions');

const Heading = () => {
  return {
    update(message) {
      headingElement.innerHTML = getMessage(message);
    },
  };
};

export default Heading;
