

## Remove "nothing here yet" hint from category sections

**What**: Remove the empty state hint text from `CategorySection.tsx`. The "+ Add item" card already makes it clear the category is empty.

**Change**: In `src/components/CategorySection.tsx`, delete lines 74-79 (the `isEmpty &&` paragraph block).

