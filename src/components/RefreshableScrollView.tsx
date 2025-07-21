import React, { ReactNode } from 'react';
import { RefreshControl, ScrollView, ScrollViewProps } from 'react-native';

interface RefreshableScrollViewProps extends ScrollViewProps {
  children: ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
  refreshColor?: string;
}

const RefreshableScrollView: React.FC<RefreshableScrollViewProps> = ({
  children,
  refreshing,
  onRefresh,
  refreshColor = '#3B82F6',
  ...props
}) => {
  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[refreshColor]}
          tintColor={refreshColor}
        />
      }
      {...props}
    >
      {children}
    </ScrollView>
  );
};

export default RefreshableScrollView;
