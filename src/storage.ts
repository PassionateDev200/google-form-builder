import { Form, FormResponse } from './interfaces';

const FORMS_STORAGE_KEY = 'googleFormsClone_Forms';
const RESPONSES_STORAGE_KEY = 'googleFormsClone_Responses';

/**
 * Generates a simple unique ID.
 * Note: For production, a more robust UUID library might be preferred.
 * @returns A unique string identifier.
 */
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Loads all forms from localStorage.
 * @returns An array of Form objects, or an empty array if none are found or an error occurs.
 */
export function loadForms(): Form[] {
    try {
        const storedForms = localStorage.getItem(FORMS_STORAGE_KEY);
        if (storedForms) {
            // Add basic validation if needed (e.g., check if it's an array)
            return JSON.parse(storedForms) as Form[];
        }
    } catch (error) {
        console.error("Error loading forms from localStorage:", error);
        // Optionally clear corrupted data: localStorage.removeItem(FORMS_STORAGE_KEY);
    }
    return []; // Return empty array if no data or error
}

/**
 * Saves the entire list of forms to localStorage.
 * @param forms The array of Form objects to save.
 */
export function saveForms(forms: Form[]): void {
    try {
        localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(forms));
    } catch (error) {
        console.error("Error saving forms to localStorage:", error);
        alert("Could not save forms. LocalStorage might be full or disabled.");
    }
}

/**
 * Finds a specific form by its ID.
 * @param formId The ID of the form to find.
 * @param forms The array of forms to search within.
 * @returns The found Form object, or undefined if not found.
 */
export function getFormById(formId: string, forms: Form[]): Form | undefined {
    return forms.find(form => form.id === formId);
}

/**
 * Loads all form responses from localStorage.
 * @returns An array of FormResponse objects, or an empty array if none are found or an error occurs.
 */
export function loadResponses(): FormResponse[] {
    try {
        const storedResponses = localStorage.getItem(RESPONSES_STORAGE_KEY);
        if (storedResponses) {
            return JSON.parse(storedResponses) as FormResponse[];
        }
    } catch (error) {
        console.error("Error loading responses from localStorage:", error);
    }
    return [];
}

/**
 * Saves the entire list of form responses to localStorage.
 * @param responses The array of FormResponse objects to save.
 */
export function saveResponses(responses: FormResponse[]): void {
    try {
        localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify(responses));
    } catch (error) {
        console.error("Error saving responses to localStorage:", error);
        alert("Could not save responses. LocalStorage might be full or disabled.");
    }
}

/**
 * Filters responses to get only those belonging to a specific form.
 * @param formId The ID of the form whose responses are needed.
 * @param allResponses The array of all responses.
 * @returns An array of FormResponse objects for the specified form.
 */
export function getResponsesByFormId(formId: string, allResponses: FormResponse[]): FormResponse[] {
    return allResponses.filter(response => response.formId === formId);
}
