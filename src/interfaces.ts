/**
 * Defines the possible types for form fields.
 */
export type FieldType = 'text' | 'radio' | 'checkbox';

/**
 * Represents a single option for multiple-choice or checkbox fields.
 */
export interface FormFieldOption {
    id: string; // Unique identifier for the option
    value: string; // The value submitted when selected
    label: string; // The text displayed to the user
}

/**
 * Base interface for all form fields.
 */
export interface FormField {
    id: string; // Unique identifier for the field
    type: FieldType; // The type of the field
    label: string; // The question or prompt for the field
    required?: boolean; // Optional: Indicates if the field must be filled (for validation)
}

/**
 * Interface for a text input field. Inherits from FormField.
 */
export interface TextField extends FormField {
    type: 'text';
}

/**
 * Interface for a multiple-choice (radio button) field. Inherits from FormField.
 */
export interface RadioField extends FormField {
    type: 'radio';
    options: FormFieldOption[]; // List of available options
}

/**
 * Interface for a checkbox field. Inherits from FormField.
 */
export interface CheckboxField extends FormField {
    type: 'checkbox';
    options: FormFieldOption[]; // List of available options
}

/**
 * Union type representing any possible form field.
 * Helps ensure type safety when working with mixed field types.
 */
export type AnyFormField = TextField | RadioField | CheckboxField;

/**
 * Represents the structure of a single form.
 */
export interface Form {
    id: string; // Unique identifier for the form
    title: string; // The title of the form
    fields: AnyFormField[]; // Array containing all fields in the form
}

/**
 * Represents a single submission of a form.
 */
export interface FormResponse {
    id: string; // Unique identifier for this specific submission
    formId: string; // ID of the form that was submitted
    submittedAt: number; // Timestamp (e.g., Date.now()) when the form was submitted
    // Stores responses keyed by the field ID.
    // Value can be string (text, radio) or string[] (checkbox).
    responses: { [fieldId: string]: string | string[] };
}
