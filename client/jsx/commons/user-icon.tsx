import * as React from 'react';

export interface IPropUserIcon {
  icon: string | null;
  size: number;
}
export default ({ icon, size }: IPropUserIcon) => {
  let src: string;
  if (icon) {
    src = `/uploaded/${icon}`;
  } else {
    src = '/static/images/no-icon.png';
  }
  return (
    <div className="user-icon">
      <img src={src} width={size} height={size} />
    </div>
  );
};
