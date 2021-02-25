import React, {ReactNode, useEffect} from 'react';
import {env, isServer} from '@medux/core';

interface Props {
  children?: ReactNode;
}

const Component: React.FC<Props> = ({children}) => {
  let title = '';
  React.Children.forEach(children, (child: any) => {
    if (child && child.type === 'title') {
      title = child.props.children;
    }
  });
  if (!isServer()) {
    useEffect(() => {
      if (title) {
        env.document.title = title;
      }
    }, [title]);
    return null;
  }
  return <head>{children}</head>;
};

export const DocumentHead = React.memo(Component);
