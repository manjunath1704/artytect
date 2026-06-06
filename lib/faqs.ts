export type FAQ = {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type FAQFormState = {
  id?: string;
  question: string;
  answer: string;
  display_order: string;
  is_active: boolean;
};

export const emptyFAQForm: FAQFormState = {
  question: "",
  answer: "",
  display_order: "0",
  is_active: true,
};
