import React, {ReactNode, useEffect} from 'react';
import {isServer} from '@medux/core';

interface DocumentHeadProps {
  children?: ReactNode;
}

const DocumentHeadComponent: React.FC<DocumentHeadProps> = ({children}) => {
  let title = '';
  React.Children.forEach(children, (child: any) => {
    if (child && child.type === 'title') {
      title = child.props.children;
    }
  });
  if (!isServer()) {
    useEffect(() => {
      if (title) {
        // @ts-ignore
        document.title = title;
      }
    }, [title]);
    return null;
  }
  return <head>{children}</head>;
};

export default React.memo(DocumentHeadComponent);
