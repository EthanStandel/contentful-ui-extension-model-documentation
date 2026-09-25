import type { FieldAPI } from "@contentful/app-sdk";

// renderCustomActions only receives the creatable content types, so the
// linkable set is re-derived from the field's validations (field-level, plus
// item-level for arrays). `null` means no restriction.
export const getLinkableContentTypeIds = (field: FieldAPI): string[] | null => {
  const validations = [
    ...(field.validations ?? []),
    ...(field.type === "Array" ? (field.items?.validations ?? []) : []),
  ];

  return (
    validations.find((validation) => "linkContentType" in validation)
      ?.linkContentType ?? null
  );
};
