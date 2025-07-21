import React, { memo, useCallback } from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';

interface MemoizedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  emptyText?: string;
  loadingText?: string;
  onEndReachedThreshold?: number;
  contentContainerStyle?: any;
}

function MemoizedList<T>({
  data,
  renderItem,
  keyExtractor,
  isLoading = false,
  emptyText = 'No items found',
  loadingText = 'Loading...',
  onEndReachedThreshold = 0.5,
  contentContainerStyle,
  ...rest
}: MemoizedListProps<T>) {
  // Memoize the render item function
  const memoizedRenderItem: ListRenderItem<T> = useCallback(
    ({ item, index }) => renderItem(item, index),
    [renderItem]
  );

  // Empty list component
  const ListEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.emptyText}>{loadingText}</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }, [isLoading, emptyText, loadingText]);

  // List footer component
  const ListFooterComponent = useCallback(() => {
    if (isLoading && data.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.footerText}>{loadingText}</Text>
        </View>
      );
    }
    
    return null;
  }, [isLoading, data.length, loadingText]);

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      onEndReachedThreshold={onEndReachedThreshold}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={10}
      initialNumToRender={10}
      contentContainerStyle={[
        styles.contentContainer,
        data.length === 0 && styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
  footerContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
});

export default memo(MemoizedList) as typeof MemoizedList;
