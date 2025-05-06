import { Form, FormResponse, AnyFormField } from './interfaces';
import * as Storage from './storage';
import * as UI from './ui';

let forms: Form[] = [];
let responses: FormResponse[] = [];
let currentView: 'list' | 'builder' | 'viewer' | 'responses' = 'list';
let currentFormId: string | null = null; // ID of the form being edited or viewed

/**
 * Initializes the application. Loads data and renders the initial view.
 */
function initializeApp(): void {
    console.log("Initializing Form Builder App...");
    forms = Storage.loadForms();
    responses = Storage.loadResponses();

    // Initialize UI module with action handlers
    UI.initializeUI({
        navigateToFormBuilder: navigateToFormBuilder,
        navigateToFormViewer: navigateToFormViewer,
        navigateToResponseViewer: navigateToResponseViewer,
        deleteForm: handleDeleteForm,
        saveForm: handleSaveForm,
        submitResponse: handleSubmitResponse,
        goHome: goHome,
    });

    // Render the initial view (form list)
    goHome();
    console.log("App Initialized. Forms loaded:", forms.length, "Responses loaded:", responses.length);
}

/**
 * Navigates to the main form list view.
 */
function goHome(): void {
    currentView = 'list';
    currentFormId = null;
    UI.renderFormList(forms);
}

/**
 * Navigates to the form builder view.
 * @param formId The ID of the form to edit, or undefined to create a new form.
 */
function navigateToFormBuilder(formId?: string): void {
    currentView = 'builder';
    let formToEdit: Form;

    if (formId) {
        const foundForm = Storage.getFormById(formId, forms);
        if (foundForm) {
            // Deep copy the form to prevent modifying the original state directly during editing
            formToEdit = JSON.parse(JSON.stringify(foundForm));
            currentFormId = formId;
        } else {
            console.error(`Form with ID ${formId} not found. Navigating to new form.`);
            // Fallback to creating a new form if ID is invalid
            formToEdit = createNewForm();
            currentFormId = formToEdit.id; // Assign the new ID
        }
    } else {
        // Create a new form structure
        formToEdit = createNewForm();
        currentFormId = formToEdit.id; // Assign the new ID
    }
    UI.renderFormBuilder(formToEdit);
}

/**
 * Creates a default structure for a new form.
 * @returns A new Form object with a unique ID.
 */
function createNewForm(): Form {
    return {
        id: Storage.generateId(), // Generate a unique ID for the new form
        title: '', // Start with an empty title
        fields: [], // Start with no fields
    };
}


/**
 * Navigates to the form viewer/preview screen.
 * @param formId The ID of the form to view.
 */
function navigateToFormViewer(formId: string): void {
    const formToView = Storage.getFormById(formId, forms);
    if (formToView) {
        currentView = 'viewer';
        currentFormId = formId;
        UI.renderFormViewer(formToView);
    } else {
        console.error(`Cannot view form: Form with ID ${formId} not found.`);
        alert("Error: Could not find the form to view.");
        goHome(); // Go back to list if form not found
    }
}

/**
 * Navigates to the response viewer screen for a specific form.
 * @param formId The ID of the form whose responses are to be viewed.
 */
function navigateToResponseViewer(formId: string): void {
     const form = Storage.getFormById(formId, forms);
     if (form) {
        currentView = 'responses';
        currentFormId = formId;
        const formResponses = Storage.getResponsesByFormId(formId, responses);
        UI.renderResponseViewer(form, formResponses);
     } else {
        console.error(`Cannot view responses: Form with ID ${formId} not found.`);
        alert("Error: Could not find the form.");
        goHome();
     }
}

/**
 * Handles the saving of a form (new or edited).
 * Updates the state and persists to storage.
 * @param form The form data received from the UI builder.
 */
function handleSaveForm(form: Form): void {
    if (!form || !form.id) {
        console.error("Save failed: Invalid form data received.", form);
        alert("Error: Could not save the form due to invalid data.");
        return;
    }
     // Basic validation: Ensure title is not empty (optional but good practice)
    if (!form.title.trim()) {
        alert("Please provide a title for the form.");
        return; // Prevent saving without a title
    }

    // Find if the form already exists
    const existingIndex = forms.findIndex(f => f.id === form.id);

    if (existingIndex > -1) {
        // Update existing form
        forms[existingIndex] = form;
        console.log(`Form updated: ${form.id}`);
    } else {
        // Add new form
        forms.push(form);
        console.log(`Form added: ${form.id}`);
    }

    Storage.saveForms(forms); // Persist changes to localStorage
    alert(`Form "${form.title || 'Untitled Form'}" saved successfully!`);
    goHome(); // Navigate back to the list view after saving
}

/**
 * Handles the deletion of a form.
 * Removes the form and its associated responses from state and storage.
 * @param formId The ID of the form to delete.
 */
function handleDeleteForm(formId: string): void {
    // Filter out the form to be deleted
    const updatedForms = forms.filter(form => form.id !== formId);

    if (updatedForms.length < forms.length) { // Check if a form was actually removed
        forms = updatedForms;
        Storage.saveForms(forms); // Save updated forms list

        // Also delete associated responses
        const updatedResponses = responses.filter(response => response.formId !== formId);
        if (updatedResponses.length < responses.length) {
            responses = updatedResponses;
            Storage.saveResponses(responses); // Save updated responses list
            console.log(`Responses for form ${formId} deleted.`);
        }

        console.log(`Form deleted: ${formId}`);
        alert("Form deleted successfully.");
        // If the currently viewed/edited form was deleted, go home
        if (currentFormId === formId) {
            goHome();
        } else {
            // Otherwise, just re-render the current view (likely the list)
             if (currentView === 'list') {
                UI.renderFormList(forms);
            }
        }
    } else {
        console.error(`Delete failed: Form with ID ${formId} not found.`);
        alert("Error: Could not find the form to delete.");
    }
}

/**
 * Handles the submission of a form response.
 * Creates a response object, adds it to the state, and persists.
 * @param formId The ID of the form being submitted.
 * @param responseData The collected key-value pairs of responses.
 */
function handleSubmitResponse(formId: string, responseData: { [fieldId: string]: string | string[] }): void {
    const formExists = Storage.getFormById(formId, forms);
    if (!formExists) {
        console.error(`Submit failed: Form with ID ${formId} not found.`);
        alert("Error: Cannot submit response, the form no longer exists.");
        return;
    }

    const newResponse: FormResponse = {
        id: Storage.generateId(), // Unique ID for this submission
        formId: formId,
        submittedAt: Date.now(), // Timestamp
        responses: responseData,
    };

    responses.push(newResponse); // Add to in-memory list
    Storage.saveResponses(responses); // Persist to localStorage
    console.log(`Response submitted for form ${formId}:`, newResponse);
}


// Ensure the DOM is fully loaded before initializing the app
document.addEventListener('DOMContentLoaded', initializeApp);

