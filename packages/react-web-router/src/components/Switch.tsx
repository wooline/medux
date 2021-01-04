import React, {ReactNode} from 'react';

interface SwitchProps {
  elseView?: ReactNode;
  children: ReactNode;
}
const SwitchComponent: React.FC<SwitchProps> = ({children, elseView}) => {
  const arr: ReactNode[] = [];
  React.Children.forEach(children, (item) => {
    item && arr.push(item);
  });
  if (arr.length > 0) {
    return <>{arr[0]}</>;
  }
  return <>{elseView}</>;
};

export default React.memo(SwitchComponent);
