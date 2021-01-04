import React, {ReactNode} from 'react';

interface ElseProps {
  elseView?: ReactNode;
  children: ReactNode;
}
const ElseComponent: React.FC<ElseProps> = ({children, elseView}) => {
  const arr: ReactNode[] = [];
  React.Children.forEach(children, (item) => {
    item && arr.push(item);
  });
  if (arr.length > 0) {
    return <>{arr}</>;
  }
  return <>{elseView}</>;
};

export default React.memo(ElseComponent);
