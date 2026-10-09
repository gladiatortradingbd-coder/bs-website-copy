"use client";

import FlexCarousel from "@/components/ui/FlexCarousel";

export default function HomepageCategoryCarousel({ items }) {
  return (
    <FlexCarousel
      items={items}
      preset="liquid"
      intro="rise"
      fit="portrait"
      cardHeight={0.62}
      gap={16}
      radius={22}
      squeeze={0.18}
      focusOnClick
      captions
      onSelect={(_, item) => {
        if (item?.href) {
          window.location.href = item.href;
        }
      }}
    />
  );
}
