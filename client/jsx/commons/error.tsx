//Error message
import * as React from 'react';
export default ({ children }: { children: React.ReactNode }) => {
  if (children == null) {
    return null;
  }
  return <p className="error-message">{children}</p>;
};
