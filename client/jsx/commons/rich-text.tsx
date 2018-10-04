//Rich text
import * as React from 'react';
const autolink = require('my-autolink');

export interface IPropRichText {
  text: string;
}
export default ({ text }: IPropRichText) => {
  const rawMarkup = raw(text);
  return <p dangerouslySetInnerHTML={rawMarkup} />;
};

function raw(text: string) {
  const transforms = [
    'url',
    {
      pattern: () => {
        return /play\/(\d+)/g;
      },
      transform: (_1: any, _2: any, num: number) => {
        return {
          href: `/play/${num}`,
        };
      },
    },
  ];
  const options = {
    url: {
      attributes: {
        target: '_blank',
      },
    },
  };
  return {
    __html: autolink(text, transforms, options),
  };
}
