import { $ } from '../utils';
import getMessage from '../strings/messages';

const headingElement = $('#instructions');

export default function Heading() {
  return {
    update(message) {
      headingElement.innerHTML = getMessage(message);
    },
  };
};
