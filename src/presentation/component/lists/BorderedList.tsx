import React, { ReactElement } from "react";
import { FlatList, View, Text, TouchableOpacity } from "react-native";

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
};

function BorderedList<T>({
  data,
  keyExtractor = (_, index) => index.toString(),
  renderItem,
  onItemPress,
  iconExtractor,
  rightContentExtractor,
  className = "",
  maxVisibleItems = 5,
  itemHeight = 56,
  selectedId,
  getId,
}: BorderedListProps<T>) {
  const maxHeight = maxVisibleItems * itemHeight;

  return (
    <View
      className={`border border-neutral-border rounded-xl overflow-hidden ${className}`}
      style={{ maxHeight }}
    >
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => {
          const leftIcon = iconExtractor?.(item, index);
          const rightContent = rightContentExtractor?.(item, index);
          const isSelected = selectedId && getId ? selectedId === getId(item) : false;

          return (
            <TouchableOpacity
              disabled={!onItemPress}
              onPress={() => onItemPress?.(item, index)}
              className={`flex-row items-center justify-between p-3 border-b border-neutral-border ${
                index === data.length - 1 ? "border-b-0" : ""
              } ${isSelected ? "bg-primary-light" : "bg-neutral-surface"}`}
              style={{ minHeight: itemHeight }}
            >
              <View className="flex-row items-center flex-1">
                {leftIcon && <View className="mr-2">{leftIcon}</View>}
                {renderItem ? (
                  renderItem(item, index, isSelected)
                ) : (
                  <Text
                    className={`flex-1 ${isSelected ? "bg-neutral-surface" : "text-neutral-text"}`}
                    style={{ flexWrap: "wrap" }}
                  >
                    {String(item)}
                  </Text>
                )}
              </View>

              {rightContent && <View className="ml-2">{rightContent}</View>}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

export default BorderedList;
