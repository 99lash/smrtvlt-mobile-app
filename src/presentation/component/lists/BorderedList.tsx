import React, { ReactElement } from 'react';
import { FlatList, View, Text, Pressable } from 'react-native';

type BorderedListProps<T> = {
  data: T[];
  keyExtractor?: (item: T, index: number) => string;
  renderItem?: (item: T, index: number, isSelected: boolean) => React.ReactNode;
  onItemPress?: (item: T, index: number) => void;
  iconExtractor?: (item: T, index: number) => React.ReactElement | null; // left icon
  rightContentExtractor?: (item: T, index: number) => React.ReactElement | null; // right content
  className?: string;
  maxVisibleItems?: number; // max items before scroll
  itemHeight?: number; // estimated row height
  selectedId?: string;
  getId?: (item: T) => string;
  itemGap?: number; // gap between items in pixels
};

function BorderedList<T>({
  data,
  keyExtractor = (_, index) => index.toString(),
  renderItem,
  onItemPress,
  iconExtractor,
  rightContentExtractor,
  className = '',
  maxVisibleItems = 5,
  itemHeight = 56,
  selectedId,
  getId,
  itemGap = 8, // default 8px gap
}: BorderedListProps<T>) {
  const maxHeight = maxVisibleItems * itemHeight;

  return (
    <View
      className={`bg-bg-default overflow-hidden  ${className}`}
    >
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={() => <View style={{ height: itemGap }} />}
        contentContainerStyle={{ padding: itemGap }}
        style={{ maxHeight }}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        renderItem={({ item, index }) => {
          const leftIcon = iconExtractor?.(item, index);
          const rightContent = rightContentExtractor?.(item, index);
          const isSelected =
            selectedId && getId ? selectedId === getId(item) : false;

          return (
            <Pressable
              disabled={!onItemPress}
              onPress={() => onItemPress?.(item, index)}
              className={`flex-row items-center justify-between px-5 py-4 gap-3 rounded-2xl ${
                isSelected ? 'bg-primary-default' : 'bg-surface-default'
              }`}
              style={{
                minHeight: itemHeight,
                maxHeight,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center flex-1">
                {leftIcon && <View className="mr-3">{leftIcon}</View>}
                {renderItem ? (
                  renderItem(item, index, isSelected)
                ) : (
                  <Text
                    className={`flex-1 ${
                      isSelected
                        ? 'text-primary-dark font-semibold'
                        : 'text-text-default dark:text-text-dark'
                    }`}
                    style={{ flexWrap: 'wrap' }}
                  >
                    {String(item)}
                  </Text>
                )}
              </View>

              {rightContent && <View className="ml-3">{rightContent}</View>}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

export default BorderedList;
